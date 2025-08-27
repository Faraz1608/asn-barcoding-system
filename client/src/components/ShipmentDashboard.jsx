import React, { useState, useEffect } from 'react';
import { getShipments } from '../services/api';
import {
  Box,
  Heading,
  Text,
  VStack,
  Flex,
  Tag,
  Spacer,
  Alert,
  AlertIcon,
  Spinner
} from '@chakra-ui/react';

// Helper function to determine the color of the status tag
const getStatusColor = (status) => {
  switch (status) {
    case 'ORDERED':
      return 'blue';
    case 'IN_TRANSIT':
      return 'orange';
    case 'RECEIVED_PENDING_REVIEW':
      return 'purple';
    case 'APPROVED_FOR_PAYMENT':
      return 'green';
    case 'DISCREPANCY_REPORTED':
      return 'red';
    default:
      return 'gray';
  }
};

const ShipmentDashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        const data = await getShipments();
        setShipments(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch shipments.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  if (loading) return <Flex justify="center" align="center" height="200px"><Spinner size="xl" /></Flex>;
  
  if (error) return (
    <Alert status="error">
      <AlertIcon />
      {error}
    </Alert>
  );

  return (
    <Box>
      <Heading size="lg" mb={6}>Shipment Dashboard</Heading>
      <VStack spacing={4} align="stretch">
        {shipments.length === 0 ? (
          <Text>No shipments found.</Text>
        ) : (
          shipments.map((shipment) => (
            <Box key={shipment.asnNumber} p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm">
              <Flex align="center">
                <Box>
                  <Heading size="md">{shipment.asnNumber}</Heading>
                  <Text fontSize="sm" color="gray.500">Order ID: {shipment.orderId}</Text>
                </Box>
                <Spacer />
                <Tag size="lg" variant="solid" colorScheme={getStatusColor(shipment.status)}>
                  {shipment.status}
                </Tag>
              </Flex>
              <Text mt={4} fontSize="sm" color="gray.600">
                Created: {new Date(shipment.createdAt).toLocaleString()}
              </Text>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default ShipmentDashboard;