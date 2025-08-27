import React, { useState, useEffect } from 'react';
import { getAssignedShipments, fulfillShipment } from '../services/api';

const VendorDashboard = () => {
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAsn, setSelectedAsn] = useState(null); // To hold data for the fulfillment form

  const fetchAssigned = async () => {
    try {
      setLoading(true);
      const data = await getAssignedShipments();
      setAssigned(data);
    } catch (err) {
      setError('Failed to fetch assigned shipments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const handleFulfillClick = (asn) => {
    // For now, we'll use a simple prompt. A modal form would be better in a real app.
    const carrier = prompt("Enter Shipping Carrier:");
    const tracking = prompt("Enter Tracking Number:");
    
    if (carrier && tracking) {
      const fulfillmentData = {
        // In a real app, you'd have inputs for partial shipments
        itemsShipped: asn.lineItems, 
        shippingCarrier: carrier,
        trackingNumber: tracking,
      };

      fulfillShipment(asn.asnNumber, fulfillmentData)
        .then(() => {
          alert('Shipment fulfilled successfully!');
          fetchAssigned(); // Refresh the list
        })
        .catch(err => alert(`Error: ${err.response?.data?.message || err.message}`));
    }
  };

  if (loading) return <p>Loading assigned shipments...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Vendor Dashboard: Assigned Shipments</h2>
      {assigned.length === 0 ? (
        <p>No new shipments assigned.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ASN Number</th>
              <th>Order ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assigned.map((asn) => (
              <tr key={asn.asnNumber}>
                <td>{asn.asnNumber}</td>
                <td>{asn.orderId}</td>
                <td>
                  <button onClick={() => handleFulfillClick(asn)}>Fulfill Shipment</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VendorDashboard;