import React, { useState } from 'react';
import { receiveShipment } from '../services/api';

const GatekeeperInterface = () => {
  const [asnNumber, setAsnNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!asnNumber) {
      setMessage('Please enter an ASN Number.');
      return;
    }
    
    setIsLoading(true);
    setMessage('');

    try {
      const response = await receiveShipment(asnNumber);
      setMessage(`Success: ${response.message}`);
      setAsnNumber(''); // Clear input after success
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || 'An unexpected error occurred.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Gatekeeper Verification</h2>
      <p>Scan or enter the ASN from the shipment barcode.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={asnNumber}
          onChange={(e) => setAsnNumber(e.target.value)}
          placeholder="Enter ASN Number"
          style={{ padding: '8px', marginRight: '8px' }}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify Receipt'}
        </button>
      </form>
      {message && <p style={{ marginTop: '15px' }}>{message}</p>}
    </div>
  );
};

export default GatekeeperInterface;