import React from 'react';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Flex, Heading, Link, Button, Spacer, Container } from '@chakra-ui/react';
import WarehousePage from './pages/WarehousePage';
import VendorPage from './pages/VendorPage';
import GatekeeperPage from './pages/GatekeeperPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import WarehouseReviewPage from './pages/WarehouseReviewPage';
import { logout } from './services/api';
import { ColorModeSwitcher } from './components/ColorModeSwitcher'; // 1. Import the switcher

function App() {
  const token = localStorage.getItem('userToken');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    window.location.reload();
  };

  return (
    <Box>
      <Flex as="header" bg="blue.500" p={4} color="white" alignItems="center" boxShadow="md">
        <Heading size="md">ASN Barcode System</Heading>
        <Spacer />
        {token && (
          <Box>
            <Link as={RouterLink} to="/warehouse" mr={4}>Dashboard</Link>
            <Link as={RouterLink} to="/warehouse/review" mr={4}>Review</Link>
            <Link as={RouterLink} to="/vendor" mr={4}>Vendor</Link>
            <Link as={RouterLink} to="/gatekeeper" mr={4}>Gatekeeper</Link>
            <Button colorScheme="red" onClick={handleLogout} mr={4}>Logout</Button>
          </Box>
        )}
        <ColorModeSwitcher justifySelf="flex-end" /> {/* 2. Add the switcher to the header */}
      </Flex>
      
      <Container maxW="container.xl" mt={8}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/warehouse" element={<WarehousePage />} />
            <Route path="/warehouse/review" element={<WarehouseReviewPage />} />
            <Route path="/vendor" element={<VendorPage />} />
            <Route path="/gatekeeper" element={<GatekeeperPage />} />
          </Route>
          <Route path="/" element={token ? <WarehousePage /> : <LoginPage />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;