import React from 'react';
import { X, TrendingUp, Package, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';

const InventoryAnalysis = ({ inventory, onClose }) => {
  // Calculate analytics
  const totalItems = inventory.length;
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const outOfStockItems = inventory.filter(item => item.quantity === 0);
  const lowStockItems = inventory.filter(item => item.quantity > 0 && item.quantity < 10);
  
  // Today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Daily activity tracking
  const itemsAddedToday = inventory.filter(item => {
    const createdDate = new Date(item.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    return createdDate.getTime() === today.getTime();
  });
  
  const itemsModifiedToday = inventory.filter(item => {
    if (!item.updatedAt) return false;
    const updatedDate = new Date(item.updatedAt);
    updatedDate.setHours(0, 0, 0, 0);
    return updatedDate.getTime() === today.getTime();
  });
  
  const itemsSoldOutToday = inventory.filter(item => {
    if (!item.soldOutAt) return false;
    const soldOutDate = new Date(item.soldOutAt);
    soldOutDate.setHours(0, 0, 0, 0);
    return soldOutDate.getTime() === today.getTime();
  });
  
  // Calculate quantity changes today
  const quantityIncreasedToday = inventory.filter(item => {
    if (!item.lastQuantityChange || !item.lastQuantityChangeDate) return false;
    const changeDate = new Date(item.lastQuantityChangeDate);
    changeDate.setHours(0, 0, 0, 0);
    return changeDate.getTime() === today.getTime() && item.lastQuantityChange > 0;
  });
  
  const quantityDecreasedToday = inventory.filter(item => {
    if (!item.lastQuantityChange || !item.lastQuantityChangeDate) return false;
    const changeDate = new Date(item.lastQuantityChangeDate);
    changeDate.setHours(0, 0, 0, 0);
    return changeDate.getTime() === today.getTime() && item.lastQuantityChange < 0;
  });
  
  const totalQuantityIn = quantityIncreasedToday.reduce((sum, item) => sum + item.lastQuantityChange, 0);
  const totalQuantityOut = Math.abs(quantityDecreasedToday.reduce((sum, item) => sum + item.lastQuantityChange, 0));
  
  // Category breakdown
  const categoryBreakdown = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Inventory Analysis</h2>
              <p className="text-sm text-gray-600">Daily activity and comprehensive insights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-blue-900">{totalItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Quantity</p>
                  <p className="text-2xl font-bold text-green-900">{totalQuantity}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Total Value</p>
                  <p className="text-2xl font-bold text-purple-900">₹{totalValue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Stock Issues</p>
                  <p className="text-2xl font-bold text-red-900">{outOfStockItems.length + lowStockItems.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Activity - Main Focus */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2" />
              Today's Activity ({new Date().toLocaleDateString()})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border-2 border-green-200 shadow-sm">
                <p className="text-sm text-green-700 font-medium mb-1">Items Added Today</p>
                <p className="text-3xl font-bold text-green-600">{itemsAddedToday.length}</p>
                {itemsAddedToday.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">New inventory items</p>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-lg border-2 border-blue-200 shadow-sm">
                <p className="text-sm text-blue-700 font-medium mb-1">Items Modified Today</p>
                <p className="text-3xl font-bold text-blue-600">{itemsModifiedToday.length}</p>
                {itemsModifiedToday.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">Updated inventory</p>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-lg border-2 border-orange-200 shadow-sm">
                <p className="text-sm text-orange-700 font-medium mb-1">Sold Out Today</p>
                <p className="text-3xl font-bold text-orange-600">{itemsSoldOutToday.length}</p>
                {itemsSoldOutToday.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">Items depleted</p>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-lg border-2 border-purple-200 shadow-sm">
                <p className="text-sm text-purple-700 font-medium mb-1">Total Changes</p>
                <p className="text-3xl font-bold text-purple-600">
                  {itemsAddedToday.length + itemsModifiedToday.length + itemsSoldOutToday.length}
                </p>
                <p className="text-xs text-gray-600 mt-2">Activity count</p>
              </div>
            </div>
          </div>

          {/* Stock Movement Today */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock Movement Today</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium mb-1">Quantity In</p>
                <p className="text-3xl font-bold text-green-600">+{totalQuantityIn}</p>
                <p className="text-xs text-gray-600 mt-2">{quantityIncreasedToday.length} items restocked</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 font-medium mb-1">Quantity Out</p>
                <p className="text-3xl font-bold text-red-600">-{totalQuantityOut}</p>
                <p className="text-xs text-gray-600 mt-2">{quantityDecreasedToday.length} items sold/used</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">Net Change</p>
                <p className={`text-3xl font-bold ${totalQuantityIn - totalQuantityOut >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalQuantityIn - totalQuantityOut >= 0 ? '+' : ''}{totalQuantityIn - totalQuantityOut}
                </p>
                <p className="text-xs text-gray-600 mt-2">Overall movement</p>
              </div>
            </div>
          </div>

          {/* Detailed Today's Activity */}
          {(itemsAddedToday.length > 0 || itemsModifiedToday.length > 0 || itemsSoldOutToday.length > 0) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Details</h3>
              <div className="space-y-4">
                {itemsAddedToday.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-green-700 mb-2">✓ Added Today:</p>
                    <div className="flex flex-wrap gap-2">
                      {itemsAddedToday.map(item => (
                        <span key={item.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                          {item.name} ({item.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {itemsModifiedToday.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-2">✏️ Modified Today:</p>
                    <div className="flex flex-wrap gap-2">
                      {itemsModifiedToday.map(item => (
                        <span key={item.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                          {item.name} ({item.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {itemsSoldOutToday.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-orange-700 mb-2">⚠️ Sold Out Today:</p>
                    <div className="flex flex-wrap gap-2">
                      {itemsSoldOutToday.map(item => (
                        <span key={item.id} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stock Alerts */}
          {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Stock Alerts
              </h3>
              <div className="space-y-3">
                {outOfStockItems.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-2">Out of Stock ({outOfStockItems.length} items):</p>
                    <div className="flex flex-wrap gap-2">
                      {outOfStockItems.map(item => (
                        <span key={item.id} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {lowStockItems.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-yellow-700 mb-2">Low Stock ({lowStockItems.length} items):</p>
                    <div className="flex flex-wrap gap-2">
                      {lowStockItems.map(item => (
                        <span key={item.id} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                          {item.name} ({item.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryBreakdown).map(([category, quantity]) => (
                <div key={category} className="bg-white p-4 rounded-lg border">
                  <p className="font-medium text-gray-900">{category}</p>
                  <p className="text-2xl font-bold text-blue-600">{quantity} units</p>
                  <p className="text-sm text-gray-500">
                    {((quantity / totalQuantity) * 100).toFixed(1)}% of total
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
            >
              Close Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalysis;