// server/src/routes/asnRoutes.js
import express from 'express';
import * as asnController from '../controllers/asnController.js';

const router = express.Router();

// Route for creating a new ASN
router.post('/asn', asnController.createAsn);

// Route for generating ASN PDF with barcode
router.get('/asn/:asnNumber/pdf', asnController.generateAsnPdf);

// Routes for Vendor
router.get('/asn', asnController.getAsns);
router.get('/asn/:asnNumber', asnController.getAsnDetails);
router.put('/asn/:asnNumber/fulfill', asnController.fulfillAsn);

// --- NEW ROUTE FOR GATEKEEPER ---
router.post('/asn/:asnNumber/receive', asnController.receiveShipment);

// --- NEW ROUTE FOR WAREHOUSE REVIEW ---
router.patch('/asn/:asnNumber/review', asnController.reviewShipment);

export default router;
