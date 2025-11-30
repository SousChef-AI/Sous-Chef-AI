import { ArrowLeft, Plus, Search, AlertCircle, Trash2, Calendar } from 'lucide-react';
import { useState } from 'react';

interface PantryScreenProps {
  onBack: () => void;
}

interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  expiryDate: string;
  location: string;
  daysUntilExpiry: number;
  atRisk: boolean;
}

const mockPantryItems: PantryItem[] = [
  {
    id: '1',
    name: 'Tofu',
    quantity: '400',
    unit: 'g',
    expiryDate: '2025-11-29',
    location: 'Refrigerator',
    daysUntilExpiry: 2,
    atRisk: true,
  },
  {
    id: '2',
    name: 'Spinach',
    quantity: '200',
    unit: 'g',
    expiryDate: '2025-11-28',
    location: 'Refrigerator',
    daysUntilExpiry: 1,
    atRisk: true,
  },
  {
    id: '3',
    name: 'Bell Peppers',
    quantity: '3',
    unit: 'whole',
    expiryDate: '2025-11-30',
    location: 'Refrigerator',
    daysUntilExpiry: 3,
    atRisk: true,
  },
  {
    id: '4',
    name: 'Chickpeas',
    quantity: '2',
    unit: 'cans',
    expiryDate: '2026-06-15',
    location: 'Pantry',
    daysUntilExpiry: 200,
    atRisk: false,
  },
  {
    id: '5',
    name: 'Pasta',
    quantity: '500',
    unit: 'g',
    expiryDate: '2026-03-20',
    location: 'Pantry',
    daysUntilExpiry: 113,
    atRisk: false,
  },
  {
    id: '6',
    name: 'Onions',
    quantity: '4',
    unit: 'whole',
    expiryDate: '2025-12-05',
    location: 'Counter',
    daysUntilExpiry: 8,
    atRisk: false,
  },
];

export function PantryScreen({ onBack }: PantryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(mockPantryItems);

  const atRiskCount = items.filter(item => item.atRisk).length;

  const filteredItems = items
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 hover:bg-emerald-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-emerald-700" />
            </button>
            <div>
              <h1 className="text-emerald-800">My Pantry</h1>
              <p className="text-sm text-gray-600">{items.length} items tracked</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-2 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* At-Risk Alert */}
        {atRiskCount > 0 && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-amber-900 mb-1">
                {atRiskCount} {atRiskCount === 1 ? 'item' : 'items'} expiring soon
              </div>
              <p className="text-sm text-amber-800">
                Use these ingredients soon to avoid waste. Check out recipe suggestions below!
              </p>
            </div>
            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm transition-colors whitespace-nowrap">
              Find Recipes
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search your pantry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-emerald-200">
            <div className="text-2xl text-emerald-700 mb-1">{items.length}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
            <div className="text-2xl text-amber-700 mb-1">{atRiskCount}</div>
            <div className="text-sm text-gray-600">Expiring Soon</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <div className="text-2xl text-green-700 mb-1">8</div>
            <div className="text-sm text-gray-600">Used This Week</div>
          </div>
        </div>

        {/* Pantry Items List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-emerald-900">All Items</h2>
            <div className="text-sm text-gray-500">Sorted by expiry date</div>
          </div>

          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg p-4 border-2 transition-all ${
                item.atRisk
                  ? 'border-amber-300 bg-amber-50/30'
                  : 'border-gray-200 hover:border-emerald-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-gray-900">{item.name}</h3>
                    {item.atRisk && (
                      <span className="px-2 py-1 bg-amber-500 text-white rounded text-xs">
                        Use soon
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Quantity</div>
                      <div className="text-gray-900">
                        {item.quantity} {item.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Location</div>
                      <div className="text-gray-900">{item.location}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Expires</div>
                      <div className={`flex items-center gap-1 ${
                        item.atRisk ? 'text-amber-700' : 'text-gray-900'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        <span>{item.expiryDate}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Days left</div>
                      <div className={item.atRisk ? 'text-amber-700' : 'text-gray-900'}>
                        {item.daysUntilExpiry} {item.daysUntilExpiry === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => alert(`Editing ${item.name}...`)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete item"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
              <div className="text-gray-400 mb-2">No items found</div>
              <p className="text-sm text-gray-500">
                Try adjusting your search or add new items to your pantry
              </p>
            </div>
          )}
        </div>

        {/* Voice Commands */}
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <div className="text-sm text-emerald-800 mb-2">Voice commands:</div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white text-emerald-700 rounded-md text-xs border border-emerald-200">
              "Add tofu to pantry"
            </span>
            <span className="px-3 py-1 bg-white text-emerald-700 rounded-md text-xs border border-emerald-200">
              "What's expiring soon?"
            </span>
            <span className="px-3 py-1 bg-white text-emerald-700 rounded-md text-xs border border-emerald-200">
              "Show me recipes with spinach"
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
