import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CalculatorPage from './pages/CalculatorPage';
import DocumentsPage from './pages/DocumentsPage';
import GeoAuditPage from './pages/GeoAuditPage';
import WattChatPage from './pages/WattChatPage';
import UpgradePage from './pages/UpgradePage';
import JobTrackerPage from './pages/JobTrackerPage';
import ProposalBuilderPage from './pages/ProposalBuilderPage';
import ContractBuilderPage from './pages/ContractBuilderPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/calculator/:calcId" element={
            <ProtectedRoute>
              <CalculatorPage />
            </ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
          } />
          <Route path="/geo-audit" element={
            <ProtectedRoute>
              <GeoAuditPage />
            </ProtectedRoute>
          } />
          <Route path="/watt" element={
            <ProtectedRoute>
              <WattChatPage />
            </ProtectedRoute>
          } />
          <Route path="/upgrade" element={
            <ProtectedRoute>
              <UpgradePage />
            </ProtectedRoute>
          } />
          <Route path="/job-tracker" element={
            <ProtectedRoute>
              <JobTrackerPage />
            </ProtectedRoute>
          } />
          <Route path="/proposal-builder" element={
            <ProtectedRoute>
              <ProposalBuilderPage />
            </ProtectedRoute>
          } />
          <Route path="/contract-builder" element={
            <ProtectedRoute>
              <ContractBuilderPage />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
