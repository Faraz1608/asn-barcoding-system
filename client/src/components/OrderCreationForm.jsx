import React, { useState } from 'react';
import { createOrder, createAsn } from '../services/api';

const OrderCreationForm = () => {
  const [lineItems, setLineItems] = useState([{ productId: '', quantityRequested: '' }]);
  const [message, setMessage] = useState('');

  const handleInputChange = (index, event) => {
    const values = [...lineItems];
    values[index][event.target.name] = event.target.value;
    setLineItems(values);
  };

  const handleAddFields = () => {
    setLineItems([...lineItems, { productId: '', quantityRequested: '' }]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('Creating order...');
    try {
      // 1. Create the Order
      const orderResponse = await createOrder({ lineItems });
      setMessage(`Order ${orderResponse.orderId} created! Generating ASN...`);

      // 2. Create the ASN for the new Order
      const asnData = { orderId: orderResponse.orderId, vendorId: 'VENDOR-A' }; // Vendor assignment placeholder
      const asnResponse = await createAsn(asnData);
      
      setMessage(`Success! ASN ${asnResponse.asnNumber} generated for Order ${orderResponse.orderId}.`);
      setLineItems([{ productId: '', quantityRequested: '' }]); // Reset form

    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div>
      <h2>Create New Shipment Order</h2>
      <form onSubmit={handleSubmit}>
        {lineItems.map((item, index) => (
          <div key={index}>
            <input
              type="text"
              name="productId"
              placeholder="Product ID / SKU"
              value={item.productId}
              onChange={event => handleInputChange(index, event)}
              required
            />
            <input
              type="number"
              name="quantityRequested"
              placeholder="Quantity"
              value={item.quantityRequested}
              onChange={event => handleInputChange(index, event)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={handleAddFields}>Add Another Product</button>
        <button type="submit">Create Order</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default OrderCreationForm;