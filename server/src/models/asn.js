// server/models/Asn.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const asnSchema = new Schema({
  asnNumber: { type: String, required: true, unique: true },
  orderId: { type: Schema.Types.ObjectId, required: true, ref: 'Order' },
  vendorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, required: true, default: 'ORDERED' },
  itemsShipped: [{
    productId: String,
    quantityShipped: Number
  }],
  shippingCarrier: String,
  trackingNumber: String,
  notes: String,
  history: [{
    status: String,
    changedAt: { type: Date, default: Date.now }
  }]
});

const Asn = mongoose.model('Asn', asnSchema);
export default Asn;
