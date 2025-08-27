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
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/users/login`, credentials);
  if (response.data.token) {
    localStorage.setItem('userToken', response.data.token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('userToken');
};
export const getPendingReviewShipments = async () => {
  const response = await axios.get(`${API_URL}/asn?status=RECEIVED_PENDING_REVIEW`);
  return response.data;
};

export const reviewShipment = async (asnNumber, reviewData) => {
  const response = await axios.patch(`${API_URL}/asn/${asnNumber}/review`, reviewData);
  return response.data;
};