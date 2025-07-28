import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Package, LogOut, Plus, Trash2, Search, AlertCircle, CheckCircle
} from 'lucide-react';
import Login from './components/Login';
import SignUp from './components/SignUp';
import InventoryList from './components/InventoryList';
import AddInventoryForm from './components/AddInventoryForm';
import EditInventoryForm from './components/EditInventoryForm';
import AuthService from './services/AuthService';
import ApiService from './services/ApiService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [authPage, setAuthPage] = useState('login');

  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = async () => {
    try {
      const authData = await AuthService.getCurrentUser();
      if (authData) {
        setIsAuthenticated(true);
        setUser(authData);
      }
    } catch (error) {
      console.warn('Authentication check failed', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ApiService.getInventory(); // No longer pass user.sub
      setInventory(data);
    } catch (error) {
      showNotification('Failed to load inventory.', 'error');
      console.error('Error loading inventory:', error);
    } finally {
     setLoading(false);
    }
  }, []); // Remove user from dependency array
  
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInventory();
    }
  }, [isAuthenticated,user,loadInventory]);

  const handleLogin = async (credentials) => {
    try {
      const authData = await AuthService.signIn(credentials);
      setIsAuthenticated(true);
      setUser(authData);
      showNotification('Successfully logged in.', 'success');
    } catch (error) {
      showNotification('Login failed. Check credentials.', 'error');
      console.error('Error logging in:', error);
    }
  };

  const handleSignUp = async (userData) => {
    try {
      await AuthService.signUp(userData); 
      setPendingConfirmation(userData.email); 
      showNotification('Sign-up successful. Please check your email for a verification code.', 'success');
    } catch (error) {
      showNotification(error.message || 'Sign-up failed.', 'error');
      console.error('Sign-up error:', error);
    }
  };

  const handleConfirmSignUp = async (code) => {
    const email = localStorage.getItem('signup_email'); // ✅ retrieve email here
    if (!email || !confirmationCode) {
      console.error("Missing email or confirmation code");
      return;
    }
    try {
      await AuthService.confirmSignUp({email, code});
      setPendingConfirmation(null);
      setAuthPage('login');
      showNotification('Account confirmed! You can now log in.', 'success');
    } catch (error) {
      showNotification('Confirmation failed. Please try again.', 'error');
      console.error('Confirm error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setInventory([]);
      setShowAddForm(false);
      showNotification('Logged out successfully.', 'success');
    } catch (error) {
      showNotification('Logout failed. Try again.', 'error');
      console.error('Error logging out:', error);
    }
  };

  const handleAddItem = async (itemData) => {
    try {
      const newItem = await ApiService.addInventoryItem({
        ...itemData,
        userId: user?.sub,        
        email: user?.email,       
        createdAt: new Date().toISOString()
      });
      setInventory(prev => [...prev, newItem]);
      setShowAddForm(false);
      showNotification(`Added "${itemData.name}" successfully.`, 'success');
    } catch (error) {
      showNotification('Failed to add item.', 'error');
      console.error('Error adding item:', error);
    }
  };


  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await ApiService.deleteInventoryItem(itemId); // pass userId
      setInventory(prev => prev.filter(item => item.id !== itemId));
      showNotification('Item deleted.', 'success');
    } catch (error) {
      showNotification('Failed to delete item.', 'error');
      console.error('Error deleting item:', error);
    }
  };


 const handleUpdateItem = async (itemId, updatedData) => {
    try {
      const updatedItem = await ApiService.updateInventoryItem({
        id: itemId,
        ...updatedData,
      });
      setInventory(prev => prev.map(item => item.id === itemId ? updatedItem : item));
      setShowEditForm(false);
      setEditingItem(null);
      showNotification(`Updated "${updatedData.name}".`, 'success');
    } catch (error) {
      showNotification('Update failed.', 'error');
      console.log('Error updating item:', error);
    }
  };

  const handleQuantityChange = async (itemId, updatedItem) => {
  try {
      const updated = await ApiService.updateInventoryItem(updatedItem);
      setInventory(prev =>
        prev.map(item => item.id === itemId ? updated : item)
      );
      showNotification(`Updated quantity to ${updated.quantity}.`, 'success');
    } catch (error) {
      showNotification('Failed to update quantity.', 'error');
      console.error('Quantity update error:', error);
    }
  };


  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredInventory = inventory.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-blue-50">
        <div className="text-center">
          <div className="anite-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
  if (authPage === 'login') {
    return <Login onLogin={handleLogin} onSwitchToSignUp={() => setAuthPage('signup')} />;
  } else {
    return (
      <SignUp
        onSignUp={handleSignUp}
        onSwitchToLogin={() => setAuthPage('login')}
        pendingConfirmation={pendingConfirmation}
        confirmationCode={confirmationCode}
        setConfirmationCode={setConfirmationCode}
        handleConfirmSignUp={handleConfirmSignUp}
      />
    )
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg p-4 ${
          notification.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success'
              ? <CheckCircle className="h-5 w-5 text-green-600" />
              : <AlertCircle className="h-5 w-5 text-red-600" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Inventory Manager</h1>
              <p className="text-sm text-gray-500">Serverless Inventory System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="h-5 w-5" />
              <span>{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Inventory Items</h2>
            <p className="text-gray-600">{inventory.length} items in total</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Item
            </button>
          </div>
        </div>

        <InventoryList
          inventory={filteredInventory}
          loading={loading}
          onDeleteItem={handleDeleteItem}
          onEditItem={handleEditItem}
          onQuantityChange={handleQuantityChange}
          searchTerm={searchTerm}
        />
      </main>

      {/* Modals */}
      {showAddForm && (
        <AddInventoryForm
          onSubmit={handleAddItem}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {showEditForm && editingItem && (
        <EditInventoryForm
          item={editingItem}
          onSubmit={handleUpdateItem}
          onCancel={() => {
            setShowEditForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
