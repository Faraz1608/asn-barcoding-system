import express from 'express';
import * as asnController from '../controllers/asnController.js';

const router = express.Router();

// Route for creating a new ASN
router.post('/asn', asnController.createAsn);

// Routes for Vendor
router.get('/asn', asnController.getAsns);
router.get('/asn/:asnNumber', asnController.getAsnDetails);
router.put('/asn/:asnNumber/fulfill', asnController.fulfillAsn);

// --- NEW ROUTE FOR GATEKEEPER ---
router.post('/asn/:asnNumber/receive', asnController.receiveShipment);


export default router;