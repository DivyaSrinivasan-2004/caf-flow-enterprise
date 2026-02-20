import StatusBadge from '@/components/StatusBadge'
import { Search, Plus, Grid, List } from 'lucide-react'
import { useEffect, useState } from 'react'
import ProductActions from './components/ProductActions'
import EditProductModal from './components/EditProductModal'
import RecipeModal from './components/RecipeModal'

const API_BASE = 'http://192.168.1.75:8000/api/products'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  category: string
  category_name: string
  price: string
  image?: string
  is_active: boolean
}

const Products = () => {
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [category, setCategory] = useState<string | 'All'>('All')
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)

  // 🔥 NEW STATES
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRecipeModal, setShowRecipeModal] = useState(false)
  const [recipes, setRecipes] = useState<any[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const token = localStorage.getItem('access')

  // ================= LOAD DATA =================

  const loadCategories = async () => {
    const res = await fetch(`${API_BASE}/categories/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setCategories(data)
  }

  const loadProducts = async () => {
    const res = await fetch(`${API_BASE}/products/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setProducts(data)
  }

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [])

  // ================= FILTER =================

  const filtered = products.filter(p => {
    const matchCat =
      category === 'All' || p.category === category

    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase())

    return matchCat && matchSearch
  })

  // ================= DELETE =================

  const handleDelete = async (id: string) => {

    await fetch(`${API_BASE}/products/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    loadProducts()
  }

  // ================= LOAD RECIPES =================

const loadRecipes = async (productId: string) => {
  const res = await fetch(
    `${API_BASE}/recipes/?product=${productId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  )
  const data = await res.json()
  setRecipes(data)
}

  // ================= UPDATE PRODUCT =================

const handleUpdateProduct = async (
  id: string,
  formData: FormData
) => {
  await fetch(`${API_BASE}/products/${id}/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })

  setShowEditModal(false)
  loadProducts()
}

  // ================= ADD CATEGORY =================

  const handleAddCategory = async () => {
    const name = (
      document.getElementById('categoryName') as HTMLInputElement
    ).value

    const imageInput = document.getElementById(
      'categoryImage'
    ) as HTMLInputElement

    const formData = new FormData()
    formData.append('name', name)

    if (imageInput.files?.[0]) {
      formData.append('image', imageInput.files[0])
    }

    await fetch(`${API_BASE}/categories/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    setShowCategoryModal(false)
    loadCategories()
  }

  // ================= ADD PRODUCT =================

  const handleAddProduct = async () => {
    const name = (
      document.getElementById('productName') as HTMLInputElement
    ).value

    const categoryId = (
      document.getElementById('productCategory') as HTMLSelectElement
    ).value

    const price = (
      document.getElementById('productPrice') as HTMLInputElement
    ).value

    const imageInput = document.getElementById(
      'productImage'
    ) as HTMLInputElement

    const formData = new FormData()
    formData.append('name', name)
    formData.append('category', categoryId)
    formData.append('price', price)

    if (imageInput.files?.[0]) {
      formData.append('image', imageInput.files[0])
    }

    await fetch(`${API_BASE}/products/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    setShowProductModal(false)
    loadProducts()
  }

  return (
    <div className="space-y-[24px] animate-fade-in">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your menu items and inventory
          </p>
        </div>

        <div className="flex gap-[12px]">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-[16px] py-[10px] rounded-md border text-sm font-semibold"
          >
            Add Category
          </button>

          <button
            onClick={() => setShowProductModal(true)}
            className="px-[16px] py-[10px] rounded-md gradient-primary text-white text-sm font-semibold flex items-center gap-[8px]"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* FILTERS */}
<div className="flex flex-wrap gap-[12px] items-center">

  {/* SEARCH */}
  <div className="relative flex-1 min-w-[200px] max-w-sm">
    <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <input
      value={search}
      onChange={e => setSearch(e.target.value)}
      placeholder="Search products..."
      className="w-full pl-[36px] pr-[16px] py-[10px] rounded-md border text-sm"
    />
  </div>

  {/* CATEGORY BUTTONS */}
  <div className="flex gap-[8px] flex-wrap">
    <button
      onClick={() => setCategory('All')}
      className={`px-[12px] py-[8px] rounded-md text-xs font-medium ${
        category === 'All'
          ? 'gradient-primary text-white'
          : 'bg-secondary'
      }`}
    >
      All
    </button>

    {categories.map(c => (
      <button
        key={c.id}
        onClick={() => setCategory(c.id)}
        className={`px-[12px] py-[8px] rounded-md text-xs font-medium ${
          category === c.id
            ? 'gradient-primary text-white'
            : 'bg-secondary'
        }`}
      >
        {c.name}
      </button>
    ))}
  </div>

  {/* VIEW SWITCH */}
  <div className="flex gap-[4px] bg-secondary rounded-md p-[4px]">
    <button
      onClick={() => setView('grid')}
      className={`p-[6px] rounded ${
        view === 'grid' ? 'bg-card shadow-soft' : ''
      }`}
    >
      <Grid className="w-4 h-4" />
    </button>

    <button
      onClick={() => setView('table')}
      className={`p-[6px] rounded ${
        view === 'table' ? 'bg-card shadow-soft' : ''
      }`}
    >
      <List className="w-4 h-4" />
    </button>
  </div>

</div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
        {filtered.map(p => (
          <div
            key={p.id}
            className="bg-card rounded-lg border shadow-soft p-[16px]"
          >
            <div className="w-full h-[180px] rounded-lg bg-accent mb-[14px] overflow-hidden">
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex items-center justify-between mb-[6px]">
              <span className="text-xs text-muted-foreground">
                {p.category_name}
              </span>
            </div>

            <h3 className="text-sm font-semibold">{p.name}</h3>

            <div className="flex items-center justify-between mt-[8px]">
              <span className="text-lg font-bold text-primary">
                ₹{p.price}
              </span>

              <ProductActions
                onEdit={() => {
                  setSelectedProduct(p)
                  setShowEditModal(true)
                }}
                onDelete={() => {
  setSelectedProduct(p)
  setShowDeleteModal(true)
}}
                onRecipe={() => {
                  setSelectedProduct(p)
                  loadRecipes(p.id)
                  setShowRecipeModal(true)
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
{showEditModal && selectedProduct && (
  <EditProductModal
    product={selectedProduct}
    categories={categories}
    onClose={() => setShowEditModal(false)}
    onSave={(formData) =>
      handleUpdateProduct(selectedProduct.id, formData)
    }
  />
)}

      {/* RECIPE MODAL */}
{showRecipeModal && selectedProduct && (
  <RecipeModal
    product={selectedProduct}
    recipes={recipes}
    onClose={() => setShowRecipeModal(false)}
    reloadRecipes={loadRecipes}
  />
)}

{showDeleteModal && selectedProduct && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-card w-[400px] rounded-lg p-[24px] space-y-[16px]">
      <h2 className="text-lg font-semibold">Delete Product</h2>

      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete {selectedProduct.name}?
      </p>

      <div className="flex justify-end gap-[12px]">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="px-[16px] py-[8px] border rounded-md text-sm"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            await fetch(`${API_BASE}/products/${selectedProduct.id}/`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`
              }
            })

            setShowDeleteModal(false)
            loadProducts()
          }}
          className="px-[16px] py-[8px] bg-red-500 text-white rounded-md text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card w-[400px] rounded-lg p-[24px] space-y-[16px]">
            <h2 className="text-lg font-semibold">Add Category</h2>
            <input id="categoryName" placeholder="Category name" className="w-full px-[12px] py-[10px] border rounded-md" />
            <input id="categoryImage" type="file" className="w-full" />
            <div className="flex justify-end gap-[12px]">
              <button onClick={() => setShowCategoryModal(false)}>Cancel</button>
              <button onClick={handleAddCategory} className="px-[16px] py-[8px] gradient-primary text-white rounded-md text-sm">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card w-[500px] rounded-lg p-[24px] space-y-[16px]">
            <h2 className="text-lg font-semibold">Add Product</h2>

            <input id="productName" placeholder="Product name" className="w-full px-[12px] py-[10px] border rounded-md" />
            <select id="productCategory" className="w-full px-[12px] py-[10px] border rounded-md">
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input id="productPrice" type="number" placeholder="Price" className="w-full px-[12px] py-[10px] border rounded-md" />
            <input id="productImage" type="file" className="w-full" />

            <div className="flex justify-end gap-[12px]">
              <button onClick={() => setShowProductModal(false)}>Cancel</button>
              <button onClick={handleAddProduct} className="px-[16px] py-[8px] gradient-primary text-white rounded-md text-sm">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products