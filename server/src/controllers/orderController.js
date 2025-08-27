// server/controllers/orderController.js
import Order from '../models/order.js';

export const createOrder = async (req, res) => {
  try {
    const { lineItems, expectedDeliveryDate } = req.body;
    
    // Generate a unique orderId (simplified)
    const newOrderId = `ORD-${Date.now()}`;

    const newOrder = new Order({
      orderId: newOrderId,
      createdBy: 'WarehouseUser-1', // Placeholder
      lineItems: lineItems,
      expectedDeliveryDate: expectedDeliveryDate
    });

    await newOrder.save();
    
    res.status(201).json({
      orderId: newOrder.orderId,
      status: newOrder.status,
      message: "Order created successfully. Ready to generate ASN."
    });

  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};