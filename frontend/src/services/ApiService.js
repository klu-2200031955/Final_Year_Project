import AuthService from './AuthService';

class ApiService {
  static baseUrl = 'https://ngzz1xf9el.execute-api.us-east-1.amazonaws.com/prod';

  static async makeRequest(endpoint, options = {}) {
    const token = AuthService.getAuthToken();
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': token }),
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Inventory methods
  static async getInventory() {
    return this.makeRequest(`/items`);
  }

  static async addInventoryItem(itemData) {
    return this.makeRequest('/items', {
      method: 'POST',
      body: itemData
    });
  }

  static async updateInventoryItem(item) {
    return this.makeRequest(`/items/${item.id}`, {
      method: 'PUT',
      body: item
    });
  }

  static async deleteInventoryItem(itemId) {
    return this.makeRequest(`/items/${itemId}`, {
      method: 'DELETE'
    });
  }

}

export default ApiService;