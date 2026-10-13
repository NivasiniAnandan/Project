# File Structure - Reports Module

## Complete File Listing

### API Routes (Backend)
```
src/app/api/admin/reports/
├── route.js                    [NEW] Dashboard summary metrics
├── sales/
│   └── route.js               [NEW] Sales analytics
├── orders/
│   └── route.js               [NEW] Order details
├── products/
│   └── route.js               [NEW] Product & category sales
└── customers/
    └── route.js               [NEW] Customers & payments
```

### Frontend Pages & Components
```
src/app/admin/
├── layout.js                  [MODIFIED] Added Reports menu
└── reports/
    └── page.js                [NEW] Reports dashboard page

src/components/
├── ReportDashboard.js         [NEW] Report display component
├── ReportCharts.js            [NEW] Chart visualizations
└── (existing components unchanged)

src/lib/
├── exportHelpers.js           [NEW] PDF & Excel export functions
└── (existing libs unchanged)
```

### Documentation
```
IMPLEMENTATION_GUIDE.md         [NEW] Complete implementation guide
FILES_STRUCTURE.md             [NEW] This file
```

---

## API Routes Details

### 1. `/api/admin/reports` (Main Dashboard)
**Method**: GET
**Auth**: Required (admin role)
**Parameters**:
- type: 'dashboard' or 'summary'
- fromDate: YYYY-MM-DD (optional)
- toDate: YYYY-MM-DD (optional)

**Returns**:
```json
{
  "totalOrders": 125,
  "totalRevenue": 245600,
  "totalProductsSold": 314,
  "averageOrderValue": 1964,
  "ordersByStatus": { "pending": 10, "processing": 5, ... },
  "ordersByPaymentStatus": { "pending": 8, "invoice_sent": 12, "paid": 105 },
  "uniqueCustomers": 45,
  "dateRange": { "from": "2026-08-01T00:00:00Z", "to": "2026-08-31T23:59:59Z" }
}
```

---

### 2. `/api/admin/reports/sales` (Sales Analytics)
**Method**: GET
**Auth**: Required (admin role)
**Parameters**:
- fromDate: YYYY-MM-DD (optional)
- toDate: YYYY-MM-DD (optional)

**Returns**:
```json
{
  "metrics": {
    "totalOrders": 125,
    "totalRevenue": 245600,
    "totalProductsSold": 314,
    "averageOrderValue": 1964
  },
  "dailySales": [
    {
      "date": "2026-08-01",
      "displayDate": "01 Aug",
      "sales": 15000,
      "orders": 8,
      "products": 24
    }
  ],
  "productSales": [
    {
      "id": "prod_1",
      "name": "Groundnut Oil",
      "category": "edible-oils",
      "quantity": 120,
      "orders": 40,
      "revenue": 33600
    }
  ],
  "categorySales": [
    {
      "category": "edible-oils",
      "quantity": 220,
      "orders": 80,
      "revenue": 65000
    }
  ]
}
```

---

### 3. `/api/admin/reports/orders` (Order Details)
**Method**: GET
**Auth**: Required (admin role)
**Parameters**:
- fromDate: YYYY-MM-DD (optional)
- toDate: YYYY-MM-DD (optional)
- status: 'all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
- page: 1, 2, 3... (default: 1)

**Returns**:
```json
{
  "orders": [
    {
      "orderId": "ord_747626",
      "userId": "usr_1784270269933",
      "userEmail": "customer@example.com",
      "customerName": "Customer Name",
      "items": [...],
      "total": 840,
      "createdAt": "2026-08-31T16:23:29.986Z",
      "status": "pending",
      "paymentStatus": "invoice_sent"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 125,
    "totalPages": 7
  },
  "statuses": {
    "pending": 10,
    "processing": 5,
    "shipped": 20,
    "delivered": 85,
    "cancelled": 5
  }
}
```

---

### 4. `/api/admin/reports/products` (Product & Category Sales)
**Method**: GET
**Auth**: Required (admin role)
**Parameters**:
- type: 'products' or 'categories'
- fromDate: YYYY-MM-DD (optional)
- toDate: YYYY-MM-DD (optional)

**Returns** (for type='products'):
```json
{
  "products": [
    {
      "id": "prod_1",
      "name": "Groundnut Oil",
      "categoryId": "edible-oils",
      "quantity": 120,
      "orders": 40,
      "revenue": 33600
    }
  ],
  "totalProductTypes": 24,
  "totalQuantity": 314,
  "totalRevenue": 245600
}
```

**Returns** (for type='categories'):
```json
{
  "categories": [
    {
      "categoryId": "edible-oils",
      "quantity": 220,
      "orders": 80,
      "revenue": 65000
    }
  ],
  "totalCategories": 8,
  "totalQuantity": 314,
  "totalRevenue": 245600
}
```

---

### 5. `/api/admin/reports/customers` (Customers & Payments)
**Method**: GET
**Auth**: Required (admin role)
**Parameters**:
- type: 'customers' or 'payments'
- fromDate: YYYY-MM-DD (optional)
- toDate: YYYY-MM-DD (optional)

**Returns** (for type='customers'):
```json
{
  "customers": [
    {
      "userId": "usr_retailer",
      "name": "Retailer Name",
      "email": "retailer@example.com",
      "orderCount": 5,
      "totalSpent": 12500,
      "lastOrderDate": "2026-08-31T16:23:29.986Z",
      "statuses": { "pending": 1, "delivered": 4 }
    }
  ],
  "totalCustomers": 45,
  "totalSpent": 245600,
  "totalOrders": 125,
  "averageOrderValue": 1964
}
```

**Returns** (for type='payments'):
```json
{
  "payments": [
    {
      "orderId": "ord_747626",
      "customerEmail": "customer@example.com",
      "paymentDate": "2026-08-31 16:23:29",
      "paymentMethod": "invoice",
      "amount": 840,
      "paymentStatus": "invoice_sent",
      "orderStatus": "pending",
      "transactionId": "N/A"
    }
  ],
  "totalPayments": 125,
  "totalAmount": 245600,
  "paymentStatuses": {
    "pending": 8,
    "invoice_sent": 12,
    "paid": 105
  }
}
```

---

## Component Documentation

### ReportDashboard.js
**Props**:
- `reportType`: string - Type of report ('dashboard', 'sales', 'orders', etc.)
- `reportData`: object - Data returned from API

**Renders**: Based on reportType:
1. Dashboard - Summary cards + status breakdown
2. Sales - Metrics + product/category tables
3. Orders - Order list with status
4. Products - Product table with revenue
5. Categories - Category table with revenue
6. Customers - Customer table with spending
7. Payments - Payment table with status

### ReportCharts.js
**Props**:
- `reportData`: object - Sales report data

**Charts Rendered**:
1. Daily Sales Trend (Line chart)
2. Top 10 Products by Revenue (Bar chart)
3. Orders vs Revenue (Dual bar chart)
4. Sales by Category (Pie chart)
5. Top 10 Products by Quantity (Horizontal bar)
6. Top 8 Products Distribution (Pie chart)

### exportHelpers.js
**Functions**:
- `exportToPDF(reportType, reportData, fromDate, toDate)` - Generates PDF
- `exportToExcel(reportType, reportData, fromDate, toDate)` - Generates Excel

**Features**:
- Professional PDF formatting with tables
- Multi-sheet Excel workbooks
- Date range in filename
- Timestamp in document

---

## Dependencies

```json
{
  "recharts": "^2.x",              // Charts
  "xlsx": "^0.18.x",               // Excel
  "jspdf": "^2.x",                 // PDF
  "jspdf-autotable": "^3.x",       // PDF tables
  "date-fns": "^3.x",              // Date handling
  "mongoose": "^9.9.3",            // MongoDB (existing)
  "next": "15.5.4",                // Next.js (existing)
  "react": "18.3.1"                // React (existing)
}
```

---

## File Sizes

```
src/app/api/admin/reports/
├── route.js                    ~5 KB
├── sales/route.js              ~8 KB
├── orders/route.js             ~7 KB
├── products/route.js           ~8 KB
└── customers/route.js          ~9 KB

src/components/
├── ReportDashboard.js          ~18 KB
└── ReportCharts.js             ~8 KB

src/lib/
└── exportHelpers.js            ~12 KB

Total: ~75 KB of new code
```

---

## Caching & Performance Notes

**No Caching**:
- Reports are generated fresh each time
- Real-time data always displayed
- No stale data issues

**Optimizations**:
- MongoDB aggregation pipelines reduce data transfer
- Lean queries minimize memory
- Pagination prevents large dataset loads
- Charts pre-calculated before rendering

---

## Error Handling

All APIs handle:
- ✓ Missing authentication
- ✓ Invalid dates
- ✓ Invalid report types
- ✓ MongoDB connection failures
- ✓ JSON file read errors
- ✓ Zero results gracefully

All components display:
- ✓ Loading states
- ✓ Error messages
- ✓ Empty state messages
- ✓ Disabled controls when appropriate

---

## Browser Compatibility

Tested and working on:
- ✓ Chrome/Chromium
- ✓ Firefox
- ✓ Safari
- ✓ Edge
- ✓ Mobile browsers

Chart rendering requires:
- ✓ ES6+ JavaScript support
- ✓ Modern browser APIs

---

## Rate Limiting

Currently no rate limiting implemented. For production, consider:
1. Add rate limiting middleware
2. Limit large date range queries
3. Cache summary reports
4. Add request validation

---

## Future Enhancements

Possible additions:
- [ ] Email reports to inbox
- [ ] Scheduled report generation
- [ ] Custom report builder
- [ ] Historical data comparison
- [ ] Forecast/trend analysis
- [ ] More chart types
- [ ] Real-time dashboard
- [ ] Data export to CSV
- [ ] Report sharing between admins
- [ ] Custom metrics

---

**Last Updated**: 2026-09-01
**Version**: 1.0
**Status**: Production Ready
