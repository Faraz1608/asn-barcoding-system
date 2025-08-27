import {React, useState } from 'react';
import { createOrder, createAsn } from '../services/api';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Heading,
  useToast,
  IconButton
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

const OrderCreationForm = () => {
  const [lineItems, setLineItems] = useState([{ productId: '', quantityRequested: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleInputChange = (index, event) => {
    const values = [...lineItems];
    values[index][event.target.name] = event.target.value;
    setLineItems(values);
  };

  const handleAddFields = () => {
    setLineItems([...lineItems, { productId: '', quantityRequested: '' }]);
  };

  const handleRemoveFields = (index) => {
    const values = [...lineItems];
    values.splice(index, 1);
    setLineItems(values);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const orderResponse = await createOrder({ lineItems });
      toast({
        title: 'Order Created',
        description: `Order ${orderResponse.orderId} created! Generating ASN...`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      const asnData = { orderId: orderResponse.orderId, vendorId: 'VENDOR-A' }; // Placeholder
      const asnResponse = await createAsn(asnData);
      
      toast({
        title: 'ASN Generated Successfully.',
        description: `ASN ${asnResponse.asnNumber} for Order ${orderResponse.orderId}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setLineItems([{ productId: '', quantityRequested: '' }]); // Reset form

    } catch (error) {
      toast({
        title: 'An Error Occurred.',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
      <VStack as="form" onSubmit={handleSubmit} spacing={6}>
        <Heading size="lg">Create New Shipment Order</Heading>
        {lineItems.map((item, index) => (
          <HStack key={index} width="100%">
            <FormControl isRequired>
              <FormLabel>Product ID / SKU</FormLabel>
              <Input
                name="productId"
                placeholder="SKU-12345"
                value={item.productId}
                onChange={event => handleInputChange(index, event)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Quantity</FormLabel>
              <Input
                type="number"
                name="quantityRequested"
                placeholder="150"
                value={item.quantityRequested}
                onChange={event => handleInputChange(index, event)}
              />
            </FormControl>
            {lineItems.length > 1 && (
              <IconButton
                aria-label="Remove product"
                icon={<DeleteIcon />}
                colorScheme="red"
                onClick={() => handleRemoveFields(index)}
                alignSelf="flex-end"
              />
            )}
          </HStack>
        ))}
        <HStack width="100%">
          <Button onClick={handleAddFields} leftIcon={<AddIcon />}>
            Add Product
          </Button>
          <Button type="submit" colorScheme="blue" isLoading={isLoading}>
            Create Order
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default OrderCreationForm;