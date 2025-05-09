import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Customers } from './pages/Customers';
import { AddCustomer } from './pages/AddCustomer';
import { AddSupplier } from './pages/AddSupplier';
import { CustomerStatement } from './pages/CustomerStatement';
import { EditCustomerStatement } from './pages/EditCustomerStatement';
import { CustomerProfile } from './pages/CustomerProfile';
import { CustomerStatements } from './pages/CustomerStatements';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Suppliers } from './pages/Suppliers';
import { CustomerListReportPdf } from './pages/CustomerListReportPdf';
import { CustomerStatementsReport } from './pages/CustomerStatementsReport';
import { DownloadCustomerStatementReport } from './pages/DownloadCustomerStatementReport';
import { Items } from './pages/Items';
import { AddItem } from './pages/AddItem';
import { Sales } from './pages/Sales';
import { AddSalesBill } from './pages/AddSalesBill';
import { StaffManagement } from './pages/StaffManagement';
import { AddStaff } from './pages/AddStaff';
import { StaffPayment } from './pages/StaffPayment';
import { AddPayments } from './pages/AddPayments';
import { AddKhataBook } from './pages/AddKhataBook';
import { Service } from './pages/Service';
import { AddService } from './pages/AddService';
import { API } from './pages/API';
import Navbar from './components/Navbar';
import { SMS } from './pages/SMS';
import { AddSMS } from './pages/AddSMS';
import { PaymentGateway } from './pages/PaymentGateway';
import { AddPaymentGateway } from './pages/AddPaymentGateway';
import { RoleAndPermission } from './pages/RoleAndPermission';
import { Role } from './pages/Role';
import { AddRole } from './pages/AddRole';
import { Permission } from './pages/Permission';
import { BillsAndPrintSelling } from './pages/BillsAndPrintSelling';
import { User } from './pages/User';
import { AddUser } from './pages/AddUser';
import { RentalItem } from './pages/RentalItem';
import { AddRentalItem } from './pages/AddRentalItem';
import { AppSetting } from './pages/AppSetting';
import { Purchase } from './pages/Purchase';
import { Expenses } from './pages/Expenses';
import { AddExpenses } from './pages/AddExpenses';
import { Income } from './pages/Income';
import { Cashbook } from './pages/Cashbook';
import { AddPurchase } from './pages/AddPurchase';
import { AddIncome } from './pages/AddIncome';
import { AddCashbook } from './pages/AddCashbook';
import { AddCategory } from './pages/AddCategory';
import { YouGave } from './pages/YouGave';
import { YouReceived } from './pages/YouReceived';
import { SupplierStatements } from './pages/SupplierStatements';

// Placeholder components for routes
const Branch = () => <div>Branch Page</div>;
const Bills = () => <div>Bills Page</div>;

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
  // return isAuthenticated ? (
    return true ? (
    <div style={{ 
        // Space for fixed navbar
      paddingLeft: '280px', // Space for sidebar
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      <Navbar />
      {children}
    </div>
  ) : (
    <>{children}</>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/customers/statements/you-gave/:id"
            element={
              <PrivateRoute>
                <YouGave />
              </PrivateRoute> 
            }
          />
          <Route
            path="/parties/customers/statements/you-received/:id"
            element={
              <PrivateRoute>
                <YouReceived />
              </PrivateRoute>
            }
          />
          <Route
            path="/category/add/:pageName"
            element={
              <PrivateRoute>
                <AddCategory />
              </PrivateRoute>
            }
          />
          <Route
            path="/bills/income/add"
            element={
              <PrivateRoute>
                <AddIncome />
              </PrivateRoute>
            }
          />
          <Route
            path="/bills/cashbook/add"
            element={
              <PrivateRoute>
                <AddCashbook />
              </PrivateRoute>
            }
          />
          <Route
            path="/bills/purchase/add"
            element={
              <PrivateRoute>
                <AddPurchase />
              </PrivateRoute>
            }
          />
          <Route
            path="/bills/expenses/add"
            element={
              <PrivateRoute>
                <AddExpenses />
              </PrivateRoute>
            }
          />
          <Route
            path="/bills/purchase"
            element={
              <PrivateRoute>
                <Purchase />
              </PrivateRoute>
            }
          />
          <Route
            path="/bills/income"
            element={
              <PrivateRoute>
                <Income />
              </PrivateRoute>
            }
          />
          <Route
            path="/bills/cashbook"
            element={
              <PrivateRoute>
                <Cashbook />
              </PrivateRoute>
            }
          />
          <Route
            path="/bills/expenses"
            element={
              <PrivateRoute>
                <Expenses />
              </PrivateRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <PrivateRoute>
                <POS />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff/payment/add"
            element={
              <PrivateRoute>
                <AddPayments />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/customers"
            element={
              <PrivateRoute>
                <Customers />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/customers/profile/:id"
            element={
              <PrivateRoute>
                <CustomerProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/customers/statements/:id"
            element={
              <PrivateRoute>
                <CustomerStatements />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/customers/statement/:id"
            element={
              <PrivateRoute>
                <CustomerStatement />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/customers/statement/:id/edit"
            element={
              <PrivateRoute>
                <EditCustomerStatement />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/customers/add"
            element={
              <PrivateRoute>
                <AddCustomer />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/suppliers"
            element={
              <PrivateRoute>
                <Suppliers />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/suppliers/add"
            element={
              <PrivateRoute>
                <AddSupplier />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/branch"
            element={
              <PrivateRoute>
                <Branch />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory/items"
            element={
              <PrivateRoute>
                <Items />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory/items/add"
            element={
              <PrivateRoute>
                <AddItem />
              </PrivateRoute>
            }
          />
          <Route
            path="/others/bills"
            element={
              <PrivateRoute>
                <Bills />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/customers/list-report-pdf"
            element={
              <PrivateRoute>
                <CustomerListReportPdf />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/customers/statements/report/:id/download"
            element={
              <PrivateRoute>
                <DownloadCustomerStatementReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/customers/statements/report/:id"
            element={
              <PrivateRoute>
                <CustomerStatementsReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/bills/sales"
            element={
              <PrivateRoute>
                <Sales />
              </PrivateRoute>
            }
          />
         
          <Route
            path="/bills/sales/add"
            element={
              <PrivateRoute>
                <AddSalesBill />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <PrivateRoute>
                <StaffManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff/add"
            element={
              <PrivateRoute>
                <AddStaff />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff/payment"
            element={
              <PrivateRoute>
                <StaffPayment />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-khatabook"
            element={
              <PrivateRoute>
                <AddKhataBook />
              </PrivateRoute>
            }
          />
          <Route
            path="/service"
            element={
              <PrivateRoute>
                <Service />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-service"
            element={
              <PrivateRoute>
                <AddService />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/api"
            element={
              <PrivateRoute>
                <API />
              </PrivateRoute>
            }
          />
          <Route
            path="/sms"
            element={
              <PrivateRoute>
                <SMS />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-sms"
            element={
              <PrivateRoute>
                <AddSMS />
              </PrivateRoute>
            }
          />
          <Route
            path="/payment-gateway"
            element={
              <PrivateRoute>
                <PaymentGateway />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-payment-gateway"
            element={
              <PrivateRoute>
                <AddPaymentGateway />
              </PrivateRoute>
            }
          />
          <Route
            path="/role-and-permission"
            element={
              <PrivateRoute>
                <RoleAndPermission />
              </PrivateRoute>
            }
          />
          <Route
            path="/role"
            element={
              <PrivateRoute>
                <Role />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-role"
            element={
              <PrivateRoute>
                <AddRole />
              </PrivateRoute>
            }
          />
          <Route
            path="/permission"
            element={
              <PrivateRoute>
                <Permission />
              </PrivateRoute>
            }
          />
          <Route
            path="/bills-and-print-selling"
            element={
              <PrivateRoute>
                <BillsAndPrintSelling />
              </PrivateRoute>
            }
          />
          <Route path="/rental-items" element={<RentalItem />} />
          <Route path="/rental/add" element={<AddRentalItem />} />
          <Route path="/user" element={<User />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/app-settings" element={<AppSetting />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/parties/suppliers/:id" element={<SupplierStatements />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 