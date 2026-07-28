import React, { useState } from 'react';

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
    quantity: 85,
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
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.item_name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRestock = (id) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 100,
              status: item.quantity + 100 >= item.reorder_level ? 'In Stock' : 'Low Stock',
              last_restocked: new Date().toISOString().split('T')[0],
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-800">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-750 uppercase">Barangay Supply Chain</span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Medical Inventory & Supplies</h1>
          <p className="text-xs text-slate-650 mt-1 font-semibold">
            Monitor stocks of essential medicines, vaccines, and clinical supplies at the health station.
          </p>
        </div>
        <button
          onClick={() => alert('New item creation modal simulation')}
          className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center gap-1.5"
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
          <div className="text-2xl font-black text-rose-805">
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
            className="w-full sm:w-80 px-4 py-3 bg-white border border-slate-350 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-650 font-semibold"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-60 px-4 py-3 bg-white border border-slate-350 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-650 font-semibold"
          >
            <option value="All">All Categories</option>
            <option value="Essential Medicine">Essential Medicine</option>
            <option value="Vaccines">Vaccines</option>
            <option value="Medical Supplies">Medical Supplies</option>
            <option value="Antibiotics">Antibiotics</option>
          </select>
        </div>

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
                  <td className="p-4 font-mono text-indigo-750 font-black">{item.code}</td>
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
                          ? 'bg-amber-100 text-amber-950 border border-amber-300'
                          : 'bg-rose-100 text-rose-955 border border-rose-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-bold">{item.last_restocked}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleRestock(item.id)}
                      className="px-6 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-850 border border-indigo-250 rounded-xl text-sm font-extrabold transition-all shadow-sm min-h-[48px]"
                    >
                      + Quick Restock (+100)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
