import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, ChevronDown, DollarSign, Users, AlertCircle, TrendingUp, Filter, RefreshCw, Download } from 'lucide-react';
import _ from 'lodash';


// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS = {
  true: '#4CAF50',  // green for approved
  false: '#F44336' // red for pending
};

export default function QuotationAnalysisDashboard() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const [mockData, setMockData] = useState([]);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [showAllQuotations, setShowAllQuotations] = useState(false);


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
        setMockData(result.data);
        console.log("Mock Data:", result.data);
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
  useEffect(() => {
    fetchCustomers(); // Fetch data from DB2
  }, []);
  
  useEffect(() => {
    // Update data once mockData is updated
    setData(mockData);
    console.log("Data:", mockData);
  }, [mockData]);
  

  // Calculate key metrics
  const totalQuotations = data.length;
  const totalAmount = _.sumBy(data, 'TOTAL_AMOUNT');
  const approvedQuotations = data.filter(q => q.STATUS).length;
  const pendingQuotations = data.filter(q => !q.STATUS).length;
  const approvalRate = totalQuotations ? (approvedQuotations / totalQuotations * 100).toFixed(1) : 0;
  
  // Prepare data for company distribution chart
  const companyDistribution = _.chain(data)
    .groupBy('COMPANY_NAME')
    .map((items, company) => ({
      name: company,
      count: items.length,
      value: items.length, // for pie chart
      totalAmount: _.sumBy(items, 'TOTAL_AMOUNT')
    }))
    .value();
  
  // Prepare data for status distribution
  const statusDistribution = [
    { name: 'Approved', value: approvedQuotations },
    { name: 'Pending', value: pendingQuotations }
  ];
  
  // State distribution
  const stateDistribution = _.chain(data)
    .groupBy('STATE')
    .map((items, state) => ({
      name: state,
      count: items.length,
      value: items.length,
      totalAmount: _.sumBy(items, 'TOTAL_AMOUNT')
    }))
    .value();

  // Sort quotations by date for timeline analysis
  const sortedQuotations = _.sortBy(data, q => new Date(q.QUOTATION_REG));
  
  // Format data for quotation timeline chart
  const timelineData = sortedQuotations.map(q => ({
    date: q.QUOTATION_REG,
    amount: q.TOTAL_AMOUNT,
    status: q.STATUS ? 'Approved' : 'Pending',
    company: q.COMPANY_NAME
  }));
  
  // Average amount per company
  const avgAmountPerCompany = _.chain(data)
    .groupBy('COMPANY_NAME')
    .map((items, company) => ({
      name: company,
      average: _.sumBy(items, 'TOTAL_AMOUNT') / items.length
    }))
    .value();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-500" />
          <h2 className="text-xl font-semibold">Loading Data Analysis...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Quotation Analysis Dashboard</h1>
          <div className="flex space-x-4">
            <div className="relative">
              <button className="flex items-center space-x-2 bg-white border rounded-md px-3 py-2 text-sm">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <button className="flex items-center space-x-2 bg-blue-600 text-white rounded-md px-4 py-2 text-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <nav className="flex px-6">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-6 font-medium text-sm ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('companies')}
            className={`py-4 px-6 font-medium text-sm ${activeTab === 'companies' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            Company Analysis
          </button>
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`py-4 px-6 font-medium text-sm ${activeTab === 'timeline' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            Timeline Analysis
          </button>
          <button 
            onClick={() => setActiveTab('geographic')}
            className={`py-4 px-6 font-medium text-sm ${activeTab === 'geographic' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            Geographic Analysis
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Quotations</p>
                <h3 className="text-xl font-bold">{totalQuotations}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <h3 className="text-xl font-bold">${totalAmount.toLocaleString()}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Quotations</p>
                <h3 className="text-xl font-bold">{pendingQuotations}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approval Rate</p>
                <h3 className="text-xl font-bold">{approvalRate}%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quotation Status Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? STATUS_COLORS.true : STATUS_COLORS.false} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} quotations`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Company Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quotation by Company</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={companyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} quotations`, 'Count']} />
                    <Legend />
                    <Bar dataKey="count" name="Quotation Count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Average Amount per Company */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Average Amount per Company</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={avgAmountPerCompany}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Average Amount']} />
                    <Legend />
                    <Bar dataKey="average" name="Average Amount" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Quotations */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Quotations</h2>
                <span 
                className="text-sm text-blue-600 cursor-pointer"
                onClick={() => setShowAllQuotations(!showAllQuotations)}
                >
                  View All
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {(showAllQuotations ? sortedQuotations.slice().reverse() : sortedQuotations.slice(-5).reverse()).map((q) => (
                      <tr key={q.QUOTATION_ID}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{q.QUOTATION_ID}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{q.COMPANY_NAME}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">${q.TOTAL_AMOUNT.toLocaleString()}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span 
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${q.STATUS ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {q.STATUS ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Company Performance */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Company Performance Analysis</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={companyDistribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Number of Quotations" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="totalAmount" name="Total Amount ($)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Company Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quotation Status by Company</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={_.chain(data)
                      .groupBy('COMPANY_NAME')
                      .map((items, company) => ({
                        name: company,
                        approved: items.filter(i => i.STATUS).length,
                        pending: items.filter(i => !i.STATUS).length
                      }))
                      .value()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="approved" name="Approved" stackId="a" fill={STATUS_COLORS.true} />
                    <Bar dataKey="pending" name="Pending" stackId="a" fill={STATUS_COLORS.false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Timeline Analysis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quotation Timeline Analysis</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timelineData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                    <Legend />
                    <Line type="monotone" dataKey="amount" name="Quotation Amount" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quotation Status Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quotation Status Timeline</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={_.chain(timelineData)
                      .groupBy('date')
                      .map((items, date) => ({
                        date,
                        approved: items.filter(i => i.status === 'Approved').length,
                        pending: items.filter(i => i.status === 'Pending').length
                      }))
                      .value()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="approved" name="Approved" stackId="a" fill={STATUS_COLORS.true} />
                    <Bar dataKey="pending" name="Pending" stackId="a" fill={STATUS_COLORS.false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'geographic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* State Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quotation by State</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stateDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {stateDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} quotations`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Amount by State */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Total Amount by State</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Total Amount']} />
                    <Legend />
                    <Bar dataKey="totalAmount" name="Total Amount" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Cities */}
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Quotation by City</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={_.chain(data)
                      .groupBy('CITY')
                      .map((items, city) => ({
                        name: city,
                        count: items.length,
                        totalAmount: _.sumBy(items, 'TOTAL_AMOUNT')
                      }))
                      .value()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Number of Quotations" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="totalAmount" name="Total Amount ($)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}