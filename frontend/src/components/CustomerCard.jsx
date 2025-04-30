import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';

const CustomerCard = ({ customer, onDelete }) => {
  // Format date to be more readable
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{customer.COMPANY_NAME}</h3>
            <p className="text-sm text-gray-600 mt-1">{customer.CONTACT_PERSON}</p>
          </div>
          <span 
            className={`px-2 py-1 text-xs font-semibold rounded-full 
              ${customer.STATUS === 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`
            }
          >
            {customer.STATUS === 1 ? 'Active' : 'Pending'}
          </span>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <Mail size={16} className="mr-2 text-gray-400" />
            <span>{customer.EMAIL || 'No email provided'}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Phone size={16} className="mr-2 text-gray-400" />
            <span>{customer.PHONE || 'No phone provided'}</span>
          </div>
          
          {(customer.ADDRESS || customer.CITY || customer.STATE) && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin size={16} className="mr-2 text-gray-400" />
              <span>
                {[
                  customer.ADDRESS,
                  customer.CITY,
                  customer.STATE
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar size={16} className="mr-2 text-gray-400" />
            <span>Exp: {formatDate(customer.QUOTATION_EXP)}</span>
          </div>
          
          <div className="flex items-center text-sm font-medium">
            <DollarSign size={16} className="mr-2 text-blue-500" />
            <span>${customer.TOTAL_AMOUNT?.toLocaleString() || '0'}</span>
          </div>
        </div>
      </div>
      
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
        <Link 
          to={`/edit/${customer.ID}`}
          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
        >
          <Edit2 size={14} className="mr-1" /> Edit
        </Link>
        <button 
          onClick={() => onDelete(customer)}
          className="text-red-600 hover:text-red-800 flex items-center text-sm"
        >
          <Trash2 size={14} className="mr-1" /> Delete
        </button>
      </div>
    </div>
  );
};

export default CustomerCard;