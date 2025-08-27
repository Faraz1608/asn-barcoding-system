import React, { useState, useEffect } from 'react';
import { getPendingReviewShipments, reviewShipment } from '../services/api';
import {
  Box, Heading, Text, VStack, Flex, Spacer, Button, Spinner, useToast, Alert, AlertIcon, HStack
} from '@chakra-ui/react';

const WarehouseReviewPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchPendingShipments = async () => {
    try {
      setLoading(true);
      const data = await getPendingReviewShipments();
      setShipments(data);
    } catch (error) {
      console.error("Failed to fetch shipments for review", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingShipments();
  }, []);

  const handleReview = async (asnNumber, newStatus) => {
    let notes = '';
    if (newStatus === 'DISCREPANCY_REPORTED') {
      notes = prompt('Please describe the discrepancy:');
      if (notes === null) return; // User cancelled prompt
    }

    try {
      await reviewShipment(asnNumber, { newStatus, notes });
      toast({
        title: `Shipment ${newStatus.replace('_', ' ')}`,
        status: newStatus === 'APPROVED_FOR_PAYMENT' ? 'success' : 'warning',
        duration: 4000,
        isClosable: true,
      });
      fetchPendingShipments(); // Refresh the list
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || 'Failed to update shipment.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) return <Flex justify="center" align="center" height="200px"><Spinner size="xl" /></Flex>;

  return (
    <Box>
      <Heading size="lg" mb={6}>Shipments Pending Review</Heading>
      <VStack spacing={4} align="stretch">
        {shipments.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            No shipments are currently awaiting review.
          </Alert>
        ) : (
          shipments.map((shipment) => (
            <Box key={shipment.asnNumber} p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm">
              <Flex align="center">
                <Box>
                  <Heading size="md">{shipment.asnNumber}</Heading>
                  <Text fontSize="sm" color="gray.500">Order ID: {shipment.orderId}</Text>
                </Box>
                <Spacer />
                <HStack>
                  <Button colorScheme="green" onClick={() => handleReview(shipment.asnNumber, 'APPROVED_FOR_PAYMENT')}>Approve</Button>
                  <Button colorScheme="red" onClick={() => handleReview(shipment.asnNumber, 'DISCREPANCY_REPORTED')}>Report Discrepancy</Button>
                </HStack>
              </Flex>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default WarehouseReviewPage;