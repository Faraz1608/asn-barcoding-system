// server/controllers/asnController.js
import Asn from '../models/asn.js';
import Order from '../models/order.js'; // We need this to update the order status

export const createAsn = async (req, res) => {
  try {
    const { orderId, vendorId } = req.body;

    // 1. Validate the order
    const order = await Order.findOne({ orderId: orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    if (order.status !== 'OPEN') {
      return res.status(400).json({ message: "ASN already generated for this order." });
    }

    // 2. Create the new ASN
    const newAsnNumber = `ASN-${Date.now()}`;
    const newAsn = new Asn({
      asnNumber: newAsnNumber,
      orderId: orderId,
      vendorId: vendorId,
      history: [{ status: 'ORDERED' }]
    });
    await newAsn.save();

    // 3. Update the order's status
    order.status = 'ASN_GENERATED';
    await order.save();

    res.status(201).json({
      asnNumber: newAsn.asnNumber,
      orderId: newAsn.orderId,
      vendorId: newAsn.vendorId,
      status: newAsn.status,
      message: "ASN generated and assigned to vendor."
    });

  } catch (error) {
    res.status(500).json({ message: "Error generating ASN", error: error.message });
  }
};

export const getVendorAsns = async (req, res) => {
  try {
    // In a real app, you'd get vendorId from logged-in user session
    // const { vendorId } = req.user; 
    const { status } = req.query; // e.g., status=ORDERED

    const query = { status: status };
    // query.vendorId = vendorId;

    const asns = await Asn.find(query).select('asnNumber orderId createdAt');
    res.status(200).json(asns);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ASNs", error: error.message });
  }
};

// Get the full details of a single ASN
export const getAsnDetails = async (req, res) => {
  try {
    const { asnNumber } = req.params;
    const asn = await Asn.findOne({ asnNumber: asnNumber });

    if (!asn) {
      return res.status(404).json({ message: "ASN not found." });
    }
    // You could also populate order details here if needed
    res.status(200).json(asn);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ASN details", error: error.message });
  }
};

// Fulfill an ASN
export const fulfillAsn = async (req, res) => {
  try {
    const { asnNumber } = req.params;
    const { itemsShipped, shippingCarrier, trackingNumber, notes } = req.body;

    const asn = await Asn.findOne({ asnNumber: asnNumber });
    if (!asn) {
      return res.status(404).json({ message: "ASN not found." });
    }
    if (asn.status !== 'ORDERED') {
      return res.status(400).json({ message: "This shipment has already been processed." });
    }

    // Update the ASN document
    asn.status = 'IN_TRANSIT';
    asn.itemsShipped = itemsShipped;
    asn.shippingCarrier = shippingCarrier;
    asn.trackingNumber = trackingNumber;
    asn.notes = notes;
    asn.history.push({ status: 'IN_TRANSIT' });

    await asn.save();

    res.status(200).json({
      asnNumber: asn.asnNumber,
      status: asn.status,
      message: "ASN has been fulfilled and is now in transit."
    });
  } catch (error) {
    res.status(500).json({ message: "Error fulfilling ASN", error: error.message });
  }
};

// Mark a shipment as received at the gate
export const receiveShipment = async (req, res) => {
  try {
    const { asnNumber } = req.params;

    const asn = await Asn.findOne({ asnNumber: asnNumber });
    if (!asn) {
      return res.status(404).json({ message: "ASN not found. Invalid barcode scan." });
    }

    // Validate the current status. Only a shipment in transit can be received.
    if (asn.status !== 'IN_TRANSIT') {
      return res.status(400).json({ 
        message: `Shipment cannot be received. Current status is: ${asn.status}` 
      });
    }

    // Update the status and history
    asn.status = 'RECEIVED_PENDING_REVIEW';
    asn.history.push({ status: 'RECEIVED_PENDING_REVIEW' });
    await asn.save();

    res.status(200).json({
      asnNumber: asn.asnNumber,
      status: asn.status,
      message: "Shipment received successfully. Pending warehouse review."
    });

  } catch (error) {
    res.status(500).json({ message: "Error receiving shipment", error: error.message });
  }
};
// Get all ASNs, with optional filtering by status
export const getAsns = async (req, res) => {
  try {
    const { status } = req.query; // e.g., status=ORDERED

    const query = {};
    if (status) {
      query.status = status;
    }

    const asns = await Asn.find(query).sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json(asns);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ASNs", error: error.message });
  }
};