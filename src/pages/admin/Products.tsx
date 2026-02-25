import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Edit2,
  Layers,
  Plus,
  
  Trash2,
  Zap,
} from "lucide-react";

import FormModal from "./FormModal";

const API_BASE = "http://192.168.1.3:8000";

interface Product {
  id: string;
  name: string;
  category_name: string;
  category_id: string;
  price: number;
  gst_percent: number;
  image_url: string;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  image_url?: string;
  image?: string;
}

interface ProductForm {
  name: string;
  categoryId: string;
  price: string;
  gstPercent: string;
  image: File | null;
  isActive: boolean;
}

interface CategoryForm {
  name: string;
  image: File | null;
}

const initialProductForm: ProductForm = {
  name: "",
  categoryId: "",
  price: "",
  gstPercent: "",
  image: null,
  isActive: true,
};

const initialCategoryForm: CategoryForm = {
  name: "",
  image: null,
};

const placeholderCategoryImage =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80";

const AdminProducts = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(initialProductForm);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(initialCategoryForm);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [statusText, setStatusText] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    void fetchProducts();
    void fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products/products/`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) return;

      const data = await res.json();

      const formatted: Product[] = data.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        category_name: item.category_name ?? item.category?.name ?? "Uncategorized",
        category_id: String(item.category ?? item.category_id ?? ""),
        price: Number(item.price ?? 0),
        gst_percent: Number(item.gst_percent ?? 0),
        image_url: item.image_url ?? item.image ?? "",
        is_active: Boolean(item.is_active),
      }));

      setProducts(formatted);
    } catch (err) {
      console.error("Fetch products error:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products/categories/`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) return;

      const data = await res.json();

      const mapped: Category[] = data.map((c: any) => ({
        id: String(c.id),
        name: c.name,
        image_url: c.image_url ?? c.image ?? "",
      }));

      setCategories([
        { id: "all", name: "All", image_url: placeholderCategoryImage },
        ...mapped,
      ]);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "All" || p.category_name === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [products, search, activeCategory]);

  const selectedCategoryObj = useMemo(
    () => categories.find((c) => c.id === productForm.categoryId),
    [categories, productForm.categoryId]
  );

  const setEditMode = (product: Product | null) => {
    setEditProduct(product);

    if (!product) {
      setProductForm({ ...initialProductForm, categoryId: categories[1]?.id ?? "" });
      return;
    }

    const categoryMatch =
      categories.find((c) => c.id === product.category_id) ||
      categories.find((c) => c.name === product.category_name);

    setProductForm({
      name: product.name,
      categoryId: categoryMatch?.id ?? "",
      price: String(product.price),
      gstPercent: String(product.gst_percent),
      image: null,
      isActive: product.is_active,
    });
  };

  const openAddProductModal = () => {
    setEditMode(null);
    setShowProductModal(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditMode(product);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditProduct(null);
    setProductForm(initialProductForm);
  };

  const openAddCategoryModal = () => {
    setEditCategory(null);
    setCategoryForm(initialCategoryForm);
    setShowCategoryModal(true);
  };

  const closeAddCategoryModal = () => {
    setEditCategory(null);
    setShowCategoryModal(false);
    setCategoryForm(initialCategoryForm);
  };

  const openEditCategoryModal = (category: Category) => {
    if (category.id === "all") return;
    setEditCategory(category);
    setCategoryForm({ name: category.name, image: null });
    setShowCategoryModal(true);
  };

  const openDeleteCategoryModal = (category: Category) => {
    if (category.id === "all") return;
    setEditCategory(category);
    setShowDeleteCategoryModal(true);
  };

  const saveProduct = async () => {
    if (!productForm.name.trim() || !productForm.price || !productForm.categoryId) {
      setStatusText("Name, category, and price are required.");
      return;
    }

    setIsSavingProduct(true);

    const formData = new FormData();
    formData.append("name", productForm.name.trim());
    formData.append("price", productForm.price);
    formData.append("gst_percent", productForm.gstPercent || "0");
    formData.append("is_active", String(productForm.isActive));

    if (productForm.categoryId !== "all") {
      formData.append("category", productForm.categoryId);
      if (selectedCategoryObj?.name) {
        formData.append("category_name", selectedCategoryObj.name);
      }
    }

    if (productForm.image) {
      formData.append("image", productForm.image);
    }

    try {
      const url = editProduct
        ? `${API_BASE}/api/products/products/${editProduct.id}/`
        : `${API_BASE}/api/products/products/`;

      const res = await fetch(url, {
        method: editProduct ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) {
        setStatusText("Could not save product. Please verify backend fields.");
        return;
      }

      await fetchProducts();
      setStatusText(editProduct ? "Product updated." : "Product created.");
      closeProductModal();
    } catch (err) {
      console.error("Save product error:", err);
      setStatusText("Could not save product.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      setStatusText("Category name is required.");
      return;
    }

    setIsSavingCategory(true);

    const formData = new FormData();
    formData.append("name", categoryForm.name.trim());
    if (categoryForm.image) {
      formData.append("image", categoryForm.image);
    }

    try {
      const previousName = editCategory?.name ?? "";
      const url = editCategory
        ? `${API_BASE}/api/products/categories/${editCategory.id}/`
        : `${API_BASE}/api/products/categories/`;

      const res = await fetch(url, {
        method: editCategory ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) {
        setStatusText(
          editCategory
            ? "Could not update category. Please verify backend category fields."
            : "Could not create category. Please verify backend category fields."
        );
        return;
      }

      await fetchCategories();
      if (!editCategory || activeCategory === previousName) {
        setActiveCategory(categoryForm.name.trim());
      }
      setStatusText(editCategory ? "Category updated." : "Category created.");
      closeAddCategoryModal();
    } catch (err) {
      console.error("Save category error:", err);
      setStatusText(editCategory ? "Could not update category." : "Could not create category.");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const deleteCategory = async () => {
    if (!editCategory || editCategory.id === "all") return;

    try {
      const res = await fetch(`${API_BASE}/api/products/categories/${editCategory.id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        setStatusText("Failed to delete category.");
        return;
      }

      await fetchCategories();
      if (activeCategory === editCategory.name) {
        setActiveCategory("All");
      }
      setStatusText("Category deleted.");
      setShowDeleteCategoryModal(false);
      setEditCategory(null);
    } catch (err) {
      console.error("Delete category failed:", err);
      setStatusText("Failed to delete category.");
    }
  };

  const deleteProduct = async () => {
    if (!editProduct) return;

    try {
      const res = await fetch(`${API_BASE}/api/products/products/${editProduct.id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        setStatusText("Failed to delete product.");
        return;
      }

      await fetchProducts();
      setStatusText("Product deleted.");
      setEditProduct(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Delete failed:", err);
      setStatusText("Failed to delete product.");
    }
  };

  const toggleAvailability = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    try {
      await fetch(`${API_BASE}/api/products/products/${id}/`, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !product.is_active,
        }),
      });

      await fetchProducts();
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  return (
    <div className="w-full">
      <style>{`
        .category-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .category-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="rounded-2xl border border-border bg-gradient-to-br from-white via-violet-50 to-purple-50 p-4 md:p-5 mb-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-xs text-muted-foreground mt-1">Design, manage, and publish your full cafe menu.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAddCategoryModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-full border border-purple-300 bg-white hover:bg-purple-50 transition"
            >
              <Layers className="w-3.5 h-3.5" />
              Add Category
            </button>

            <button
              onClick={openAddProductModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-full bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </button>
          </div>
        </div>

        
      </div>

      {statusText && (
        <div className="mb-4 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs text-purple-900">
          {statusText}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-3 xl:col-span-3 h-fit rounded-2xl border border-purple-100 bg-gradient-to-b from-white to-violet-50/60 p-3 shadow-sm">
          <div className="mb-3 rounded-xl border border-purple-100 bg-white/90 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700">
              Category Control
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Filter products by menu groups instantly.</p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-medium text-violet-700">
              <Layers className="h-3.5 w-3.5" />
              {categories.length} categories
            </div>
          </div>

          <div className="category-scroll max-h-[560px] overflow-y-auto space-y-2 pr-0">
            {categories.map((cat) => {
              const active = activeCategory === cat.name;
              const img = cat.image_url || cat.image || placeholderCategoryImage;
              const countForCategory =
                cat.name === "All"
                  ? products.length
                  : products.filter((p) => p.category_name === cat.name).length;

              return (
                <div
                  key={cat.id}
                  className={`group w-full rounded-xl border p-2.5 text-left transition ${
                    active
                      ? "border-purple-500 bg-purple-50 shadow-[0_6px_18px_rgba(124,58,237,0.14)]"
                      : "border-purple-100 bg-white/80 hover:border-purple-300 hover:bg-purple-50/60"
                  }`}
                >
                  <button onClick={() => setActiveCategory(cat.name)} className="w-full text-left">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl ring-2 ring-white shadow-sm">
                        <img src={img} alt={cat.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-xs font-semibold ${
                            active ? "text-purple-800" : "text-foreground"
                          }`}
                        >
                          {cat.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {countForCategory} item{countForCategory === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                  </button>

                  {cat.id !== "all" && (
                    <div className="mt-2 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditCategoryModal(cat)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-purple-200 bg-white text-purple-700 hover:bg-purple-50"
                        title={`Edit ${cat.name}`}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteCategoryModal(cat)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                        title={`Delete ${cat.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <section className="lg:col-span-9 xl:col-span-9">
          <div className="relative mb-4 flex items-center justify-between gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full md:w-[360px] rounded-xl border border-purple-200 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none focus:border-purple-400"
            />
           
            <span className="hidden rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 md:inline-flex">
              {activeCategory === "All" ? "All Categories" : activeCategory}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="h-36 bg-purple-50 relative">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-xl">?</div>
                  )}

                  <button
                    onClick={() => toggleAvailability(product.id)}
                    className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      product.is_active
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    {product.is_active ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{product.category_name}</p>
                    </div>
                    <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold">Rs.{product.price.toFixed(2)}</p>
                      <p className="text-[11px] text-muted-foreground">GST {product.gst_percent}%</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditProductModal(product)}
                        className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-purple-50"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setEditProduct(product);
                          setShowDeleteModal(true);
                        }}
                        className="w-7 h-7 rounded-full border border-rose-200 text-rose-600 flex items-center justify-center hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <FormModal
        open={showProductModal}
        title={editProduct ? "Edit Product" : "Add Product"}
        onClose={closeProductModal}
      >
        <div className="space-y-4">
          <input
            value={productForm.name}
            onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Product name"
            className="w-full border p-2.5 rounded-lg"
          />

          <select
            value={productForm.categoryId}
            onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))}
            className="w-full border p-2.5 rounded-lg"
          >
            <option value="">Select category</option>
            {categories
              .filter((c) => c.id !== "all")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              value={productForm.price}
              onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="Price"
              type="number"
              className="w-full border p-2.5 rounded-lg"
            />

            <input
              value={productForm.gstPercent}
              onChange={(e) => setProductForm((prev) => ({ ...prev, gstPercent: e.target.value }))}
              placeholder="GST %"
              type="number"
              className="w-full border p-2.5 rounded-lg"
            />
          </div>

          <input
            type="file"
            onChange={(e) =>
              setProductForm((prev) => ({
                ...prev,
                image: e.target.files?.[0] ?? null,
              }))
            }
          />

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={productForm.isActive}
              onChange={(e) =>
                setProductForm((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
            />
            Product is active
          </label>

          <button
            onClick={saveProduct}
            disabled={isSavingProduct}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-2.5 rounded-lg"
          >
            {isSavingProduct ? "Saving..." : "Save Product"}
          </button>
        </div>
      </FormModal>

      <FormModal
        open={showCategoryModal}
        title={editCategory ? "Edit Category" : "Add Category"}
        onClose={closeAddCategoryModal}
      >
        <div className="space-y-4">
          <input
            value={categoryForm.name}
            onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Category name"
            className="w-full border p-2.5 rounded-lg"
          />

          <input
            type="file"
            onChange={(e) =>
              setCategoryForm((prev) => ({
                ...prev,
                image: e.target.files?.[0] ?? null,
              }))
            }
          />

          <button
            onClick={saveCategory}
            disabled={isSavingCategory}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-2.5 rounded-lg"
          >
            {isSavingCategory ? "Saving..." : editCategory ? "Update Category" : "Save Category"}
          </button>
        </div>
      </FormModal>

      <FormModal
        open={showDeleteCategoryModal}
        title="Delete Category"
        onClose={() => {
          setShowDeleteCategoryModal(false);
          setEditCategory(null);
        }}
      >
        <div className="space-y-4">
          <p>Delete category "{editCategory?.name}"?</p>
          <button
            onClick={deleteCategory}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
          >
            Delete Category
          </button>
        </div>
      </FormModal>

      <FormModal open={showDeleteModal} title="Delete Product" onClose={() => setShowDeleteModal(false)}>
        <div className="space-y-4">
          <p>Delete this product?</p>
          <button
            onClick={deleteProduct}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
          >
            Delete
          </button>
        </div>
      </FormModal>
    </div>
  );
};

export default AdminProducts;
