import { useState } from 'react';

type TableStatus = 'free' | 'busy' | 'reserved' | 'cleaning';

interface TableData {
  id: number;
  number: string;
  seats: number;
  status: TableStatus;
  guests?: number;
  timer?: string;
  total?: string;
  staff?: string;
}

const tables: TableData[] = [
  { id: 1, number: 'T-1', seats: 4, status: 'busy', guests: 3, timer: '45m', total: '$42.50', staff: 'Alex' },
  { id: 2, number: 'T-2', seats: 2, status: 'busy', guests: 2, timer: '20m', total: '$18.00', staff: 'Alex' },
  { id: 3, number: 'T-3', seats: 6, status: 'free' },
  { id: 4, number: 'T-4', seats: 4, status: 'reserved' },
  { id: 5, number: 'T-5', seats: 4, status: 'busy', guests: 4, timer: '1h 10m', total: '$78.30', staff: 'Maria' },
  { id: 6, number: 'T-6', seats: 2, status: 'cleaning' },
  { id: 7, number: 'T-7', seats: 8, status: 'free' },
  { id: 8, number: 'T-8', seats: 4, status: 'busy', guests: 2, timer: '35m', total: '$28.00', staff: 'Alex' },
  { id: 9, number: 'T-9', seats: 2, status: 'free' },
  { id: 10, number: 'T-10', seats: 6, status: 'reserved' },
  { id: 11, number: 'T-11', seats: 4, status: 'free' },
  { id: 12, number: 'T-12', seats: 2, status: 'busy', guests: 1, timer: '10m', total: '$8.50', staff: 'Maria' },
  { id: 13, number: 'T-13', seats: 4, status: 'free' },
  { id: 14, number: 'T-14', seats: 6, status: 'cleaning' },
  { id: 15, number: 'T-15', seats: 4, status: 'free' },
];

const statusColors: Record<TableStatus, string> = {
  free: 'bg-card border-success/30 hover:border-success',
  busy: 'bg-warning/5 border-warning/40',
  reserved: 'bg-muted border-muted-foreground/20',
  cleaning: 'bg-info/5 border-info/30',
};

const statusLabels: Record<TableStatus, string> = {
  free: 'Available',
  busy: 'Occupied',
  reserved: 'Reserved',
  cleaning: 'Cleaning',
};

const Tables = () => {
  const busyCount = tables.filter(t => t.status === 'busy').length;
  const freeCount = tables.filter(t => t.status === 'free').length;

  return (
    <div className="space-y-[24px] animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Table Management</h1>
          <p className="text-sm text-muted-foreground">{busyCount} occupied · {freeCount} available</p>
        </div>
        <div className="flex gap-[12px]">
          {(['free', 'busy', 'reserved', 'cleaning'] as TableStatus[]).map(s => (
            <div key={s} className="flex items-center gap-[6px]">
              <div className={`w-3 h-3 rounded-full ${s === 'free' ? 'bg-success' : s === 'busy' ? 'bg-warning' : s === 'reserved' ? 'bg-muted-foreground' : 'bg-info'}`} />
              <span className="text-xs text-muted-foreground capitalize">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[16px]">
        {tables.map(table => (
          <button
            key={table.id}
            className={`rounded-lg border-2 p-[20px] text-center transition-all hover:shadow-card-hover hover:-translate-y-0.5 ${statusColors[table.status]}`}
          >
            <p className="text-lg font-bold text-foreground">{table.number}</p>
            <p className="text-xs text-muted-foreground mb-[8px]">{table.seats} seats</p>
            <span className={`inline-block px-[8px] py-[2px] rounded-full text-[10px] font-semibold ${
              table.status === 'free' ? 'bg-success/10 text-success' :
              table.status === 'busy' ? 'bg-warning/10 text-warning' :
              table.status === 'reserved' ? 'bg-muted text-muted-foreground' :
              'bg-info/10 text-info'
            }`}>
              {statusLabels[table.status]}
            </span>
            {table.status === 'busy' && (
              <div className="mt-[8px] space-y-[2px]">
                <p className="text-xs text-muted-foreground">{table.guests} guests · {table.timer}</p>
                <p className="text-sm font-bold text-foreground">{table.total}</p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tables;
