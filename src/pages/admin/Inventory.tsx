import {
  Package,
  AlertTriangle,
  TrendingDown,
  
  Plus,
  Pencil,
  Trash2,
  BarChart3
} from 'lucide-react'
import { useEffect, useState } from 'react'

const API_BASE = 'http://192.168.1.3:8000/api/inventory'

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

  const getStatus = (current: number, min: number) => {
    if (current <= 0) return 'out'
    if (current <= min) return 'low'
    return 'good'
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  const lowCount = items.filter(
    i => getStatus(Number(i.current_stock), Number(i.min_stock)) === 'low'
  ).length

  const outCount = items.filter(
    i => getStatus(Number(i.current_stock), Number(i.min_stock)) === 'out'
  ).length
const calculateHealthScore = (current: number, min: number) => {
  if (current <= 0) return 0
  if (current <= min) return 40
  return 100
}

const calculateReorder = (current: number, min: number) => {
  if (current <= min) {
    return min * 2 - current
  }
  return 0
}

const calculateValuation = (stock: number) => {
  return stock * 50 // fake cost per unit (can replace later)
}
  /* ================= ADD ================= */

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

  /* ================= EDIT ================= */

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

  /* ================= DELETE ================= */

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
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Inventory Intelligence</h1>
          <p className="text-sm text-gray-500">
            Monitor stock health and operational readiness
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* ANALYTICS STRIP */}
      <div className="grid grid-cols-4 gap-6">

        <Card title="Total Items" value={items.length} icon={<Package className="w-5 h-5" />} />

        <Card title="Low Stock" value={lowCount} icon={<AlertTriangle className="w-5 h-5 text-yellow-500" />} />

        <Card title="Out of Stock" value={outCount} icon={<TrendingDown className="w-5 h-5 text-red-500" />} />

        <Card
          title="Inventory Health"
          value={`${items.length === 0 ? 0 : Math.round(((items.length - lowCount - outCount) / items.length) * 100)}%`}
          icon={<BarChart3 className="w-5 h-5 text-green-500" />}
        />

      </div>

      {/* SEARCH BAR */}
      <div className="flex justify-between items-center">

        <div className="relative w-[300px]">
       
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ingredients..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
          />
        </div>

      </div>
      

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 text-left">Ingredient</th>
              <th className="px-6 py-4 text-left">Stock</th>
              <th className="px-6 py-4 text-left">Min Level</th>
              <th className="px-6 py-4 text-left">Health</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {filtered.map(i => {
              const status = getStatus(Number(i.current_stock), Number(i.min_stock))

              return (
                <tr key={i.id} className="hover:bg-gray-50 transition">

                  <td className="px-6 py-4 font-medium">{i.name}</td>

                  <td className="px-6 py-4">
                    {i.current_stock} {i.unit}
                  </td>

                  <td className="px-6 py-4">
                    {i.min_stock} {i.unit}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      status === 'good'
                        ? 'bg-green-100 text-green-600'
                        : status === 'low'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {status === 'good'
                        ? 'Healthy'
                        : status === 'low'
                        ? 'Low Stock'
                        : 'Out of Stock'}
                    </span>
                  </td>

                  <td className="px-6 py-4 flex gap-4">
                    <button
                      onClick={() => {
                        setSelected(i)
                        setShowEdit(true)
                      }}
                      className="text-gray-400 hover:text-purple-600 transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setSelected(i)
                        setShowDelete(true)
                      }}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              )
            })}

          </tbody>

        </table>
      </div>

      {/* MODALS */}
      {showAdd && (
        <Modal title="Add Ingredient" onClose={() => setShowAdd(false)} onSave={handleAdd} />
      )}

      {showEdit && selected && (
        <Modal
          title="Edit Ingredient"
          ingredient={selected}
          onClose={() => setShowEdit(false)}
          onSave={handleUpdate}
        />
      )}

      {showDelete && selected && (
        <DeleteModal
          name={selected.name}
          onClose={() => setShowDelete(false)}
          onDelete={handleDelete}
        />
      )}

    </div>
  )
}

export default Inventory

const Card = ({ title, value, icon }: any) => (
  <div className="bg-white p-5 rounded-xl border shadow-sm flex justify-between items-center">
    <div>
      <p className="text-xs text-gray-500">{title}</p>
      <h3 className="text-xl font-semibold mt-1">{value}</h3>
    </div>
    {icon}
  </div>
)

/* ================= MODALS ================= */

const Modal = ({ title, ingredient, onClose, onSave }: any) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white w-[480px] rounded-xl p-6 space-y-5 shadow-xl border">

      <h2 className="text-lg font-semibold">{title}</h2>

      <input
        id={ingredient ? 'editName' : 'addName'}
        defaultValue={ingredient?.name}
        placeholder="Name"
        className="w-full px-4 py-2 border rounded-lg"
      />

      <input
        id={ingredient ? 'editUnit' : 'addUnit'}
        defaultValue={ingredient?.unit}
        placeholder="Unit"
        className="w-full px-4 py-2 border rounded-lg"
      />

      <input
        id={ingredient ? 'editCurrent' : 'addCurrent'}
        defaultValue={ingredient?.current_stock}
        type="number"
        placeholder="Current Stock"
        className="w-full px-4 py-2 border rounded-lg"
      />

      <input
        id={ingredient ? 'editMin' : 'addMin'}
        defaultValue={ingredient?.min_stock}
        type="number"
        placeholder="Minimum Stock"
        className="w-full px-4 py-2 border rounded-lg"
      />

      <div className="flex justify-end gap-4">
        <button onClick={onClose} className="text-gray-500">
          Cancel
        </button>

        <button
          onClick={onSave}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Save
        </button>
      </div>

    </div>
  </div>
)

const DeleteModal = ({ name, onClose, onDelete }: any) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white w-[400px] rounded-xl p-6 space-y-5 shadow-xl border">

      <h2 className="text-lg font-semibold text-red-600">Delete Ingredient</h2>

      <p className="text-sm text-gray-500">
        Are you sure you want to delete <strong>{name}</strong>?
      </p>

      <div className="flex justify-end gap-4">
        <button onClick={onClose} className="text-gray-500">
          Cancel
        </button>

        <button
          onClick={onDelete}
          className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>

    </div>
  </div>
)