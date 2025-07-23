import React from 'react';
import { Package, Search, Trash2, AlertTriangle } from 'lucide-react';
import InventoryItem from './InventoryItem';

const InventoryList = ({ inventory, loading, onDeleteItem, onEditItem, searchTerm }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          {searchTerm ? (
            <Search className="h-12 w-12 text-gray-400" />
          ) : (
            <Package className="h-12 w-12 text-gray-400" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {searchTerm ? 'No items found' : 'No inventory items'}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {searchTerm 
            ? `No items match "${searchTerm}". Try adjusting your search terms.`
            : 'Get started by adding your first inventory item using the "Add Item" button above.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {inventory.map((item) => (
        <InventoryItem
          key={item.id}
          item={item}
          onDelete={onDeleteItem}
          onUpdate={onEditItem}
        />
      ))}
    </div>
  );
};

export default InventoryList;