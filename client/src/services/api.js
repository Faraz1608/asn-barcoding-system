import axios from 'axios';

// This will now correctly point to your proxied backend
const API_URL = '/api';

// --- Order and ASN Creation (Warehouse Ops) ---
export const createOrder = async (orderData) => {
  const response = await axios.post(`${API_URL}/orders`, orderData);
  return response.data;
};

export const createAsn = async (asnData) => {
  const response = await axios.post(`${API_URL}/asn`, asnData);
  return response.data;
};
export const getShipments = async () => {
  const response = await axios.get(`${API_URL}/asn`);
  return response.data;
};
export const getAssignedShipments = async () => {
  // Fetch shipments that are ready for fulfillment
  const response = await axios.get(`${API_URL}/asn?status=ORDERED`);
  return response.data;
};

export const fulfillShipment = async (asnNumber, fulfillmentData) => {
  const response = await axios.put(`${API_URL}/asn/${asnNumber}/fulfill`, fulfillmentData);
  return response.data;
};
export const receiveShipment = async (asnNumber) => {
  const response = await axios.post(`${API_URL}/asn/${asnNumber}/receive`);
  return response.data;
};