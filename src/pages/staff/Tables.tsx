import { useCallback, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import TableMapView from '@/components/TableMapView';
import TableDetailModal from '@/components/TableDetailModal';
import AddTableModal from '@/components/AddTableModal';
import TableBookingModal from '@/components/TableBookingModal';
import { type TableData, type TableStatus } from '@/data/tables';

const BASE_URL = 'http://192.168.1.3:8000';
const TABLES_LIST_ENDPOINT = '/api/tables/list/';
const TABLES_CREATE_ENDPOINT = '/api/tables/create/';
const TABLE_SESSION_CREATE_ENDPOINT = '/api/tables/session/create/';
const TABLE_SESSION_ACTIVE_ENDPOINT = '/api/tables/session/active/';

const mapApiStatus = (status?: string): TableStatus => {
  const normalized = (status ?? '').toLowerCase();
  if (
    normalized === 'available' ||
    normalized === 'occupied' ||
    normalized === 'reserved' ||
    normalized === 'cleaning' ||
    normalized === 'disabled'
  ) {
    return normalized;
  }
  return 'available';
};

const parseTableNumber = (value: unknown, fallback: number): number => {
  const raw = String(value ?? '');
  const direct = Number(raw);
  if (!Number.isNaN(direct) && Number.isFinite(direct)) return direct;

  const digits = raw.replace(/\D/g, '');
  const parsed = Number(digits);
  if (!Number.isNaN(parsed) && Number.isFinite(parsed) && parsed > 0) return parsed;
  return fallback;
};

const toArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const getSessionTableId = (session: any): string =>
  String(session.table_id ?? session.table?.id ?? session.table ?? '');

const getOrderIdFromTablePayload = (raw: any): string | null => {
  const candidate =
    raw.order_id ??
    raw.orderId ??
    raw.active_order_id ??
    raw.current_order_id ??
    raw.order?.id ??
    raw.active_order?.id ??
    raw.current_order?.id;
  if (candidate === null || candidate === undefined || candidate === '') return null;
  return String(candidate);
};

const getTokenNumberFromPayload = (raw: any): string | undefined => {
  const candidate = raw.token_number ?? raw.tokenNumber ?? raw.session?.token_number ?? raw.active_session?.token_number;
  if (candidate === null || candidate === undefined || candidate === '') return undefined;
  return String(candidate);
};

const getSessionIdFromPayload = (raw: any): string | null => {
  const candidate = raw.id ?? raw.session_id ?? raw.session?.id ?? raw.active_session?.id;
  if (candidate === null || candidate === undefined || candidate === '') return null;
  return String(candidate);
};

const mergeTableWithSession = (table: TableData, session?: any): TableData => {
  if (!session) return table;

  const startedAt = session.created_at ? new Date(session.created_at).getTime() : null;
  const duration = startedAt ? Math.max(0, Math.floor((Date.now() - startedAt) / 60000)) : table.duration;
  const orderSource = session.active_order ?? session.current_order ?? session.order ?? null;
  const orderId = orderSource?.id ?? session.order_id ?? session.active_order_id ?? session.current_order_id;
  const itemsSource = orderSource?.items ?? session.order_items ?? [];
  const items = Array.isArray(itemsSource)
    ? itemsSource.map((item: any) => ({
        name: String(item?.name ?? item?.item_name ?? 'Item'),
        qty: Number(item?.qty ?? item?.quantity ?? 1),
        price: Number(item?.price ?? item?.unit_price ?? 0),
      }))
    : [];
  const rawProgress = Number(orderSource?.progress ?? session.order_progress ?? 0);
  const progress = Math.max(0, Math.min(100, Number.isFinite(rawProgress) ? rawProgress : 0));
  const rawTotal = Number(orderSource?.total_amount ?? orderSource?.total ?? session.order_total ?? 0);
  const total = Number.isFinite(rawTotal) ? rawTotal : 0;

  return {
    ...table,
    status: 'occupied',
    guests: Number(session.guest_count ?? session.guests ?? session.party_size ?? table.guests),
    tokenNumber: getTokenNumberFromPayload(session) ?? table.tokenNumber,
    customerName: session.customer_name ?? table.customerName,
    duration,
    order: orderId
      ? {
          id: String(orderId),
          items,
          total,
          progress,
        }
      : table.order,
  };
};

const normalizeTable = (raw: any, index: number): TableData => {
  const orderId = getOrderIdFromTablePayload(raw);

  return {
    // `/api/tables/list/` returns `order_id` for occupied tables.
    // Seed the UI with that ID immediately; session endpoint can later enrich it.
    order: orderId
      ? {
          id: orderId,
          items: [],
          total: Number(raw.order_total ?? 0),
          progress: Number(raw.order_progress ?? 0),
        }
      : undefined,
    id: String(raw.id ?? `table-${index + 1}`),
    number: parseTableNumber(raw.number ?? raw.table_number, index + 1),
    capacity: Number(raw.capacity ?? 2),
    guests: Number(raw.guests ?? raw.current_guests ?? 0),
    status: mapApiStatus(raw.status),
    tokenNumber: getTokenNumberFromPayload(raw),
    duration: Number(raw.duration ?? 0),
    revenue: Number(raw.revenue ?? raw.total_revenue ?? 0),
    customerName: raw.customer_name ?? raw.customer?.name ?? raw.customer ?? undefined,
    notes: raw.notes ?? raw.floor ?? undefined,
    experienceScore: Number(raw.experience_score ?? 0),
    position: {
      x: Number(raw.position?.x ?? ((index % 4) * 25 + 5)),
      y: Number(raw.position?.y ?? (Math.floor(index / 4) * 30 + 5)),
    },
    shape: raw.shape === 'round' || raw.shape === 'square' || raw.shape === 'rect' ? raw.shape : 'square',
  };
};

const Index = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const loadTables = useCallback(async () => {
    const token = localStorage.getItem('access');
    if (!token) {
      setTables([]);
      setIsLoadingTables(false);
      return;
    }

    try {
      setIsLoadingTables(true);
      const [tablesRes, sessionsRes] = await Promise.all([
        fetch(`${BASE_URL}${TABLES_LIST_ENDPOINT}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}${TABLE_SESSION_ACTIVE_ENDPOINT}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!tablesRes.ok) throw new Error('Failed to fetch table list');
      const tableJson = await tablesRes.json();
      const normalized = toArray(tableJson).map((t, idx) => normalizeTable(t, idx));

      if (sessionsRes.ok) {
        const sessionsJson = await sessionsRes.json();
        const sessions = toArray(sessionsJson);
        const merged = normalized.map((table) => {
          const match = sessions.find((s) => getSessionTableId(s) === table.id);
          return mergeTableWithSession(table, match);
        });
        setTables(merged);
        return;
      }

      setTables(normalized);
    } catch (error) {
      console.error('Tables API fetch failed:', error);
      setTables([]);
    } finally {
      setIsLoadingTables(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const filtered = tables;

  const handleTableClick = async (table: TableData) => {
    if (table.status === 'available') {
      setSelectedTable(table);
      setBookingModalOpen(true);
      return;
    }

    setSelectedTable(table);
    setModalOpen(true);

    const token = localStorage.getItem('access');
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}${TABLE_SESSION_ACTIVE_ENDPOINT}table/${table.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      const session = Array.isArray(data) ? data[0] : data;
      if (!session || (Array.isArray(data) && data.length === 0)) return;

      setSelectedTable((prev) => (prev && prev.id === table.id ? mergeTableWithSession(prev, session) : prev));
    } catch (error) {
      console.error('Failed to fetch active table session:', error);
    }
  };

  const handleStatusChange = (tableId: string, status: TableStatus) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        const reset = status === 'available' || status === 'cleaning' || status === 'disabled';
        return {
          ...t,
          status,
          guests: reset ? 0 : t.guests,
          duration: reset ? 0 : t.duration,
          order: reset ? undefined : t.order,
          customerName: reset ? undefined : t.customerName,
          revenue: reset ? 0 : t.revenue,
          experienceScore: reset ? 0 : t.experienceScore,
        };
      })
    );

    const token = localStorage.getItem('access');
    if (!token) return;

    if (status === 'occupied') {
      const tableToBook = tables.find((t) => t.id === tableId) ?? null;
      setSelectedTable(tableToBook);
      setModalOpen(false);
      setBookingModalOpen(true);
    }

    // Update selected table too
    setSelectedTable((prev) => {
      if (!prev || prev.id !== tableId) return prev;
      const reset = status === 'available' || status === 'cleaning' || status === 'disabled';
      return {
        ...prev,
        status,
        guests: reset ? 0 : prev.guests,
        duration: reset ? 0 : prev.duration,
        order: reset ? undefined : prev.order,
        customerName: reset ? undefined : prev.customerName,
        revenue: reset ? 0 : prev.revenue,
        experienceScore: reset ? 0 : prev.experienceScore,
      };
    });
  };

  const summary = useMemo(() => {
    const s = { available: 0, occupied: 0, reserved: 0, cleaning: 0, disabled: 0 };
    tables.forEach((t) => s[t.status]++);
    return s;
  }, [tables]);

  const handleAddTable = async (form: { number: string; floor: string; capacity: number }) => {
    if (isSaving) return;
    setIsSaving(true);

    const token = localStorage.getItem('access');
    if (!token) {
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        number: form.number,
        floor: form.floor,
        capacity: form.capacity,
      };

      const res = await fetch(`${BASE_URL}${TABLES_CREATE_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Create table failed');

      await loadTables();
      setAddModalOpen(false);
    } catch (error) {
      console.error('Failed to create table in API:', error);
      window.alert('Failed to create table');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSession = async (payload: { table: string; customer_name: string; customer_phone: string; guest_count: number }) => {
    const token = localStorage.getItem('access');
    if (!token || isBooking) return;

    setIsBooking(true);
    try {
      const res = await fetch(`${BASE_URL}${TABLE_SESSION_CREATE_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.detail || 'Failed to create table session');
      }

      const session = await res.json();
      const orderId = getOrderIdFromTablePayload(session);
      const sessionId = getSessionIdFromPayload(session);
      setBookingModalOpen(false);
      await loadTables();
      const params = new URLSearchParams({
        table_number: String(session?.table_number ?? ''),
        token_number: String(session?.token_number ?? ''),
        customer_name: String(session?.customer_name ?? ''),
      });
      if (sessionId) params.set('session', sessionId);
      if (orderId) params.set('order', orderId);
      navigate(`/staff/pos?${params.toString()}`);
    } catch (error: any) {
      console.error('Failed to create table session:', error);
      window.alert(error?.message || 'Unable to create table session');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-warning/10">

      <div className="flex">
        {/* Main content */}
        <main className="relative flex-1 space-y-5 overflow-x-hidden p-6">
          <div className="pointer-events-none absolute -top-20 -right-24 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-warning/15 blur-3xl" />

          {/* Status summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-white/85 via-primary/10 to-white/85 p-4 shadow-sm"
          >
            <div className="flex items-center gap-6">
              {[
                { label: 'Available', count: summary.available, dot: 'bg-primary' },
                { label: 'Occupied', count: summary.occupied, dot: 'bg-warning' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3 py-1.5">
                  <span className={`h-3 w-3 rounded-full ${s.dot}`} />
                  <span className="text-sm font-medium text-foreground">{s.count}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>

            <Button
              size="sm"
              className="h-8 gap-1.5 border border-primary/30 bg-gradient-to-r from-primary to-primary/80 text-xs text-primary-foreground shadow-sm hover:from-primary/90 hover:to-primary"
              onClick={() => setAddModalOpen(true)}
              disabled={isSaving}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Table
            </Button>
          </motion.div>

          {/* Map */}
          {isLoadingTables ? (
            <div className="rounded-xl border border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
              Loading tables...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
              No tables found.
            </div>
          ) : (
            <TableMapView tables={filtered} onTableClick={handleTableClick} />
          )}
        </main>
      </div>

      <TableDetailModal
        table={selectedTable}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onStatusChange={handleStatusChange}
      />

      <AddTableModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        isSaving={isSaving}
        defaultNumber={`A${(Math.max(...tables.map((t) => t.number), 0) || 0) + 1}`}
        onSubmit={handleAddTable}
      />

      <TableBookingModal
        open={bookingModalOpen}
        table={selectedTable}
        isSubmitting={isBooking}
        onOpenChange={setBookingModalOpen}
        onSubmit={handleCreateSession}
      />
    </div>
  );
};

export default Index;
