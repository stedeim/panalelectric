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
import LeadGenMachinePage from './pages/LeadGenMachinePage';
import ReputationSystemPage from './pages/ReputationSystemPage';
import SocialMediaKitPage from './pages/SocialMediaKitPage';
import EmailMarketingPage from './pages/EmailMarketingPage';
import ReferralPartnerPage from './pages/ReferralPartnerPage';
import InvoiceGeneratorPage from './pages/InvoiceGeneratorPage';
import ExpenseTrackerPage from './pages/ExpenseTrackerPage';
import MaterialPriceListPage from './pages/MaterialPriceListPage';
import JobSchedulerPage from './pages/JobSchedulerPage';
import ServiceAgreementPage from './pages/ServiceAgreementPage';
import LicenseTrackerPage from './pages/LicenseTrackerPage';
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
          <Route path="/lead-generation" element={
            <ProtectedRoute>
              <LeadGenMachinePage />
            </ProtectedRoute>
          } />
          <Route path="/reputation-system" element={
            <ProtectedRoute>
              <ReputationSystemPage />
            </ProtectedRoute>
          } />
          <Route path="/social-media-kit" element={
            <ProtectedRoute>
              <SocialMediaKitPage />
            </ProtectedRoute>
          } />
          <Route path="/email-marketing" element={
            <ProtectedRoute>
              <EmailMarketingPage />
            </ProtectedRoute>
          } />
          <Route path="/referral-partner" element={
            <ProtectedRoute>
              <ReferralPartnerPage />
            </ProtectedRoute>
          } />
          <Route path="/invoice-generator" element={
            <ProtectedRoute>
              <InvoiceGeneratorPage />
            </ProtectedRoute>
          } />
          <Route path="/expense-tracker" element={
            <ProtectedRoute>
              <ExpenseTrackerPage />
            </ProtectedRoute>
          } />
          <Route path="/material-price-list" element={
            <ProtectedRoute>
              <MaterialPriceListPage />
            </ProtectedRoute>
          } />
          <Route path="/job-scheduler" element={
            <ProtectedRoute>
              <JobSchedulerPage />
            </ProtectedRoute>
          } />
          <Route path="/service-agreements" element={
            <ProtectedRoute>
              <ServiceAgreementPage />
            </ProtectedRoute>
          } />
          <Route path="/license-tracker" element={
            <ProtectedRoute>
              <LicenseTrackerPage />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
