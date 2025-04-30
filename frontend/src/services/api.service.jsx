const API_URL = 'http://localhost:8888';

export const customerService = {
  // Fetch all customers
  getAllCustomers: async (limit = 100) => {
    try {
      const response = await fetch(`${API_URL}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ num: limit }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },
  
  // Get customer by ID
  getCustomerById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/viewByID`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  },
  
  // Create new customer
  createCustomer: async (customer) => {
    try {
      const response = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer: JSON.stringify(customer) }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },
  
  // Update customer
  updateCustomer: async (id, data) => {
    try {
      const response = await fetch(`${API_URL}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, data }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },
  
  // Delete customer
  deleteCustomer: async (id) => {
    try {
      const response = await fetch(`${API_URL}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }
};