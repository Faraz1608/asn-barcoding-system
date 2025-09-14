// server/src/controllers/asnController.js
import Asn from '../models/asn.js';
import Order from '../models/order.js';
import PDFDocument from 'pdfkit';
import bwipjs from 'bwip-js';

// ... (createAsn function remains the same) ...
export const createAsn = async (req, res) => {
  try {
    const { orderId, vendorId } = req.body;

    const order = await Order.findOne({ orderId: orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    if (order.status !== 'OPEN') {
      return res.status(400).json({ message: "ASN already generated for this order." });
    }

    const newAsnNumber = `ASN-${Date.now()}`;
    const newAsn = new Asn({
      asnNumber: newAsnNumber,
      orderId: order._id,
      vendorId: vendorId,
      history: [{ status: 'ORDERED' }]
    });
    await newAsn.save();

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


export const generateAsnPdf = async (req, res) => {
    try {
        const { asnNumber } = req.params;
        const asn = await Asn.findOne({ asnNumber }).populate('orderId');

        if (!asn || !asn.orderId) {
            return res.status(404).json({ message: "ASN or associated Order not found." });
        }
        
        const order = asn.orderId;
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${asnNumber}.pdf`);

        doc.pipe(res);

        // --- PDF Generation Logic ---

        const generateTableRow = (y, c1, c2, c3) => {
            doc.fontSize(10)
                .text(c1, 50, y)
                .text(c2, 250, y)
                .text(c3, 350, y, { width: 200, align: 'left' });
        };
        
        const generateHr = (y) => {
            doc.strokeColor("#aaaaaa")
               .lineWidth(1)
               .moveTo(50, y)
               .lineTo(550, y)
               .stroke();
        };

        // Header
        doc.fontSize(20).text('Advanced Shipping Notice (ASN)', { align: 'center' });
        doc.moveDown(2);

        // ASN and Order Details
        doc.fontSize(12).text(`ASN Number: ${asn.asnNumber}`, { align: 'left' });
        doc.text(`Order ID: ${order.orderId}`, { align: 'right' });
        doc.moveDown(2);
        
        // Barcode
        const barcodeBuffer = await bwipjs.toBuffer({
            bcid: 'code128',
            text: asn.asnNumber,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: 'center',
        });

        doc.image(barcodeBuffer, {
            fit: [400, 100],
            align: 'center',
        });

        // INCREASED VERTICAL SPACING HERE TO FIX OVERLAP
        doc.moveDown(8);
        
        // Shipping Details
        doc.fontSize(14).text('Shipping Details', { underline: true });
        doc.moveDown();
        doc.fontSize(12)
           .text(`Shipping Carrier: ${asn.shippingCarrier || 'N/A'}`)
           .text(`Tracking Number: ${asn.trackingNumber || 'N/A'}`);
        doc.moveDown(2);

        // Products Table
        doc.fontSize(14).text('Products Shipped', { underline: true });
        doc.moveDown();

        const tableTop = doc.y;
        generateTableRow(tableTop, "Product ID", "Quantity", "Product Name");
        generateHr(tableTop + 20);

        let position = tableTop + 30;
        for (const item of order.lineItems) {
            generateTableRow(
                position,
                item.productId,
                item.quantityRequested.toString(),
                item.productName || 'N/A'
            );
            position += 20;
            if (position > 700) {
                doc.addPage();
                position = 50;
            }
        }
        
        doc.end();

    } catch (error) {
        res.status(500).json({ message: "Error generating ASN PDF", error: error.message });
    }
};


// ... (rest of the controller functions remain the same) ...
export const getVendorAsns = async (req, res) => {
  try {
    const { status } = req.query; 

    const query = { status: status };

    const asns = await Asn.find(query).select('asnNumber orderId createdAt');
    res.status(200).json(asns);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ASNs", error: error.message });
  }
};

export const getAsnDetails = async (req, res) => {
  try {
    const { asnNumber } = req.params;
    const asn = await Asn.findOne({ asnNumber: asnNumber });

    if (!asn) {
      return res.status(404).json({ message: "ASN not found." });
    }
    res.status(200).json(asn);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ASN details", error: error.message });
  }
};

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

export const receiveShipment = async (req, res) => {
  try {
    const { asnNumber } = req.params;

    const asn = await Asn.findOne({ asnNumber: asnNumber });
    if (!asn) {
      return res.status(404).json({ message: "ASN not found. Invalid barcode scan." });
    }

    if (asn.status !== 'IN_TRANSIT') {
      return res.status(400).json({ 
        message: `Shipment cannot be received. Current status is: ${asn.status}` 
      });
    }

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

export const getAsns = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const asns = await Asn.find(query).sort({ createdAt: -1 });
    res.status(200).json(asns);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ASNs", error: error.message });
  }
};

export const reviewShipment = async (req, res) => {
  try {
    const { asnNumber } = req.params;
    const { newStatus, notes } = req.body;

    if (!['APPROVED_FOR_PAYMENT', 'DISCREPANCY_REPORTED'].includes(newStatus)) {
      return res.status(400).json({ message: 'Invalid status update.' });
    }

    const asn = await Asn.findOne({ asnNumber: asnNumber });
    if (!asn) {
      return res.status(404).json({ message: 'ASN not found.' });
    }

    if (asn.status !== 'RECEIVED_PENDING_REVIEW') {
      return res.status(400).json({ message: `Cannot review shipment. Current status is: ${asn.status}` });
    }

    asn.status = newStatus;
    if (notes) {
      asn.notes = notes;
    }
    asn.history.push({ status: newStatus });
    await asn.save();

    res.status(200).json({
      asnNumber: asn.asnNumber,
      status: asn.status,
      message: `Shipment status updated to ${newStatus}.`
    });

  } catch (error) {
    res.status(500).json({ message: 'Error updating shipment status', error: error.message });
  }
};
