import StatusBadge from '@/components/StatusBadge'
import KPICard from '@/components/KPICard'
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Search,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react'
import { useEffect, useState } from 'react'

const API_BASE = 'http://192.168.1.75:8000/api/inventory'

interface Ingredient {
  id: string
  name: string
  unit: string
  current_stock: string
  min_stock: string
}

const Inventory = () => {
  const [items, setItems] = useState<Ingredient[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Ingredient | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const token = localStorage.getItem('access')

  // ================= LOAD DATA =================

  const loadItems = async () => {
    const res = await fetch(`${API_BASE}/ingredients/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setItems(data)
  }

  useEffect(() => {
    loadItems()
  }, [])

  // ================= STATUS LOGIC =================

  const getStatus = (current: number, min: number) => {
    if (current <= 0) return 'out-of-stock'
    if (current <= min) return 'low-stock'
    return 'in-stock'
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  const lowCount = items.filter(
    i => getStatus(Number(i.current_stock), Number(i.min_stock)) === 'low-stock'
  ).length

  const outCount = items.filter(
    i => getStatus(Number(i.current_stock), Number(i.min_stock)) === 'out-of-stock'
  ).length

  // ================= ADD =================

  const handleAdd = async () => {
    const name = (document.getElementById('addName') as HTMLInputElement).value
    const unit = (document.getElementById('addUnit') as HTMLInputElement).value
    const current = (document.getElementById('addCurrent') as HTMLInputElement).value
    const min = (document.getElementById('addMin') as HTMLInputElement).value

    await fetch(`${API_BASE}/ingredients/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        unit,
        current_stock: current,
        min_stock: min
      })
    })

    setShowAdd(false)
    loadItems()
  }

  // ================= EDIT =================

  const handleUpdate = async () => {
    if (!selected) return

    const name = (document.getElementById('editName') as HTMLInputElement).value
    const unit = (document.getElementById('editUnit') as HTMLInputElement).value
    const current = (document.getElementById('editCurrent') as HTMLInputElement).value
    const min = (document.getElementById('editMin') as HTMLInputElement).value

    await fetch(`${API_BASE}/ingredients/${selected.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        unit,
        current_stock: current,
        min_stock: min
      })
    })

    setShowEdit(false)
    loadItems()
  }

  // ================= DELETE =================

  const handleDelete = async () => {
    if (!selected) return

    await fetch(`${API_BASE}/ingredients/${selected.id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    setShowDelete(false)
    loadItems()
  }

  return (
    <div className="space-y-[24px] animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Inventory</h1>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        <KPICard title="Total Items" value={items.length} icon={<Package className="w-5 h-5" />} />
        <KPICard title="Low Stock" value={lowCount} icon={<AlertTriangle className="w-5 h-5" />} trend={{ value: `${lowCount}`, positive: false }} />
        <KPICard title="Out of Stock" value={outCount} icon={<TrendingDown className="w-5 h-5" />} trend={{ value: `${outCount}`, positive: false }} />
      </div>

      {/* SEARCH + ADD */}
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search inventory..."
            className="w-full pl-[36px] pr-[16px] py-[10px] rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="gradient-primary text-white px-[16px] py-[10px] rounded-md text-sm flex items-center gap-[6px]"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-card rounded-lg shadow-soft border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              <th className="px-[24px] py-[12px] text-xs uppercase">Item</th>
              <th className="px-[24px] py-[12px] text-xs uppercase">Stock</th>
              <th className="px-[24px] py-[12px] text-xs uppercase">Min Level</th>
              <th className="px-[24px] py-[12px] text-xs uppercase">Status</th>
              <th className="px-[24px] py-[12px] text-xs uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {filtered.map(i => {
              const status = getStatus(Number(i.current_stock), Number(i.min_stock))

              return (
                <tr key={i.id}>
                  <td className="px-[24px] py-[14px] text-sm font-medium">{i.name}</td>
                  <td className="px-[24px] py-[14px] text-sm font-semibold">
                    {i.current_stock} {i.unit}
                  </td>
                  <td className="px-[24px] py-[14px] text-sm">
                    {i.min_stock} {i.unit}
                  </td>
                  <td className="px-[24px] py-[14px]">
                    <StatusBadge variant={status as any} />
                  </td>
                  <td className="px-[24px] py-[14px] flex gap-[8px]">
                    <button
                      onClick={() => {
                        setSelected(i)
                        setShowEdit(true)
                      }}
                    >
                      <Pencil className="w-4 h-4 text-primary" />
                    </button>

                    <button
                      onClick={() => {
                        setSelected(i)
                        setShowDelete(true)
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <Modal title="Add Item" onClose={() => setShowAdd(false)} onSave={handleAdd} />
      )}

      {/* EDIT MODAL */}
      {showEdit && selected && (
        <Modal
          title="Edit Item"
          ingredient={selected}
          onClose={() => setShowEdit(false)}
          onSave={handleUpdate}
        />
      )}

      {/* DELETE MODAL */}
      {showDelete && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card w-[400px] rounded-lg p-[24px] space-y-[16px]">
            <h2 className="text-lg font-semibold">Delete Item</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete {selected.name}?
            </p>
            <div className="flex justify-end gap-[12px]">
              <button onClick={() => setShowDelete(false)}>Cancel</button>
              <button onClick={handleDelete} className="bg-red-500 text-white px-[16px] py-[8px] rounded-md">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory


const Modal = ({ title, ingredient, onClose, onSave }: any) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-card w-[450px] rounded-lg p-[24px] space-y-[16px]">
      <h2 className="text-lg font-semibold">{title}</h2>

      <input
        id={ingredient ? 'editName' : 'addName'}
        defaultValue={ingredient?.name}
        placeholder="Name"
        className="w-full px-[12px] py-[10px] border rounded-md"
      />

      <input
        id={ingredient ? 'editUnit' : 'addUnit'}
        defaultValue={ingredient?.unit}
        placeholder="Unit (kg, L, pcs...)"
        className="w-full px-[12px] py-[10px] border rounded-md"
      />

      <input
        id={ingredient ? 'editCurrent' : 'addCurrent'}
        defaultValue={ingredient?.current_stock}
        type="number"
        placeholder="Current Stock"
        className="w-full px-[12px] py-[10px] border rounded-md"
      />

      <input
        id={ingredient ? 'editMin' : 'addMin'}
        defaultValue={ingredient?.min_stock}
        type="number"
        placeholder="Minimum Stock"
        className="w-full px-[12px] py-[10px] border rounded-md"
      />

      <div className="flex justify-end gap-[12px]">
        <button onClick={onClose}>Cancel</button>
        <button
          onClick={onSave}
          className="gradient-primary text-white px-[16px] py-[8px] rounded-md"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)