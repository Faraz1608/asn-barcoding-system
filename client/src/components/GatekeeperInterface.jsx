import React, { useState } from 'react';
import { receiveShipment } from '../services/api';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast
} from '@chakra-ui/react';

const GatekeeperInterface = () => {
  const [asnNumber, setAsnNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!asnNumber) {
      toast({
        title: 'Input Required',
        description: 'Please enter an ASN Number.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await receiveShipment(asnNumber);
      toast({
        title: 'Success!',
        description: response.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setAsnNumber(''); // Clear input after success
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: error.response?.data?.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" maxW="lg" mx="auto">
      <VStack as="form" onSubmit={handleSubmit} spacing={6}>
        <Heading size="lg">Gatekeeper Verification</Heading>
        <FormControl isRequired>
          <FormLabel>Scan or Enter ASN Number</FormLabel>
          <Input
            type="text"
            value={asnNumber}
            onChange={(e) => setAsnNumber(e.target.value)}
            placeholder="ASN-17248..."
          />
        </FormControl>
        <Button type="submit" colorScheme="green" isLoading={isLoading} width="full">
          Verify Receipt
        </Button>
      </VStack>
    </Box>
  );
};

export default GatekeeperInterface;