import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import dishImages from "@/lib/dishImages";
import FormModal from "./FormModal";
import { BookOpen } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  gst: number;
  available: boolean;
}

const mockProducts: Product[] = [
  { id: 1, name: "Cappuccino", category: "Coffee", price: 180, gst: 5, available: true },
  { id: 2, name: "Latte", category: "Coffee", price: 200, gst: 5, available: true },
  { id: 3, name: "Green Tea", category: "Tea", price: 120, gst: 5, available: true },
  { id: 4, name: "Chocolate Cake", category: "Desserts", price: 250, gst: 12, available: false },
  { id: 5, name: "Croissant", category: "Snacks", price: 150, gst: 5, available: true },
  { id: 6, name: "Espresso", category: "Coffee", price: 150, gst: 5, available: true },
  { id: 7, name: "Masala Chai", category: "Tea", price: 80, gst: 5, available: true },
  { id: 8, name: "Mango Smoothie", category: "Juice", price: 220, gst: 12, available: true },
];

const categories = ["All", "Coffee", "Tea", "Snacks", "Desserts", "Juice"];

const AdminProducts = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState(mockProducts);

  const [showProductModal, setShowProductModal] = useState(false);
const [editProduct, setEditProduct] = useState<Product | null>(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showCategoryModal, setShowCategoryModal] = useState(false);
const [showRecipeModal, setShowRecipeModal] = useState(false);
const [ingredients, setIngredients] = useState([
  { name: "", quantity: "" },
]);
const handleIngredientChange = (
  index: number,
  field: "name" | "quantity",
  value: string
) => {
  const updated = [...ingredients];
  updated[index][field] = value;
  setIngredients(updated);
};

const addIngredientRow = () => {
  setIngredients([...ingredients, { name: "", quantity: "" }]);
};
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const toggleAvailability = (id: number) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p)));
  };

  return (
  <div className="w-full py-8">

    {/* HEADER */}
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your menu items & categories
        </p>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="px-5 py-2.5 rounded-full text-sm font-semibold 
                     border border-border bg-card 
                     hover:border-primary/40 
                     hover:shadow-glow transition-all duration-300"
          onClick={() => setShowCategoryModal(true)}
        >
          + Add Category
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="px-6 py-2.5 rounded-full text-sm font-semibold 
                     gradient-primary text-primary-foreground 
                     shadow-glow hover:shadow-xl 
                     transition-all duration-300 flex items-center gap-2"
          onClick={() => setShowProductModal(true)}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </motion.button>
      </div>
    </motion.div>

    {/* MAIN LAYOUT */}
    <div className="grid grid-cols-12 gap-8">

      {/* SIDEBAR */}
      <div className="col-span-12 md:col-span-3 lg:col-span-2">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Categories
          </h3>

          <div className="space-y-2 relative">
            {categories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    active
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 gradient-primary rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="col-span-12 md:col-span-9 lg:col-span-10">

        {/* SEARCH */}
        <div className="relative max-w-sm mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-card border border-border 
                       focus:border-primary focus:ring-2 focus:ring-primary/20 
                       outline-none transition-all text-sm"
          />
        </div>

        {/* PRODUCT GRID */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filtered.map((product, i) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass-card overflow-hidden hover:shadow-glow 
                          transition-all duration-300 
                          rounded-lg border border-border border-t-4
                          ${!product.available ? "opacity-60" : ""}`}
            >
              <div className="w-full h-40 bg-secondary/30">
                {dishImages[product.name] ? (
                  <img
                    src={dishImages[product.name]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    ☕
                  </div>
                )}
              </div>

              <div className="p-4">
                
                    {/* PRODUCT NAME ROW */}
{/* PRODUCT NAME ROW */}
<div className="flex items-center w-full justify-between mb-1">

  <h3 className="font-semibold text-foreground truncate">
    {product.name}
  </h3>

  <button
    onClick={() => {
      setEditProduct(product);
      setShowRecipeModal(true);
    }}
    className="ml-3 shrink-0 p-1 rounded-md hover:bg-primary/10 transition-colors"
  >
    <BookOpen className="w-3 h-3 text-primary" />
  </button>

</div>

{/* Category */}
<p className="text-xs text-muted-foreground">
  {product.category}
</p>
                  

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-lg font-bold text-foreground">
                      ₹{product.price}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      GST {product.gst}%
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                    onClick={() => {
                      setEditProduct(product);
                      setShowProductModal(true);
                      }}>
                      <Edit2 className="w-3 h-4 text-muted-foreground" />
                    </button>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-colors" onClick={() => setShowDeleteModal(true)}>
                      <Trash2 className="w-3 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
    {/* Add/Edit Product Modal */}
    <FormModal
  open={showProductModal}
  title={editProduct ? "Edit Product" : "Add Product"}
  onClose={() => {
    setShowProductModal(false);
    setEditProduct(null);
  }}
>
  <div className="space-y-4">

    <div>
      <label className="text-sm font-medium">Name</label>
      <input
        defaultValue={editProduct?.name}
        className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-secondary/40"
      />
    </div>

    <div>
      <label className="text-sm font-medium">Category</label>
      <select
        defaultValue={editProduct?.category}
        className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-secondary/40"
      >
        {categories.map((cat) => (
          <option key={cat}>{cat}</option>
        ))}
      </select>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">Price</label>
        <input
          type="number"
          defaultValue={editProduct?.price}
          className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-secondary/40"
        />
      </div>

      <div>
        <label className="text-sm font-medium">GST %</label>
        <input
          type="number"
          defaultValue={editProduct?.gst}
          className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-secondary/40"
        />
      </div>
    </div>

    <div>
      <label className="text-sm font-medium">Product Image</label>
      <input type="file" className="w-full mt-1 text-sm" />
    </div>

    <button className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-glow">
      {editProduct ? "Update Product" : "Add Product"}
    </button>

  </div>
</FormModal>
{/* Delete Confirmation Modal */}
<FormModal
  open={showDeleteModal}
  title="Delete Product"
  onClose={() => setShowDeleteModal(false)}
>
  <div className="space-y-6">
    <p className="text-muted-foreground">
      Are you sure you want to delete this product?
    </p>

    <div className="flex justify-end gap-3">
      <button
        onClick={() => setShowDeleteModal(false)}
        className="px-4 py-2 rounded-lg border border-border"
      >
        Cancel
      </button>

      <button className="px-4 py-2 rounded-lg bg-destructive text-white">
        Delete
      </button>
    </div>
  </div>
</FormModal>
{/* Add Category Modal */}
<FormModal
  open={showCategoryModal}
  title="Add Category"
  onClose={() => setShowCategoryModal(false)}
>
  <div className="space-y-4">
    <div>
      <label className="text-sm font-medium">Category Name</label>
      <input className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-secondary/40" />
    </div>

    <button className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-glow">
      Save Category
    </button>
  </div>
</FormModal>
<FormModal
  open={showRecipeModal}
  title={`Recipe - ${editProduct?.name || ""}`}
  onClose={() => {
    setShowRecipeModal(false);
    setIngredients([{ name: "", quantity: "" }]);
  }}
>
  <div className="space-y-4">

    {ingredients.map((ing, index) => (
      <div key={index} className="grid grid-cols-2 gap-4">
        <input
          placeholder="Ingredient Name"
          value={ing.name}
          onChange={(e) =>
            handleIngredientChange(index, "name", e.target.value)
          }
          className="px-4 py-2.5 rounded-xl border border-border bg-secondary/40"
        />

        <input
          placeholder="Quantity (e.g. 50ml)"
          value={ing.quantity}
          onChange={(e) =>
            handleIngredientChange(index, "quantity", e.target.value)
          }
          className="px-4 py-2.5 rounded-xl border border-border bg-secondary/40"
        />
      </div>
    ))}

    <button
      onClick={addIngredientRow}
      className="w-full py-2 rounded-xl border border-primary text-primary font-medium hover:bg-primary/10 transition"
    >
      + Add Ingredient
    </button>

    <button className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-glow">
      Save Recipe
    </button>

  </div>
</FormModal>
  </div>
);
};

export default AdminProducts;
