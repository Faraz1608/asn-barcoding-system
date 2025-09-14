// client/src/components/GatekeeperInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { receiveShipment } from '../services/api';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
} from '@chakra-ui/react';
import { BrowserMultiFormatReader } from '@zxing/browser';

// Camera Scanner Component
const CameraScanner = ({ onScanSuccess }) => {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let stopped = false;

    async function startScanner() {
      try {
        controlsRef.current = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (result && !stopped) {
              onScanSuccess(result.getText());
            }
          }
        );
      } catch (err) {
        console.error('Error initializing camera scanner:', err);
      }
    }

    startScanner();

    return () => {
      stopped = true;
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, [onScanSuccess]);

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" my={4}>
      <video ref={videoRef} style={{ width: '100%' }} />
    </Box>
  );
};

// Main Gatekeeper Interface Component
const GatekeeperInterface = () => {
  const [asnNumber, setAsnNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!asnNumber) {
      toast({
        title: 'Input Required',
        description: 'Please enter or scan an ASN Number.',
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
      setAsnNumber('');
      setShowScanner(false);
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description:
          error.response?.data?.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanSuccess = (text) => {
    if (text) {
      setAsnNumber(text);
      setShowScanner(false);
      toast({
        title: 'Barcode Scanned!',
        description: `ASN: ${text}`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      p={8}
      borderWidth={1}
      borderRadius={8}
      boxShadow="lg"
      maxW="lg"
      mx="auto"
    >
      <VStack as="form" onSubmit={handleSubmit} spacing={6}>
        <Heading size="lg">Gatekeeper Verification</Heading>

        {showScanner && <CameraScanner onScanSuccess={handleScanSuccess} />}

        <FormControl isRequired>
          <FormLabel>ASN Number</FormLabel>
          <Input
            type="text"
            value={asnNumber}
            onChange={(e) => setAsnNumber(e.target.value)}
            placeholder="Scan a barcode or enter manually"
          />
        </FormControl>

        <Button
          onClick={() => setShowScanner(!showScanner)}
          colorScheme="teal"
          width="full"
        >
          {showScanner ? 'Close Camera Scanner' : 'Open Camera Scanner'}
        </Button>
        <Button
          type="submit"
          colorScheme="green"
          isLoading={isLoading}
          width="full"
        >
          Verify Receipt
        </Button>
      </VStack>
    </Box>
  );
};

export default GatekeeperInterface;
