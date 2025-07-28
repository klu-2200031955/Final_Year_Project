import React, { useState } from 'react';
import { Trash2, Package, Tag, Calendar, AlertTriangle, Edit } from 'lucide-react';

const InventoryItem = ({ item, onDelete, onUpdate, onQuantityChange }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(item.id);
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const updateQuantity = (delta) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity >= 0) {
      onQuantityChange(item.id, { ...item, quantity: newQuantity });
    }
  };

  const getStockStatusColor = (quantity) => {
    if (quantity === 0) return 'text-red-600 bg-red-50 border-red-200';
    if (quantity < 10) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-green-700 bg-green-50 border-green-200';
  };

  const getStockStatusText = (quantity) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 relative overflow-hidden">
      {/* Stock Status Badge */}
      <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium border ${getStockStatusColor(item.quantity)}`}>
        {getStockStatusText(item.quantity)}
      </div>

      {/* Item Header */}
      <div className="flex items-start space-x-3 mb-4 pr-20">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Package className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
        </div>
      </div>

      {/* Item Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Tag className="h-4 w-4" />
            <span>{item.category}</span>
          </div>

          {/* Quantity with -/+ buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateQuantity(-1)}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              disabled={item.quantity === 0}
            >−</button>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{item.quantity}</p>
              <p className="text-xs text-gray-500">units</p>
            </div>
            <button
              onClick={() => updateQuantity(1)}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >+</button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Added {new Date(item.createdAt).toLocaleDateString()}</span>
        </div>

        {item.price && (
          <div className="text-right">
            <p className="text-lg font-semibold text-green-600">
              ₹{item.price.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">per unit</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        {!showConfirm ? (
          <div className="flex space-x-2">
            <button
              onClick={() => onUpdate(item)}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition-colors duration-200 disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              <span>{isDeleting ? 'Deleting...' : 'Confirm'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryItem;
