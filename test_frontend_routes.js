// Frontend Route Testing Script
// This script tests if all frontend routes are accessible

const BASE_URL = 'http://localhost:5173';

// List of all routes from App.tsx
const routes = [
  '/login',
  '/dashboard',
  '/parties/customers/statements/you-gave/1',
  '/parties/customers/statements/you-received/1',
  '/parties/supplier/statements/you-gave/1',
  '/parties/supplier/statements/you-received/1',
  '/category/add/test',
  '/bills/income/add',
  '/bills/cashbook/add',
  '/bills/purchase/add',
  '/bills/purchase',
  '/bills/income',
  '/bills/cashbook',
  '/bills/expenses',
  '/bills/expenses/add',
  '/pos',
  '/staff/payment/add',
  '/parties/customers',
  '/parties/customers/profile/1',
  '/parties/supplier/profile/1',
  '/parties/customers/statements/1',
  '/parties/customers/statement/1',
  '/parties/customers/statement/1/edit',
  '/parties/customers/add',
  '/parties/suppliers',
  '/parties/suppliers/add',
  '/parties/cash-bank/cash',
  '/parties/cash-bank/bank',
  '/parties/branch',
  '/inventory/items',
  '/inventory/items/add',
  '/others/bills',
  '/parties/customers/list-report-pdf',
  '/parties/customers/statements/report/1/download',
  '/parties/customers/statements/report/1',
  '/bills/sales',
  '/bills/sales/add',
  '/staff',
  '/staff/add',
  '/staff/payment',
  '/staff/payment/1',
  '/add-khatabook',
  '/service',
  '/add-service',
  '/settings/api',
  '/sms',
  '/add-sms',
  '/payment-gateway',
  '/add-payment-gateway',
  '/role-and-permission',
  '/role',
  '/add-role',
  '/permission',
  '/bills-and-print-selling',
  '/rental-items',
  '/rental/add',
  '/user',
  '/add-user',
  '/app-settings',
  '/',
  '/reports/sales',
  '/reports/purchase',
  '/reports/total-sale',
  '/system/multi-user',
  '/system/reminder',
  '/system/import',
  '/system/notis',
  '/settings/backup',
  '/settings/recycle-bin',
  '/settings/delete-khata',
  '/settings/business',
  '/settings/dashboard',
  '/abouts/app-name',
  '/abouts/backup-info',
  '/abouts/privacy',
  '/abouts/terms',
  '/abouts/version',
  '/others/note',
  '/parties/supplier/statements/1',
  '/parties/suppliers/1'
];

async function testRoute(route) {
  try {
    const response = await fetch(`${BASE_URL}${route}`);
    return {
      route,
      status: response.status,
      ok: response.ok
    };
  } catch (error) {
    return {
      route,
      status: 'ERROR',
      ok: false,
      error: error.message
    };
  }
}

async function testAllRoutes() {
  console.log('Testing Frontend Routes...');
  console.log('==========================');
  
  const results = [];
  
  for (const route of routes) {
    const result = await testRoute(route);
    results.push(result);
    
    const status = result.ok ? '✅' : '❌';
    console.log(`${status} ${route} (${result.status})`);
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n==========================');
  console.log('Route Testing Summary:');
  console.log(`Total routes tested: ${routes.length}`);
  console.log(`Successful routes: ${results.filter(r => r.ok).length}`);
  console.log(`Failed routes: ${results.filter(r => !r.ok).length}`);
  
  const failedRoutes = results.filter(r => !r.ok);
  if (failedRoutes.length > 0) {
    console.log('\nFailed Routes:');
    failedRoutes.forEach(r => {
      console.log(`❌ ${r.route} - ${r.status} ${r.error || ''}`);
    });
  }
}

// Run the test
testAllRoutes().catch(console.error); 