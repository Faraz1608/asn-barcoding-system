import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { ColorModeSwitcher } from '../components/ColorModeSwitcher';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ username, password });
      toast({
        title: 'Login Successful.',
        description: "Redirecting you to the dashboard.",
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/warehouse');
      window.location.reload();
    } catch (err) {
      toast({
        title: 'Login Failed.',
        description: 'Invalid credentials. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minHeight="100vh" align="center" justify="center">
      <Box p={8} width="full" maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg">
        <Flex mb={6} align="center">
          <Heading>Login</Heading>
          <Spacer />
          <ColorModeSwitcher />
        </Flex>
        <VStack spacing={4} as="form" onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />
          </FormControl>
          <Button type="submit" colorScheme="blue" width="full" mt={4}>Login</Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default LoginPage;