import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<CustomerList />} />
          <Route path="/add" element={<CustomerForm />} />
          <Route path="/edit/:id" element={<CustomerForm />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;