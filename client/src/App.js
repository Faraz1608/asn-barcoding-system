import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import WarehousePage from './pages/WarehousePage';
import VendorPage from './pages/VendorPage';
import GatekeeperPage from './pages/GatekeeperPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>ASN Barcode System</h1>
        <nav>
          <Link to="/warehouse">Warehouse</Link> | <Link to="/vendor">Vendor</Link> | <Link to="/gatekeeper">Gatekeeper</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/warehouse" element={<WarehousePage />} />
          <Route path="/vendor" element={<VendorPage />} />
          <Route path="/gatekeeper" element={<GatekeeperPage />} />
          <Route path="/" element={<h2>Welcome! Please select a view above.</h2>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;