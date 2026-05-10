'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category: string;
  stock: number;
  isActive: boolean;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/catalog/products?userId=${userId}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', localStorage.getItem('userId') || '');
    
    try {
      const response = await fetch('/api/catalog/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        alert('Products imported successfully!');
        await fetchProducts();
      } else {
        alert('Import failed. Check CSV format.');
      }
    } catch (error) {
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in name and price');
      return;
    }
    
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('/api/catalog/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock) || 0
        })
      });
      
      if (response.ok) {
        setShowAddForm(false);
        setNewProduct({ name: '', description: '', price: '', category: '', stock: '', imageUrl: '' });
        await fetchProducts();
      }
    } catch (error) {
      alert('Failed to add product');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    
    try {
      await fetch(`/api/catalog/products/${id}`, { method: 'DELETE' });
      await fetchProducts();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading catalog...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Product Catalog</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">WhatsApp Product Catalog</h1>
          <div className="flex gap-3">
            <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition">
              📤 Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* CSV Format Guide */}
        <div className="bg-blue-500/10 rounded-lg p-4 mb-6 border border-blue-500/30">
          <h3 className="text-blue-400 font-semibold mb-2">📋 CSV Format Guide</h3>
          <p className="text-gray-300 text-sm mb-2">Your CSV file should have these columns:</p>
          <code className="text-gray-400 text-xs bg-white/5 p-2 rounded block">
            name, description, price, currency, category, stock, image_url
          </code>
          <p className="text-gray-400 text-xs mt-2">Example: "T-Shirt, Cotton t-shirt, 150, ZAR, Clothing, 100, https://example.com/image.jpg"</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:border-orange-500 transition">
              {product.imageUrl && (
                <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${product.imageUrl})` }}></div>
              )}
              <div className="p-4">
                <h3 className="text-white font-bold text-lg">{product.name}</h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{product.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-orange-400 font-bold">R{product.price.toFixed(2)}</span>
                  <span className="text-gray-500 text-xs">Stock: {product.stock}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm py-1 rounded transition">
                    Share on WhatsApp
                  </button>
                  <button onClick={() => deleteProduct(product.id)} className="text-red-400 hover:text-red-300 text-sm px-2">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No products yet. Add products manually or import via CSV.
          </div>
        )}

        {/* Add Product Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-md w-full p-6">
              <h2 className="text-white font-bold text-lg mb-4">Add Product</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Product Name *"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <textarea
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <input
                  type="number"
                  placeholder="Price (R) *"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={addProduct} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg">
                  Add Product
                </button>
                <button onClick={() => setShowAddForm(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}