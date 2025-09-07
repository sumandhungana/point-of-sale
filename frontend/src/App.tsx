import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Login } from './pages/Login';
import Dashboard from './pages/Dashboard';
import { POS } from './pages/POS';
import { Customers } from './pages/Customers';
import { AddCustomer } from './pages/AddCustomer';
import { AddSupplier } from './pages/AddSupplier';
import { CustomerStatement } from './pages/CustomerStatement';
import { SupplierStatement } from './pages/SupplierStatement';
import { EditCustomerStatement } from './pages/EditCustomerStatement';
import { CustomerProfile } from './pages/CustomerProfile';
import { CustomerStatements } from './pages/CustomerStatements';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppSettingsProvider } from './context/AppSettingsContext';
import { Suppliers } from './pages/Suppliers';
import { CustomerListReportPdf } from './pages/CustomerListReportPdf';
import { SupplierListReportPdf } from './pages/SupplierListReportPdf';
import { CustomerStatementsReport } from './pages/CustomerStatementsReport';
import { SupplierStatementsReport } from './pages/SupplierStatementsReport';
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
import { Branch } from './pages/Branch';
import './styles/Common.css';
import './styles/Buttons.css';
import './styles/ConfirmationModal.css';
import './styles/BackButton.css';
import './styles/FormLayout.css';
import './styles/Button.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Bills } from './pages/Bills';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    // return true ? (
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
    <Navigate to="/login" />
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppSettingsProvider>
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
            path="/parties/supplier/statements/you-gave/:id"
            element={
              <PrivateRoute>
                <YouGave />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/supplier/statements/you-received/:id"
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
          {/* Supplier profile alias (uses same component) */}
          <Route
            path="/parties/supplier/profile/:id"
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
            path="/parties/supplier/statement/:id"
            element={
              <PrivateRoute>
                <SupplierStatement />
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
            path="/parties/cash-bank/cash"
            element={
              <PrivateRoute>
                <YouGave />
              </PrivateRoute>
            }
          />
          <Route
            path="/parties/cash-bank/bank"
            element={
              <PrivateRoute>
                <YouReceived />
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
            path="/parties/suppliers/list-report-pdf"
            element={
              <PrivateRoute>
                <SupplierListReportPdf />
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
            path="/parties/suppliers/statements/report/:id"
            element={
              <PrivateRoute>
                <SupplierStatementsReport />
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
            path="/bills/purchase"
            element={
              <PrivateRoute>
                <Purchase />
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
            path="/bills/expenses"
            element={
              <PrivateRoute>
                <Expenses />
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
            path="/bills/income"
            element={
              <PrivateRoute>
                <Income />
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
            path="/bills/cashbook"
            element={
              <PrivateRoute>
                <Cashbook />
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
            path="/staff/payment/:id"
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
          <Route 
            path="/rental-items" 
            element={
              <PrivateRoute>
                <RentalItem />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/rental/add" 
            element={
              <PrivateRoute>
                <AddRentalItem />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/user" 
            element={
              <PrivateRoute>
                <User />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/add-user" 
            element={
              <PrivateRoute>
                <AddUser />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/app-settings" 
            element={
              <PrivateRoute>
                <AppSetting />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          
          {/* Reports Routes */}
          <Route
            path="/reports/sales"
            element={
              <PrivateRoute>
                <div>Sales Report Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports/purchase"
            element={
              <PrivateRoute>
                <div>Purchase Report Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports/total-sale"
            element={
              <PrivateRoute>
                <div>Total Sale Report Page</div>
              </PrivateRoute>
            }
          />
          
          {/* System Routes */}
          <Route
            path="/system/multi-user"
            element={
              <PrivateRoute>
                <div>Multi User Login Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/system/reminder"
            element={
              <PrivateRoute>
                <div>Reminder Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/system/import"
            element={
              <PrivateRoute>
                <div>Import Data Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/system/notis"
            element={
              <PrivateRoute>
                <div>Notifications Page</div>
              </PrivateRoute>
            }
          />
          
          {/* Settings Routes */}
          <Route
            path="/settings/backup"
            element={
              <PrivateRoute>
                <div>Backup Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/recycle-bin"
            element={
              <PrivateRoute>
                <div>Recycle Bin Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/delete-khata"
            element={
              <PrivateRoute>
                <div>Delete Khata Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/business"
            element={
              <PrivateRoute>
                <div>Business Setting Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/dashboard"
            element={
              <PrivateRoute>
                <div>Dashboard Setting Page</div>
              </PrivateRoute>
            }
          />
          
          {/* Abouts Routes */}
          <Route
            path="/abouts/app-name"
            element={
              <PrivateRoute>
                <div>App Name Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/abouts/backup-info"
            element={
              <PrivateRoute>
                <div>Backup Info Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/abouts/privacy"
            element={
              <PrivateRoute>
                <div>Privacy Policy Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/abouts/terms"
            element={
              <PrivateRoute>
                <div>Terms & Conditions Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/abouts/version"
            element={
              <PrivateRoute>
                <div>Version Page</div>
              </PrivateRoute>
            }
          />
          
          {/* Others Routes */}
          <Route
            path="/others/note"
            element={
              <PrivateRoute>
                <div>Note Page</div>
              </PrivateRoute>
            }
          />
          {/* Supplier statements routes */}
          <Route
            path="/parties/supplier/statements/:id"
            element={
              <PrivateRoute>
                <SupplierStatements />
              </PrivateRoute>
            }
          />
          {/* Plural suppliers statements path for compatibility */}
          <Route
            path="/parties/suppliers/statements/:id"
            element={
              <PrivateRoute>
                <SupplierStatements />
              </PrivateRoute>
            }
          />
          {/* Backward-compatible route */}
          <Route path="/parties/suppliers/:id" element={<PrivateRoute><SupplierStatements /></PrivateRoute>} />
        </Routes>
      </Router>
      </AppSettingsProvider>
    </AuthProvider>
  );
};

export default App; 