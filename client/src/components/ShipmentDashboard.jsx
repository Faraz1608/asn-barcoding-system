import React, { useState, useEffect } from 'react';
import { getShipments } from '../services/api';

const ShipmentDashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        const data = await getShipments();
        setShipments(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch shipments.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []); // The empty array ensures this runs only once on mount

  if (loading) return <p>Loading shipments...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Shipment Dashboard</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>ASN Number</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Order ID</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Created At</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((shipment) => (
            <tr key={shipment.asnNumber} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{shipment.asnNumber}</td>
              <td style={{ padding: '8px' }}>{shipment.orderId}</td>
              <td style={{ padding: '8px' }}>{shipment.status}</td>
              <td style={{ padding: '8px' }}>{new Date(shipment.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShipmentDashboard;