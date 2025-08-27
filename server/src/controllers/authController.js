import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// @desc   Register a new user
export const registerUser = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      password: hashedPassword,
      role
    });

    res.status(201).json({ _id: user._id, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Authenticate user & get token
export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET, // Add this to your .env file!
        { expiresIn: '1h' }
      );
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const reviewShipment = async (req, res) => {
  try {
    const { asnNumber } = req.params;
    const { newStatus, notes } = req.body; // newStatus will be 'APPROVED_FOR_PAYMENT' or 'DISCREPANCY_REPORTED'

    // Validate the new status
    if (!['APPROVED_FOR_PAYMENT', 'DISCREPANCY_REPORTED'].includes(newStatus)) {
      return res.status(400).json({ message: 'Invalid status update.' });
    }

    const asn = await Asn.findOne({ asnNumber: asnNumber });
    if (!asn) {
      return res.status(404).json({ message: 'ASN not found.' });
    }

    // A shipment must be pending review to be updated
    if (asn.status !== 'RECEIVED_PENDING_REVIEW') {
      return res.status(400).json({ message: `Cannot review shipment. Current status is: ${asn.status}` });
    }

    // Update status, notes, and history
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