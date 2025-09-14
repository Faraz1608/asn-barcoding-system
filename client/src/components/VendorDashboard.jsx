// client/src/components/VendorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getAssignedShipments, fulfillShipment, downloadAsnPdf } from '../services/api';
import {
  Box, Heading, Text, VStack, Flex, Tag, Spacer, Button, Spinner,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, useToast, Tabs, TabList, Tab, TabPanels, TabPanel
} from '@chakra-ui/react';

const getStatusColor = (status) => ({
  'ORDERED': 'blue', 'IN_TRANSIT': 'orange', 'APPROVED_FOR_PAYMENT': 'green'
}[status] || 'gray');

const FulfillmentModal = ({ isOpen, onClose, asn, onFulfilled }) => {
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');
  const toast = useToast();

  const handleSubmit = async () => {
    if (!carrier || !tracking) {
      toast({ title: "All fields are required.", status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    try {
      await fulfillShipment(asn.asnNumber, {
        itemsShipped: asn.lineItems || [],
        shippingCarrier: carrier,
        trackingNumber: tracking,
      });
      toast({ title: "Shipment Fulfilled!", status: 'success', duration: 3000, isClosable: true });
      
      // Download the PDF after successful fulfillment
      downloadAsnPdf(asn.asnNumber);

      onFulfilled();
      onClose();
    } catch (error) {
      toast({ title: "Fulfillment Failed", description: error.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Fulfill Shipment: {asn?.asnNumber}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Shipping Carrier</FormLabel>
              <Input placeholder="e.g., FedEx, DHL" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Tracking Number</FormLabel>
              <Input placeholder="e.g., 123456789" value={tracking} onChange={(e) => setTracking(e.target.value)} />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={handleSubmit}>Confirm Fulfillment</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const VendorDashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsn, setSelectedAsn] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await getAssignedShipments(); // Fetches all shipments for this vendor
      setShipments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleFulfillClick = (asn) => {
    setSelectedAsn(asn);
    onOpen();
  };
  
  const handleDownloadPdf = (asnNumber) => {
    downloadAsnPdf(asnNumber);
  };

  const orderedShipments = shipments.filter(s => s.status === 'ORDERED');
  const inTransitShipments = shipments.filter(s => s.status === 'IN_TRANSIT');

  if (loading) return <Flex justify="center" align="center" height="200px"><Spinner size="xl" /></Flex>;

  return (
    <Box>
      <Heading size="lg" mb={6}>Vendor Dashboard</Heading>
      <Tabs variant="enclosed-colored">
        <TabList>
          <Tab>New Orders ({orderedShipments.length})</Tab>
          <Tab>In Transit ({inTransitShipments.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {orderedShipments.map((asn) => (
                <Flex key={asn.asnNumber} p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm" align="center">
                  <Box>
                    <Heading size="md">{asn.asnNumber}</Heading>
                    <Text fontSize="sm" color="gray.500">Order ID: {asn.orderId}</Text>
                  </Box>
                  <Spacer />
                  <Button colorScheme="blue" onClick={() => handleFulfillClick(asn)}>Fulfill Shipment</Button>
                </Flex>
              ))}
            </VStack>
          </TabPanel>
          <TabPanel>
            {inTransitShipments.map((asn) => (
              <Flex key={asn.asnNumber} p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm" align="center">
                <Box>
                  <Heading size="md">{asn.asnNumber}</Heading>
                  <Text fontSize="sm" color="gray.500">Tracking: {asn.trackingNumber}</Text>
                </Box>
                <Spacer />
                <Button colorScheme="green" onClick={() => handleDownloadPdf(asn.asnNumber)}>Download PDF</Button>
                <Tag size="lg" variant="solid" colorScheme={getStatusColor(asn.status)}>{asn.status}</Tag>
              </Flex>
            ))}
          </TabPanel>
        </TabPanels>
      </Tabs>
      {selectedAsn && <FulfillmentModal isOpen={isOpen} onClose={onClose} asn={selectedAsn} onFulfilled={fetchShipments} />}
    </Box>
  );
};

export default VendorDashboard;
