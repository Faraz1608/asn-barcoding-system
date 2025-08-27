// server/models/Order.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const orderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true }, // Simplified for now
  createdAt: { type: Date, default: Date.now },
  lineItems: [{
    productId: String,
    productName: String,
    quantityRequested: Number
  }],
  expectedDeliveryDate: Date,
  status: { type: String, default: 'OPEN' }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;