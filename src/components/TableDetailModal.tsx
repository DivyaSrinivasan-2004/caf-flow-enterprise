import { type TableData, type TableStatus, statusConfig } from '@/data/tables';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, ShoppingBag, Ticket, UserRound, Users } from 'lucide-react';

interface Props {
  table: TableData | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (tableId: string, status: TableStatus) => void;
}

export default function TableDetailModal({ table, open, onClose, onStatusChange }: Props) {
  if (!table) return null;
  const cfg = statusConfig[table.status];
  const statusBadgeClass = table.status === 'occupied'
    ? 'bg-warning/20 text-warning border-warning/40'
    : 'bg-primary/15 text-foreground border-primary/30';
  void onStatusChange;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto border-primary/25 bg-gradient-to-br from-white via-primary/10 to-warning/10 sm:max-w-md">
        <div className="pointer-events-none absolute -top-20 -right-10 h-44 w-44 rounded-full bg-warning/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-8 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />

        <DialogHeader className="relative">
          <DialogTitle className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Table Details</p>
              <span className="text-xl font-semibold text-foreground">T-{table.number}</span>
            </div>
            <Badge variant="secondary" className={`gap-1.5 border ${statusBadgeClass}`}>
              <span className={`h-2 w-2 rounded-full ${cfg.dotClass}`} />
              {cfg.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="relative mt-2 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-primary/20 bg-white/85 p-3">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Guests</span>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-muted-foreground" />
                {table.guests}/{table.capacity}
              </p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-white/85 p-3">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Duration</span>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {table.duration > 0 ? `${table.duration}m` : '-'}
              </p>
            </div>
          </div>

          {table.customerName && (
            <div className="rounded-xl border border-primary/20 bg-white/85 p-3">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Customer</span>
              <p className="mt-1 flex items-center gap-1 text-sm font-medium text-foreground">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{table.customerName}</span>
              </p>
            </div>
          )}

          {table.status === 'occupied' && table.tokenNumber && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-3">
              <span className="text-[11px] uppercase tracking-wide text-warning/90">Token No</span>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-foreground">
                <Ticket className="h-4 w-4 text-warning" />
                {table.tokenNumber}
              </p>
            </div>
          )}

          {table.order && (
            <div className="rounded-xl border border-primary/20 bg-white/85 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                  <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                  {table.order.id}
                </span>
                <span className="text-sm font-bold text-foreground">${table.order.total.toFixed(2)}</span>
              </div>

              <div className="mb-3 space-y-1">
                {table.order.items.length > 0 ? table.order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-muted-foreground">
                    <span>{item.name} x {item.qty}</span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground">No items added yet.</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Progress</span>
                <Progress value={table.order.progress} className="h-1.5 flex-1" />
                <span className="text-xs font-medium text-foreground">{table.order.progress}%</span>
              </div>
            </div>
          )}

          {!table.order && table.status === 'occupied' && (
            <div className="rounded-xl border border-primary/20 bg-white/85 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Order</span>
                <span className="font-medium text-foreground">Not started</span>
              </div>
            </div>
          )}

          {table.notes && (
            <div className="rounded-xl border border-primary/20 bg-white/85 p-3">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Notes</span>
              <p className="mt-1 text-xs text-foreground">{table.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-1 rounded-lg border border-dashed border-primary/35 bg-white/70 px-3 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Experience Score</span>
            <span className="font-semibold text-foreground">{table.experienceScore}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.max(0, Math.min(100, table.experienceScore))}%` }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}