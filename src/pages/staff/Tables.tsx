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

/* ================= CONFIG ================= */

const BASE_URL = 'http://192.168.1.3:8000';

const TABLES_LIST_ENDPOINT = '/api/tables/list/';
const TABLES_CREATE_ENDPOINT = '/api/tables/create/';
const TABLE_SESSION_CREATE_ENDPOINT = '/api/tables/session/create/';
const TABLE_ACTIVE_SESSION_BY_TABLE_ENDPOINT = (tableId: string) =>
  `/api/tables/session/active/table/${tableId}/`;

/* ================= HELPERS ================= */

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

  if (!Number.isNaN(parsed) && Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
};

const toArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const getOrderIdFromTablePayload = (raw: any): string | null => {
  const candidate =
    raw.order_id ??
    raw.orderId ??
    raw.active_order_id ??
    raw.current_order_id ??
    raw.order?.id;

  if (!candidate) return null;

  return String(candidate);
};

const extractErrorMessage = (payload: any): string => {
  if (!payload) return 'Booking failed';
  if (typeof payload === 'string') return payload;
  return (
    payload.detail ||
    payload.error ||
    payload.message ||
    payload.non_field_errors?.[0] ||
    payload.table?.[0] ||
    'Booking failed'
  );
};

/* ================= NORMALIZER ================= */

const normalizeTable = (raw: any, index: number): TableData => {
  const orderId = getOrderIdFromTablePayload(raw);

  return {
    id: String(raw.id ?? `table-${index + 1}`),

    number: parseTableNumber(raw.number ?? raw.table_number, index + 1),

    capacity: Number(raw.capacity ?? 2),

    guests: Number(raw.guests ?? 0),

    status: mapApiStatus(raw.status),

    tokenNumber: raw.token_number ?? undefined,

    duration: Number(raw.duration ?? 0),

    revenue: Number(raw.revenue ?? 0),

    customerName: raw.customer_name ?? undefined,

    notes: raw.floor ?? undefined,

    experienceScore: Number(raw.experience_score ?? 0),

    order: orderId
      ? {
          id: orderId,
          items: [],
          total: Number(raw.order_total ?? 0),
          progress: Number(raw.order_progress ?? 0),
        }
      : undefined,

    position: {
      x: Number(raw.position?.x ?? ((index % 4) * 25 + 5)),
      y: Number(raw.position?.y ?? (Math.floor(index / 4) * 30 + 5)),
    },

    shape:
      raw.shape === 'round' ||
      raw.shape === 'square' ||
      raw.shape === 'rect'
        ? raw.shape
        : 'square',
  };
};

/* ================= COMPONENT ================= */

const Index = () => {
  const navigate = useNavigate();

  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const getToken = () => localStorage.getItem('access');

  const fetchActiveSessionByTable = useCallback(async (tableId: string) => {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(
      `${BASE_URL}${TABLE_ACTIVE_SESSION_BY_TABLE_ENDPOINT(tableId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return null;
    const payload = await res.json();
    const list = toArray(payload);
    return list[0] ?? null;
  }, []);

  /* ================= LOAD TABLES ================= */

  const loadTables = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setTables([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(`${BASE_URL}${TABLES_LIST_ENDPOINT}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to load tables');

      const json = await res.json();

      const normalized = toArray(json).map((t, i) => normalizeTable(t, i));

      setTables(normalized);
    } catch (err) {
      console.error('Load tables failed:', err);
      setTables([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  /* ================= CLICK HANDLER ================= */

  const handleTableClick = (table: TableData) => {
    setSelectedTable(table);

    if (table.status === 'available') {
      setBookingModalOpen(true);
      return;
    }

    setModalOpen(true);
  };

  /* ================= STATUS CHANGE ================= */

  const handleStatusChange = (tableId: string, status: TableStatus) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;

        const reset =
          status === 'available' ||
          status === 'cleaning' ||
          status === 'disabled';

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
  };

  /* ================= SUMMARY ================= */

  const summary = useMemo(() => {
    const s = {
      available: 0,
      occupied: 0,
      reserved: 0,
      cleaning: 0,
      disabled: 0,
    };

    tables.forEach((t) => s[t.status]++);

    return s;
  }, [tables]);

  /* ================= ADD TABLE ================= */

  const handleAddTable = async (form: {
    number: string;
    floor: string;
    capacity: number;
  }) => {
    if (isSaving) return;

    const token = getToken();
    if (!token) return;

    setIsSaving(true);

    try {
      const res = await fetch(`${BASE_URL}${TABLES_CREATE_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Create failed');

      await loadTables();
      setAddModalOpen(false);
    } catch (err) {
      console.error('Add table failed:', err);
      alert('Failed to create table');
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= CREATE SESSION ================= */

  const handleCreateSession = async (payload: {
    table: string;
    customer_name: string;
    customer_phone: string;
    guest_count: number;
  }) => {
    if (isBooking) return;

    const token = getToken();
    if (!token) return;

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
        let errPayload: any = null;
        try {
          errPayload = await res.json();
        } catch {
          // ignore parse failure
        }

        const message = extractErrorMessage(errPayload);

        if (message.toLowerCase().includes('already occupied')) {
          const active = await fetchActiveSessionByTable(payload.table);

          if (active) {
            await loadTables();
            setBookingModalOpen(false);

            const params = new URLSearchParams({
              session: String(active?.id ?? active?.session_id ?? ''),
              table_number: String(
                active?.table_number ??
                  active?.table?.number ??
                  selectedTable?.number ??
                  ''
              ),
              token_number: String(active?.token_number ?? ''),
              customer_name: String(active?.customer_name ?? ''),
            });

            navigate(`/staff/pos?${params.toString()}`);
            return;
          }
        }

        throw new Error(message);
      }

      const session = await res.json();

      setBookingModalOpen(false);
      await loadTables();

      const params = new URLSearchParams({
        session: String(session?.id ?? session?.session_id ?? ''),
        table_number: String(
          session?.table_number ??
            session?.table?.number ??
            selectedTable?.number ??
            ''
        ),
        token_number: String(session?.token_number ?? ''),
        customer_name: String(session?.customer_name ?? ''),
      });

      navigate(`/staff/pos?${params.toString()}`);
    } catch (err: any) {
      console.error('Create session failed:', err);
      alert(err?.message || 'Booking failed');
    } finally {
      setIsBooking(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-warning/10">
      <main className="space-y-5 p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-2xl border border-primary/30 bg-white/80 p-4 shadow-sm"
        >
          <div className="flex gap-6">
            {[
              { label: 'Available', count: summary.available },
              { label: 'Occupied', count: summary.occupied },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5"
              >
                <span className="text-sm font-medium">{s.count}</span>
                <span className="text-xs text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <Button
            size="sm"
            onClick={() => setAddModalOpen(true)}
            disabled={isSaving}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Table
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="rounded-xl border p-8 text-center">
            Loading tables...
          </div>
        ) : tables.length === 0 ? (
          <div className="rounded-xl border p-8 text-center">
            No tables found.
          </div>
        ) : (
          <TableMapView tables={tables} onTableClick={handleTableClick} />
        )}
      </main>

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
        defaultNumber={`A${
          (Math.max(...tables.map((t) => t.number), 0) || 0) + 1
        }`}
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
