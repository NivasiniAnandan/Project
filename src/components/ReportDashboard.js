import React from 'react';
import { IndianRupee, Package, TrendingUp, Users, CreditCard, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function ReportDashboard({ reportType, reportData }) {
  if (!reportData) return null;

  // Dashboard Summary
  if (reportType === 'dashboard' || reportType === 'summary') {
    return (
      <div>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>
          Dashboard Summary
        </h2>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <SummaryCard
            title="Total Orders"
            value={reportData.totalOrders}
            icon={<Package size={24} />}
            color="#064e3b"
          />
          <SummaryCard
            title="Total Revenue"
            value={formatCurrency(reportData.totalRevenue)}
            icon={<IndianRupee size={24} />}
            color="#d97706"
          />
          <SummaryCard
            title="Products Sold"
            value={reportData.totalProductsSold}
            icon={<TrendingUp size={24} />}
            color="#1e40af"
          />
          <SummaryCard
            title="Avg Order Value"
            value={formatCurrency(reportData.averageOrderValue)}
            icon={<BarChart3 size={24} />}
            color="#0d9488"
          />
          <SummaryCard
            title="Total Customers"
            value={reportData.uniqueCustomers}
            icon={<Users size={24} />}
            color="#7c3aed"
          />
        </div>

        {/* Order Status Breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <StatusBreakdownCard
            title="Order Status Breakdown"
            statuses={reportData.ordersByStatus}
          />
          <StatusBreakdownCard
            title="Payment Status Breakdown"
            statuses={reportData.ordersByPaymentStatus}
          />
        </div>
      </div>
    );
  }

  // Sales Report
  if (reportType === 'sales') {
    return (
      <div>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>
          Sales Report
        </h2>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <SummaryCard
            title="Total Orders"
            value={reportData.metrics.totalOrders}
            color="#064e3b"
          />
          <SummaryCard
            title="Total Revenue"
            value={formatCurrency(reportData.metrics?.totalRevenue)}
            color="#d97706"
          />
          <SummaryCard
            title="Products Sold"
            value={reportData.metrics.totalProductsSold}
            color="#1e40af"
          />
          <SummaryCard
            title="Avg Order Value"
            value={formatCurrency(reportData.metrics?.averageOrderValue)}
            color="#0d9488"
          />
        </div>

        {/* Product Sales Table */}
        {reportData.productSales && reportData.productSales.length > 0 && (
          <div style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>
              Top Selling Products
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Product</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Quantity</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Orders</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.productSales.slice(0, 20).map((product, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>{product.name}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{product.quantity}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{product.orders}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Category Sales Table */}
        {reportData.categorySales && reportData.categorySales.length > 0 && (
          <div style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>
              Sales by Category
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Category</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Quantity</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Orders</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.categorySales.map((category, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 1.5rem', textTransform: 'capitalize' }}>{category.category.replace('-', ' ')}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{category.quantity}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{category.orders}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {formatCurrency(category.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Orders Report
  if (reportType === 'orders') {
    return (
      <div>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>
          Order Report
        </h2>

        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {Object.entries(reportData.statuses || {}).map(([status, count]) => (
              <div key={status} style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{status.replace('_', ' ')}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--primary-color)' }}>{count}</div>
              </div>
            ))}
          </div>
        </div>

        {reportData.orders && reportData.orders.length > 0 ? (
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Order ID</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Customer Email</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Date</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Amount</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)' }}>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.orders.map((order, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--primary-color)' }}>{order.orderId || order.id}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>{order.userEmail || order.customerEmail}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>{format(new Date(order.createdAt), 'dd-MM-yyyy')}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(order.total)}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <StatusBadge status={order.status} />
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <StatusBadge status={order.paymentStatus} type="payment" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No orders found for the selected date range
          </div>
        )}

        {reportData.pagination && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Showing {(reportData.pagination.page - 1) * reportData.pagination.pageSize + 1} to {Math.min(reportData.pagination.page * reportData.pagination.pageSize, reportData.pagination.totalCount)} of {reportData.pagination.totalCount}
          </div>
        )}
      </div>
    );
  }

  // Products Report
  if (reportType === 'products') {
    return (
      <div>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>
          Product Sales Report
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <SummaryCard title="Total Products" value={reportData.totalProductTypes} color="#064e3b" />
          <SummaryCard title="Total Quantity" value={reportData.totalQuantity} color="#d97706" />
          <SummaryCard title="Total Revenue" value={formatCurrency(reportData.totalRevenue)} color="#0d9488" />
        </div>

        {reportData.products && reportData.products.length > 0 && (
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Product Name</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Quantity</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Orders</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.products.map((product, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>{product.name}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{product.quantity}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{product.orders}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Categories Report
  if (reportType === 'categories') {
    return (
      <div>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>
          Category Sales Report
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <SummaryCard title="Total Categories" value={reportData.totalCategories} color="#064e3b" />
          <SummaryCard title="Total Quantity" value={reportData.totalQuantity} color="#d97706" />
          <SummaryCard title="Total Revenue" value={formatCurrency(reportData.totalRevenue)} color="#0d9488" />
        </div>

        {reportData.categories && reportData.categories.length > 0 && (
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Category</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Quantity</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Orders</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.categories.map((category, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 1.5rem', textTransform: 'capitalize' }}>{category.categoryId.replace('-', ' ')}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{category.quantity}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{category.orders}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {formatCurrency(category.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Customers Report
  if (reportType === 'customers') {
    return (
      <div>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>
          Customer/Retailer Report
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <SummaryCard title="Total Customers" value={reportData.totalCustomers} color="#064e3b" />
          <SummaryCard title="Total Orders" value={reportData.totalOrders} color="#d97706" />
          <SummaryCard title="Total Spent" value={formatCurrency(reportData.totalSpent)} color="#0d9488" />
          <SummaryCard title="Avg Order Value" value={formatCurrency(reportData.averageOrderValue)} color="#1e40af" />
        </div>

        {reportData.customers && reportData.customers.length > 0 && (
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Customer Name</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Email</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Orders</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Total Spent</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.customers.map((customer, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>{customer.name}</td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>{customer.customerEmail}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{customer.orderCount}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {customer.lastOrderDate ? format(new Date(customer.lastOrderDate), 'dd-MM-yyyy') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Payments Report
  if (reportType === 'payments') {
    return (
      <div>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>
          Payment Report
        </h2>

        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <SummaryCard title="Total Payments" value={reportData.totalPayments} color="#064e3b" />
            <SummaryCard title="Total Amount" value={formatCurrency(reportData.totalAmount)} color="#d97706" />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {Object.entries(reportData.paymentStatuses || {}).map(([status, count]) => (
              <div key={status} style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{status.replace('_', ' ')}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--primary-color)' }}>{count}</div>
              </div>
            ))}
          </div>
        </div>

        {reportData.payments && reportData.payments.length > 0 && (
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Order ID</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Email</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Payment Date</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Method</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Amount</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.payments.map((payment, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--primary-color)' }}>{payment.orderId}</td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>{payment.customerEmail}</td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>{payment.paymentDate}</td>
                      <td style={{ padding: '1rem 1.5rem', textTransform: 'capitalize' }}>{payment.paymentMethod}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(payment.amount)}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <StatusBadge status={payment.paymentStatus} type="payment" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function SummaryCard({ title, value, icon, color }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: color ? `${color}15` : '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color || 'var(--text-muted)',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: color || 'var(--text-main)' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function StatusBreakdownCard({ title, statuses }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Object.entries(statuses).map(([status, count]) => (
          <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
            <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {status.replace('_', ' ')}
            </span>
            <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status, type = 'order' }) {
  const getStatusColor = () => {
    if (type === 'payment') {
      if (status === 'paid') return { bg: '#d1fae5', text: '#065f46' };
      if (status === 'pending') return { bg: '#fef3c7', text: '#92400e' };
      if (status === 'invoice_sent') return { bg: '#dbeafe', text: '#0c4a6e' };
    } else {
      if (status === 'delivered') return { bg: '#d1fae5', text: '#065f46' };
      if (status === 'pending') return { bg: '#fef3c7', text: '#92400e' };
      if (status === 'processing' || status === 'shipped') return { bg: '#dbeafe', text: '#0c4a6e' };
      if (status === 'cancelled') return { bg: '#fee2e2', text: '#991b1b' };
    }
    return { bg: '#f3f4f6', text: '#6b7280' };
  };

  const colors = getStatusColor();
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      backgroundColor: colors.bg,
      color: colors.text,
      borderRadius: 'var(--radius-md)',
      fontSize: '0.8rem',
      fontWeight: '600',
      textTransform: 'capitalize'
    }}>
      {status.replace('_', ' ')}
    </span>
  );
}
