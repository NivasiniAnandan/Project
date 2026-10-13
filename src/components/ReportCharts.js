import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#064e3b', '#d97706', '#1e40af', '#0d9488', '#7c3aed', '#dc2626', '#f59e0b', '#06b6d4'];

export default function ReportCharts({ reportData }) {
  if (!reportData) return null;

  return (
    <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* Daily Sales Trend */}
      {reportData.dailySales && reportData.dailySales.length > 0 && (
        <ChartContainer title="Daily Sales Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="displayDate" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#064e3b"
                strokeWidth={2}
                dot={{ fill: '#064e3b' }}
                name="Sales (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Top Products Bar Chart */}
      {reportData.productSales && reportData.productSales.length > 0 && (
        <ChartContainer title="Top 10 Products by Revenue">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.productSales.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Bar dataKey="revenue" fill="#d97706" name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Orders vs Revenue Chart */}
      {reportData.dailySales && reportData.dailySales.length > 0 && (
        <ChartContainer title="Orders vs Revenue">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="displayDate" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#1e40af" name="Orders" />
              <Bar dataKey="sales" fill="#0d9488" name="Sales (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Category Sales Pie Chart */}
      {reportData.categorySales && reportData.categorySales.length > 0 && (
        <ChartContainer title="Sales by Category">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.categorySales}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.category.replace('-', ' ')}: ₹${entry.revenue.toLocaleString('en-IN')}`}
              >
                {reportData.categorySales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Product Quantity Chart */}
      {reportData.productSales && reportData.productSales.length > 0 && (
        <ChartContainer title="Top 10 Products by Quantity">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.productSales.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis type="category" dataKey="name" stroke="#9ca3af" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              />
              <Bar dataKey="quantity" fill="#7c3aed" name="Quantity" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Sales Distribution */}
      {reportData.productSales && reportData.productSales.length > 0 && (
        <ChartContainer title="Sales Distribution (Top 8 Products)">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.productSales.slice(0, 8)}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name.substring(0, 10)}...`}
              >
                {reportData.productSales.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  );
}

function ChartContainer({ title, children }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <h3 style={{
        marginBottom: '1rem',
        fontSize: '1rem',
        fontWeight: '600',
        color: 'var(--text-main)'
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
