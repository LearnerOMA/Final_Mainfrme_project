import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Plus, Search, RefreshCw } from 'lucide-react';
import DeleteConfirmation from './DeleteConfirmation';
import CustomerCard from './CustomerCard';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8888/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ num: 100 }), // Fetch up to 100 customers
      });
      
      const result = await response.json();
      console.log(result);
      
      if (result.success === 1) {
        setCustomers(result.data);
      } else {
        setError('Failed to fetch customers: ' + result.message);
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    try {
      const response = await fetch('http://localhost:8888/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: customerToDelete.ID }),
      });
      
      const result = await response.json();
      
      if (result.success === 1) {
        setCustomers(customers.filter(c => c.ID !== customerToDelete.ID));
        setShowDeleteModal(false);
        setCustomerToDelete(null);
      } else {
        setError('Failed to delete customer: ' + result.message);
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    }
  };
  
  const filteredCustomers = customers.filter(customer => 
    customer.COMPANY_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.CONTACT_PERSON?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button 
          onClick={fetchCustomers}
          className="mt-3 flex items-center text-blue-600 hover:text-blue-800"
        >
          <RefreshCw size={16} className="mr-1" /> Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="relative w-full md:w-64 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <div className="flex space-x-4">
          <div className="flex border rounded-lg overflow-hidden">
            <button 
              className={`px-3 py-1.5 ${view === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setView('grid')}
            >
              Grid
            </button>
            <button 
              className={`px-3 py-1.5 ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>
          
          <Link 
            to="/add" 
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} className="mr-1" /> Add Customer
          </Link>
        </div>
      </div>
      
      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No customers found</p>
          <Link 
            to="/add" 
            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
          >
            <Plus size={16} className="mr-1" /> Add your first customer
          </Link>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <CustomerCard 
              key={customer.ID} 
              customer={customer} 
              onEdit={() => {}} 
              onDelete={() => handleDeleteClick(customer)} 
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map(customer => (
                <tr key={customer.ID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{customer.COMPANY_NAME}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>{customer.CONTACT_PERSON}</div>
                    <div className="text-sm text-gray-500">{customer.EMAIL}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${customer.STATUS === 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {customer.STATUS === 1 ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${customer.TOTAL_AMOUNT?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link 
                        to={`/edit/${customer.ID}`} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDeleteClick(customer)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmation
          customer={customerToDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setCustomerToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default CustomerList;