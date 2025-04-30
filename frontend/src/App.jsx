import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import QuotationAnalysisDashboard from './components/QuotationAnalysisDashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<CustomerList />} />
          <Route path="/add" element={<CustomerForm />} />
          <Route path="/edit/:id" element={<CustomerForm />} />
          <Route path='/dashboard' element={<QuotationAnalysisDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;