import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader } from 'lucide-react';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    quotation_id: '',
    quotation_reg: new Date().toISOString().slice(0, 10),
    quotation_exp: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10),
    total_amount: 0,
    status: 0,
    address: '',
    city: '',
    state: ''
  });
  
  useEffect(() => {
    
    if (isEditing) {
      fetchCustomerData();
      console.log("CustomerForm mounted with ID:", id);
    } else {
      // Generate a unique ID for new customers
      setFormData({
        ...formData,
        id: 'CUST' + Date.now().toString().slice(-8)
      });
    }
  }, [id]);
  
  const fetchCustomerData = async () => {
    try {
      const response = await fetch('http://localhost:8888/viewByID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const result = await response.json();
      console.log("Fetched customer data:", result);
      
      if (result.success === 1 && result.data.length > 0) {
        const customer = result.data[0];
        
        // Format dates from DB format to input format (if needed)
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          return date.toISOString().slice(0, 10);
        };
        
        setFormData({
          id: customer.ID,
          company_name: customer.COMPANY_NAME || '',
          contact_person: customer.CONTACT_PERSON || '',
          phone: customer.PHONE || '',
          email: customer.EMAIL || '',
          quotation_id: customer.QUOTATION_ID || '',
          quotation_reg: formatDate(customer.QUOTATION_REG),
          quotation_exp: formatDate(customer.QUOTATION_EXP),
          total_amount: customer.TOTAL_AMOUNT || 0,
          status: customer.STATUS || 0,
          address: customer.ADDRESS || '',
          city: customer.CITY || '',
          state: customer.STATE || ''
        });
      } else {
        setError('Failed to fetch customer data');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };
  
  const handleStatusChange = (e) => {
    setFormData({
      ...formData,
      status: parseInt(e.target.value)
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const endpoint = isEditing ? '/update' : '/create';
      const requestBody = isEditing 
        ? { id: id, data: formData }
        : { customer: JSON.stringify(formData) };
      
      const response = await fetch(`http://localhost:8888${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const result = await response.json();
      
      if (result.success === 1) {
        navigate('/');
      } else {
        setError('Failed to save customer: ' + result.message);
        setSaving(false);
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft size={18} className="mr-1" /> Back to customers
      </button>
      
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? 'Edit Customer Details' : 'Create New Customer'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer ID (Read-only if editing) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              disabled={isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name*</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Contact Person */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person*</label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quotation ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quotation ID</label>
            <input
              type="text"
              name="quotation_id"
              value={formData.quotation_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Quotation Registration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
            <input
              type="date"
              name="quotation_reg"
              value={formData.quotation_reg}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Quotation Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="date"
              name="quotation_exp"
              value={formData.quotation_exp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
            <input
              type="number"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Pending</option>
              <option value={1}>Active</option>
            </select>
          </div>
          
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md mr-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {saving ? (
              <>
                <Loader size={18} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {isEditing ? 'Update Customer' : 'Create Customer'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;