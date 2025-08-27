import React from 'react';
import OrderCreationForm from '../components/OrderCreationForm';
import ShipmentDashboard from '../components/ShipmentDashboard';

const WarehousePage = () => {
  return (
    <div>
      <h2>Warehouse Ops View</h2>
      <OrderCreationForm />
      <hr style={{ margin: '20px 0' }} />
      <ShipmentDashboard />
    </div>
  );
};

export default WarehousePage;