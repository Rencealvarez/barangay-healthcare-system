import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const INITIAL_INVENTORY = [
  {
    id: 1,
    code: 'MED-001',
    item_name: 'Paracetamol 500mg Tablets',
    category: 'Essential Medicine',
    quantity: 1450,
    unit: 'Tablets',
    reorder_level: 500,
    status: 'In Stock',
    last_restocked: '2026-07-20',
  },
  {
    id: 2,
    code: 'VAC-002',
    item_name: 'Influenza Vaccine 0.5mL Vial',
    category: 'Vaccines',
    quantity: 15,
    unit: 'Vials',
    reorder_level: 100,
    status: 'Low Stock',
    last_restocked: '2026-07-10',
  },
  {
    id: 3,
    code: 'SUP-003',
    item_name: 'Sterile Gauze Bandages 4x4',
    category: 'Medical Supplies',
    quantity: 320,
    unit: 'Packs',
    reorder_level: 150,
    status: 'In Stock',
    last_restocked: '2026-07-18',
  },
  {
    id: 4,
    code: 'MED-004',
    item_name: 'Amoxicillin 500mg Capsules',
    category: 'Antibiotics',
    quantity: 0,
    unit: 'Capsules',
    reorder_level: 300,
    status: 'Out of Stock',
    last_restocked: '2026-06-30',
  },
  {
    id: 5,
    code: 'MED-005',
    item_name: 'Amlodipine 5mg Tablets (Hypertension)',
    category: 'Essential Medicine',
    quantity: 2100,
    unit: 'Tablets',
    reorder_level: 600,
    status: 'In Stock',
    last_restocked: '2026-07-22',
  },
];

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal for New Item Creation
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    item_name: '',
    category: 'Essential Medicine',
    quantity: 100,
    unit: 'Tablets',
    code: '',
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/admin/inventory');
      const apiData = response.data?.data || response.data;
      if (Array.isArray(apiData)) {
        setInventory(apiData);
      } else {
        setInventory([]);
      }
    } catch (err) {
      console.warn('Failed to fetch inventory from API:', err);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      (item.item_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.code || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRestock = async (id) => {
    try {
      const response = await axiosClient.post(`/admin/inventory/${id}/quick-restock`, { amount: 100 });
      if (response.data?.data) {
        const updatedItem = response.data.data;
        setInventory((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
        return;
      }
    } catch (err) {
      console.warn('API quick restock failed, updating UI locally:', err);
    }

    // Fallback UI update if API fails
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + 100;
          let newStatus = 'In Stock';
          if (newQty <= 0) newStatus = 'Out of Stock';
          else if (newQty <= 20) newStatus = 'Low Stock';
          return {
            ...item,
            quantity: newQty,
            status: newStatus,
            last_restocked: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosClient.post('/admin/inventory', newItem);
      if (response.data?.data) {
        setInventory((prev) => [response.data.data, ...prev]);
        setShowAddModal(false);
        setNewItem({ item_name: '', category: 'Essential Medicine', quantity: 100, unit: 'Tablets', code: '' });
        return;
      }
    } catch (err) {
      console.error('Failed to create inventory item:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-800">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-700 uppercase">Barangay Supply Chain</span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Medical Inventory & Supplies</h1>
          <p className="text-xs text-slate-600 mt-1 font-semibold">
            Monitor stocks of essential medicines, vaccines, and clinical supplies at the health station.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center gap-1.5"
        >
          <span>➕</span> Add New Medicine / Stock
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
          <div className="text-xs text-slate-600 font-bold uppercase">Total Catalog Items</div>
          <div className="text-2xl font-black text-slate-900">{inventory.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
          <div className="text-xs text-slate-600 font-bold uppercase">In Stock</div>
          <div className="text-2xl font-black text-emerald-800">
            {inventory.filter((i) => i.status === 'In Stock').length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
          <div className="text-xs text-slate-600 font-bold uppercase">Low Stock Warning</div>
          <div className="text-2xl font-black text-amber-800">
            {inventory.filter((i) => i.status === 'Low Stock').length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
          <div className="text-xs text-slate-600 font-bold uppercase">Out of Stock</div>
          <div className="text-2xl font-black text-rose-800">
            {inventory.filter((i) => i.status === 'Out of Stock').length}
          </div>
        </div>
      </div>

      {/* Controls & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center bg-white">
          <input
            type="text"
            placeholder="Search item name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 font-semibold"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-60 px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 font-semibold"
          >
            <option value="All">All Categories</option>
            <option value="Essential Medicine">Essential Medicine</option>
            <option value="Vaccines">Vaccines</option>
            <option value="Medical Supplies">Medical Supplies</option>
            <option value="Antibiotics">Antibiotics</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold">Loading inventory catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 text-xs uppercase">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Item Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Stock Quantity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Restocked</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-semibold">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-indigo-700 font-black">{item.code}</td>
                    <td className="p-4 font-bold text-slate-900">{item.item_name}</td>
                    <td className="p-4 text-slate-700 font-bold">{item.category}</td>
                    <td className="p-4 font-bold font-mono">
                      {item.quantity} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.status === 'In Stock'
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                            : item.status === 'Low Stock'
                            ? 'bg-amber-100 text-amber-955 border border-amber-300'
                            : 'bg-rose-100 text-rose-950 border border-rose-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-bold">{item.last_restocked || 'N/A'}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRestock(item.id)}
                        className="px-6 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-sm font-extrabold transition-all shadow-sm min-h-[48px]"
                      >
                        + Quick Restock (+100)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add New Inventory Stock</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-800 text-lg font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Item Description / Name:</label>
                <input
                  type="text"
                  required
                  value={newItem.item_name}
                  onChange={(e) => setNewItem((p) => ({ ...p, item_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="e.g. Vitamin C 500mg"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Item Code / SKU:</label>
                <input
                  type="text"
                  value={newItem.code}
                  onChange={(e) => setNewItem((p) => ({ ...p, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="e.g. MED-006"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Category:</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Essential Medicine">Essential Medicine</option>
                    <option value="Vaccines">Vaccines</option>
                    <option value="Medical Supplies">Medical Supplies</option>
                    <option value="Antibiotics">Antibiotics</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Unit:</label>
                  <input
                    type="text"
                    required
                    value={newItem.unit}
                    onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Tablets / Vials"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Initial Quantity:</label>
                <input
                  type="number"
                  required
                  value={newItem.quantity}
                  onChange={(e) => setNewItem((p) => ({ ...p, quantity: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
