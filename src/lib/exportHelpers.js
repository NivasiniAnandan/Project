'use client';

import { format } from 'date-fns';
import * as XLSX from 'xlsx';

// =====================================================
// FORMAT NUMBER
// =====================================================

function formatNumber(value) {
  const number = Number(value) || 0;
  return number.toLocaleString('en-IN');
}

// =====================================================
// EXPORT TO PDF
// =====================================================

export async function exportToPDF(
  reportType,
  reportData,
  fromDate,
  toDate
) {
  try {
    // Dynamically import jsPDF to avoid SSR issues
    const { jsPDF } = await import('jspdf');
    const { autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let yPosition = 15;

    // =====================================================
    // HEADER
    // =====================================================

    doc.setFontSize(20);
    doc.setTextColor(6, 78, 59);

    doc.text(
      'BOMMAL FOODS',
      pageWidth / 2,
      yPosition,
      {
        align: 'center'
      }
    );

    yPosition += 8;

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);

    doc.text(
      'ADMIN REPORT',
      pageWidth / 2,
      yPosition,
      {
        align: 'center'
      }
    );

    yPosition += 12;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // =====================================================
    // REPORT DETAILS
    // =====================================================

    try {
      doc.text(
        `Report Type: ${formatReportType(reportType)}`,
        15,
        yPosition
      );

      yPosition += 6;

      doc.text(
        `Date Range: ${format(
          new Date(fromDate),
          'dd-MM-yyyy'
        )} to ${format(
          new Date(toDate),
          'dd-MM-yyyy'
        )}`,
        15,
        yPosition
      );

      yPosition += 6;

      doc.text(
        `Generated Date: ${format(
          new Date(),
          'dd-MM-yyyy HH:mm:ss'
        )}`,
        15,
        yPosition
      );

    } catch (e) {
      console.log(
        'Date formatting error:',
        e
      );
    }

    // =====================================================
    // REPORT DATA
    // =====================================================

    yPosition += 15;

    doc.setFontSize(12);
    doc.setTextColor(6, 78, 59);

    doc.text(
      'REPORT DATA',
      15,
      yPosition
    );

    yPosition += 8;

    // =====================================================
    // SALES REPORT
    // =====================================================

    if (
      reportType === 'sales' &&
      reportData.productSales &&
      reportData.productSales.length > 0
    ) {

      const tableData =
        reportData.productSales
          .slice(0, 15)
          .map((p) => [
            p.name || 'N/A',
            p.quantity || 0,
            p.orders || 0,

            // ONLY NUMBER - NO ₹ SYMBOL
            formatNumber(p.revenue)
          ]);

      autoTable(doc, {
        startY: yPosition,

        head: [
          [
            'Product',
            'Quantity',
            'Orders',
            'Revenue'
          ]
        ],

        body: tableData,

        theme: 'grid',

        headStyles: {
          fillColor: [6, 78, 59],
          textColor: 255,
          fontSize: 10
        },

        bodyStyles: {
          fontSize: 9
        },

        margin: {
          left: 15,
          right: 15
        },

        columnStyles: {
          1: {
            halign: 'right'
          },
          2: {
            halign: 'right'
          },
          3: {
            halign: 'right'
          }
        }
      });

    // =====================================================
    // ORDERS REPORT
    // =====================================================

    } else if (
      reportType === 'orders' &&
      reportData.orders &&
      reportData.orders.length > 0
    ) {

      const tableData =
        reportData.orders
          .slice(0, 15)
          .map((o) => {

            try {

              return [
                o.orderId ||
                  o.id ||
                  'N/A',

                o.userEmail ||
                  'N/A',

                o.createdAt
                  ? format(
                      new Date(o.createdAt),
                      'dd-MM-yyyy'
                    )
                  : 'N/A',

                // ONLY NUMBER
                formatNumber(o.total),

                o.status ||
                  'N/A'
              ];

            } catch (e) {

              return [
                o.orderId ||
                  'N/A',

                o.userEmail ||
                  'N/A',

                'N/A',

                '0',

                o.status ||
                  'N/A'
              ];
            }
          });

      autoTable(doc, {
        startY: yPosition,

        head: [
          [
            'Order ID',
            'Email',
            'Date',
            'Amount',
            'Status'
          ]
        ],

        body: tableData,

        theme: 'grid',

        headStyles: {
          fillColor: [6, 78, 59],
          textColor: 255,
          fontSize: 10
        },

        bodyStyles: {
          fontSize: 9
        },

        margin: {
          left: 15,
          right: 15
        },

        columnStyles: {
          3: {
            halign: 'right'
          }
        }
      });

    // =====================================================
    // PRODUCTS REPORT
    // =====================================================

    } else if (
      reportType === 'products' &&
      reportData.products &&
      reportData.products.length > 0
    ) {

      const tableData =
        reportData.products
          .slice(0, 30)
          .map((p) => [
            p.name || 'N/A',

            p.quantity || 0,

            p.orders || 0,

            // ONLY NUMBER
            formatNumber(p.revenue)
          ]);

      autoTable(doc, {
        startY: yPosition,

        head: [
          [
            'Product',
            'Quantity',
            'Orders',
            'Revenue'
          ]
        ],

        body: tableData,

        theme: 'grid',

        headStyles: {
          fillColor: [6, 78, 59],
          textColor: 255,
          fontSize: 10
        },

        bodyStyles: {
          fontSize: 9
        },

        margin: {
          left: 15,
          right: 15
        },

        columnStyles: {
          1: {
            halign: 'right'
          },
          2: {
            halign: 'right'
          },
          3: {
            halign: 'right'
          }
        }
      });

    // =====================================================
    // CATEGORIES REPORT
    // =====================================================

    } else if (
      reportType === 'categories' &&
      reportData.categories &&
      reportData.categories.length > 0
    ) {

      const tableData =
        reportData.categories.map(
          (c) => [

            (
              c.categoryId ||
              c.category ||
              'N/A'
            ).replace('-', ' '),

            c.quantity || 0,

            c.orders || 0,

            // ONLY NUMBER
            formatNumber(c.revenue)
          ]
        );

      autoTable(doc, {
        startY: yPosition,

        head: [
          [
            'Category',
            'Quantity',
            'Orders',
            'Revenue'
          ]
        ],

        body: tableData,

        theme: 'grid',

        headStyles: {
          fillColor: [6, 78, 59],
          textColor: 255,
          fontSize: 10
        },

        bodyStyles: {
          fontSize: 9
        },

        margin: {
          left: 15,
          right: 15
        },

        columnStyles: {
          1: {
            halign: 'right'
          },
          2: {
            halign: 'right'
          },
          3: {
            halign: 'right'
          }
        }
      });

    // =====================================================
    // CUSTOMERS REPORT
    // =====================================================

    } else if (
      reportType === 'customers' &&
      reportData.customers &&
      reportData.customers.length > 0
    ) {

      const tableData =
        reportData.customers
          .slice(0, 30)
          .map((c) => [

            c.name ||
              'Unknown',

            c.customerEmail ||
              c.email ||
              'N/A',

            c.orderCount ||
              0,

            // ONLY NUMBER
            formatNumber(c.totalSpent)
          ]);

      autoTable(doc, {
        startY: yPosition,

        head: [
          [
            'Customer',
            'Email',
            'Orders',
            'Total Spent'
          ]
        ],

        body: tableData,

        theme: 'grid',

        headStyles: {
          fillColor: [6, 78, 59],
          textColor: 255,
          fontSize: 10
        },

        bodyStyles: {
          fontSize: 9
        },

        margin: {
          left: 15,
          right: 15
        },

        columnStyles: {
          2: {
            halign: 'right'
          },
          3: {
            halign: 'right'
          }
        }
      });

    // =====================================================
    // PAYMENTS REPORT
    // =====================================================

    } else if (
      reportType === 'payments' &&
      reportData.payments &&
      reportData.payments.length > 0
    ) {

      const tableData =
        reportData.payments
          .slice(0, 30)
          .map((p) => [

            p.orderId ||
              'N/A',

            p.customerEmail ||
              'N/A',

            p.paymentDate ||
              'N/A',

            p.paymentMethod ||
              'N/A',

            // ONLY NUMBER
            formatNumber(p.amount),

            p.paymentStatus ||
              'N/A'
          ]);

      autoTable(doc, {
        startY: yPosition,

        head: [
          [
            'Order ID',
            'Email',
            'Date',
            'Method',
            'Amount',
            'Status'
          ]
        ],

        body: tableData,

        theme: 'grid',

        headStyles: {
          fillColor: [6, 78, 59],
          textColor: 255,
          fontSize: 10
        },

        bodyStyles: {
          fontSize: 9
        },

        margin: {
          left: 15,
          right: 15
        },

        columnStyles: {
          4: {
            halign: 'right'
          }
        }
      });
    }

    // =====================================================
    // FOOTER
    // =====================================================

    const totalPages =
      doc.getNumberOfPages();

    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {

      doc.setPage(i);

      doc.setFontSize(8);
      doc.setTextColor(
        150,
        150,
        150
      );

      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        {
          align: 'center'
        }
      );

      doc.text(
        'Generated by Bommal Foods Admin',
        pageWidth / 2,
        pageHeight - 5,
        {
          align: 'center'
        }
      );
    }

    // =====================================================
    // DOWNLOAD PDF
    // =====================================================

    const fileName =
      `bommal-foods-${reportType}-report-${format(
        new Date(),
        'yyyy-MM-dd-HHmmss'
      )}.pdf`;

    doc.save(fileName);

  } catch (error) {

    console.error(
      'PDF export error:',
      error
    );

    alert(
      `Error generating PDF: ${error.message}`
    );
  }
}


// =====================================================
// EXPORT TO EXCEL
// =====================================================

export function exportToExcel(
  reportType,
  reportData,
  fromDate,
  toDate
) {

  try {

    const workbook =
      XLSX.utils.book_new();

    // =====================================================
    // SUMMARY SHEET
    // =====================================================

    const summaryData = [

      [
        'BOMMAL FOODS - REPORT SUMMARY'
      ],

      [
        'Report Type',
        formatReportType(
          reportType
        )
      ],

      [
        'Date Range',

        `${format(
          new Date(fromDate),
          'dd-MM-yyyy'
        )} to ${format(
          new Date(toDate),
          'dd-MM-yyyy'
        )}`
      ],

      [
        'Generated Date',

        format(
          new Date(),
          'dd-MM-yyyy HH:mm:ss'
        )
      ],

      []
    ];

    // =====================================================
    // SUMMARY METRICS
    // =====================================================

    if (
      reportType === 'dashboard' ||
      reportType === 'summary'
    ) {

      summaryData.push([
        'Total Orders',
        reportData.totalOrders || 0
      ]);

      summaryData.push([
        'Total Revenue',
        reportData.totalRevenue || 0
      ]);

      summaryData.push([
        'Products Sold',
        reportData.totalProductsSold || 0
      ]);

      summaryData.push([
        'Average Order Value',
        reportData.averageOrderValue || 0
      ]);

      summaryData.push([
        'Total Customers',
        reportData.uniqueCustomers || 0
      ]);

    } else if (
      reportType === 'sales'
    ) {

      summaryData.push([
        'Total Orders',
        reportData.metrics?.totalOrders || 0
      ]);

      summaryData.push([
        'Total Revenue',
        reportData.metrics?.totalRevenue || 0
      ]);

      summaryData.push([
        'Products Sold',
        reportData.metrics?.totalProductsSold || 0
      ]);

      summaryData.push([
        'Average Order Value',
        reportData.metrics?.averageOrderValue || 0
      ]);

    } else if (
      reportType === 'products'
    ) {

      summaryData.push([
        'Total Products',
        reportData.totalProductTypes || 0
      ]);

      summaryData.push([
        'Total Quantity',
        reportData.totalQuantity || 0
      ]);

      summaryData.push([
        'Total Revenue',
        reportData.totalRevenue || 0
      ]);

    } else if (
      reportType === 'categories'
    ) {

      summaryData.push([
        'Total Categories',
        reportData.totalCategories || 0
      ]);

      summaryData.push([
        'Total Quantity',
        reportData.totalQuantity || 0
      ]);

      summaryData.push([
        'Total Revenue',
        reportData.totalRevenue || 0
      ]);

    } else if (
      reportType === 'customers'
    ) {

      summaryData.push([
        'Total Customers',
        reportData.totalCustomers || 0
      ]);

      summaryData.push([
        'Total Orders',
        reportData.totalOrders || 0
      ]);

      summaryData.push([
        'Total Spent',
        reportData.totalSpent || 0
      ]);

      summaryData.push([
        'Average Order Value',
        reportData.averageOrderValue || 0
      ]);

    } else if (
      reportType === 'payments'
    ) {

      summaryData.push([
        'Total Payments',
        reportData.totalPayments || 0
      ]);

      summaryData.push([
        'Total Amount',
        reportData.totalAmount || 0
      ]);
    }

    const summarySheet =
      XLSX.utils.aoa_to_sheet(
        summaryData
      );

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      'Summary'
    );

    // =====================================================
    // SALES REPORT
    // =====================================================

    if (
      reportType === 'sales'
    ) {

      // =====================================================
      // DAILY SALES SHEET
      // =====================================================

      if (
        reportData.dailySales &&
        reportData.dailySales.length > 0
      ) {

        const dailySalesData =
          reportData.dailySales.map(
            (d) => ({

              'Date':
                d.displayDate ||
                d.date ||
                'N/A',

              'Orders':
                d.orders || 0,

              'Quantity Sold':
                d.products || 0,

              'Sales':
                d.sales || 0
            })
          );

        const dailySalesSheet =
          XLSX.utils.json_to_sheet(
            dailySalesData
          );

        XLSX.utils.book_append_sheet(
          workbook,
          dailySalesSheet,
          'Daily Sales'
        );
      }

      // =====================================================
      // PRODUCT SALES SHEET
      // =====================================================

      if (
        reportData.productSales &&
        reportData.productSales.length > 0
      ) {

        const productsData =
          reportData.productSales.map(
            (p) => ({

              'Product':
                p.name || 'N/A',

              'Category':
                (
                  p.category ||
                  p.categoryId ||
                  'N/A'
                ).replace('-', ' '),

              'Quantity':
                p.quantity || 0,

              'Orders':
                p.orders || 0,

              'Revenue':
                p.revenue || 0
            })
          );

        const productsSheet =
          XLSX.utils.json_to_sheet(
            productsData
          );

        XLSX.utils.book_append_sheet(
          workbook,
          productsSheet,
          'Products'
        );
      }

      // =====================================================
      // CATEGORY SALES SHEET
      // =====================================================

      if (
        reportData.categorySales &&
        reportData.categorySales.length > 0
      ) {

        const categoriesData =
          reportData.categorySales.map(
            (c) => ({

              'Category':
                (
                  c.category ||
                  c.categoryId ||
                  'N/A'
                ).replace('-', ' '),

              'Quantity':
                c.quantity || 0,

              'Orders':
                c.orders || 0,

              'Revenue':
                c.revenue || 0
            })
          );

        const categoriesSheet =
          XLSX.utils.json_to_sheet(
            categoriesData
          );

        XLSX.utils.book_append_sheet(
          workbook,
          categoriesSheet,
          'Categories'
        );
      }

    // =====================================================
    // ORDERS REPORT
    // =====================================================

    } else if (
      reportType === 'orders' &&
      reportData.orders &&
      reportData.orders.length > 0
    ) {

      const ordersData =
        reportData.orders.map(
          (order) => {

            const row = {};

            Object.entries(
              order
            ).forEach(
              ([key, value]) => {

                if (
                  key !== 'items'
                ) {

                  row[key] =
                    formatExcelValue(
                      value
                    );
                }
              }
            );

            return row;
          }
        );

      const ordersSheet =
        XLSX.utils.json_to_sheet(
          ordersData
        );

      XLSX.utils.book_append_sheet(
        workbook,
        ordersSheet,
        'Orders'
      );

      // =====================================================
      // ORDER ITEMS SHEET
      // =====================================================

      const orderItemsData =
        reportData.orders.flatMap(
          (order) => (

            Array.isArray(
              order.items
            )
              ? order.items
              : []

          ).map(
            (item, index) => ({

              'Order ID':
                order.orderId ||
                order.id ||
                order._id ||
                'N/A',

              'Order Date':
                order.createdAt
                  ? format(
                      new Date(
                        order.createdAt
                      ),
                      'dd-MM-yyyy HH:mm:ss'
                    )
                  : 'N/A',

              'Customer Email':
                order.userEmail ||
                order.customerEmail ||
                'N/A',

              'Item Number':
                index + 1,

              'Product ID':
                item.id ||
                item.productId ||
                'N/A',

              'Product Name':
                item.name ||
                item.productName ||
                'N/A',

              'Category':
                item.categoryId ||
                item.category ||
                'N/A',

              'Quantity':
                item.quantity || 0,

              'Unit Price':
                item.price ||
                item.unitPrice ||
                0,

              'Line Total':
                (
                  item.price ||
                  item.unitPrice ||
                  0
                ) *
                (
                  item.quantity || 0
                ),

              'Item Details':
                formatExcelValue(
                  item
                )
            })
          )
        );

      if (
        orderItemsData.length > 0
      ) {

        const orderItemsSheet =
          XLSX.utils.json_to_sheet(
            orderItemsData
          );

        XLSX.utils.book_append_sheet(
          workbook,
          orderItemsSheet,
          'Order Items'
        );
      }

    // =====================================================
    // PRODUCTS REPORT
    // =====================================================

    } else if (
      reportType === 'products' &&
      reportData.products &&
      reportData.products.length > 0
    ) {

      const productsData =
        reportData.products.map(
          (p) => ({

            'Product':
              p.name || 'N/A',

            'Category':
              (
                p.categoryId ||
                p.category ||
                'N/A'
              ).replace('-', ' '),

            'Quantity Sold':
              p.quantity || 0,

            'Number of Orders':
              p.orders || 0,

            'Total Revenue':
              p.revenue || 0
          })
        );

      const productsSheet =
        XLSX.utils.json_to_sheet(
          productsData
        );

      XLSX.utils.book_append_sheet(
        workbook,
        productsSheet,
        'Products'
      );

    // =====================================================
    // CATEGORIES REPORT
    // =====================================================

    } else if (
      reportType === 'categories' &&
      reportData.categories &&
      reportData.categories.length > 0
    ) {

      const categoriesData =
        reportData.categories.map(
          (c) => ({

            'Category':
              (
                c.categoryId ||
                c.category ||
                'N/A'
              ).replace('-', ' '),

            'Quantity':
              c.quantity || 0,

            'Orders':
              c.orders || 0,

            'Revenue':
              c.revenue || 0
          })
        );

      const categoriesSheet =
        XLSX.utils.json_to_sheet(
          categoriesData
        );

      XLSX.utils.book_append_sheet(
        workbook,
        categoriesSheet,
        'Categories'
      );

    // =====================================================
    // CUSTOMERS REPORT
    // =====================================================

    } else if (
      reportType === 'customers' &&
      reportData.customers &&
      reportData.customers.length > 0
    ) {

      const customersData =
        reportData.customers.map(
          (c) => ({

            'Customer Name':
              c.name ||
              'Unknown',

            'Email':
              c.customerEmail ||
              c.email ||
              'N/A',

            'Total Orders':
              c.orderCount || 0,

            'Total Spent':
              c.totalSpent || 0,

            'Last Order':
              c.lastOrderDate
                ? format(
                    new Date(
                      c.lastOrderDate
                    ),
                    'dd-MM-yyyy'
                  )
                : 'N/A'
          })
        );

      const customersSheet =
        XLSX.utils.json_to_sheet(
          customersData
        );

      XLSX.utils.book_append_sheet(
        workbook,
        customersSheet,
        'Customers'
      );

    // =====================================================
    // PAYMENTS REPORT
    // =====================================================

    } else if (
      reportType === 'payments' &&
      reportData.payments &&
      reportData.payments.length > 0
    ) {

      const paymentsData =
        reportData.payments.map(
          (p) => ({

            'Order ID':
              p.orderId ||
              'N/A',

            'Customer Email':
              p.customerEmail ||
              'N/A',

            'Payment Date':
              p.paymentDate ||
              'N/A',

            'Payment Method':
              p.paymentMethod ||
              'N/A',

            'Amount':
              p.amount || 0,

            'Payment Status':
              p.paymentStatus ||
              'N/A',

            'Order Status':
              p.orderStatus ||
              'N/A'
          })
        );

      const paymentsSheet =
        XLSX.utils.json_to_sheet(
          paymentsData
        );

      XLSX.utils.book_append_sheet(
        workbook,
        paymentsSheet,
        'Payments'
      );
    }

    // =====================================================
    // DOWNLOAD EXCEL
    // =====================================================

    const fileName =
      `bommal-foods-${reportType}-report-${format(
        new Date(),
        'yyyy-MM-dd-HHmmss'
      )}.xlsx`;

    XLSX.writeFile(
      workbook,
      fileName
    );

  } catch (error) {

    console.error(
      'Excel export error:',
      error
    );

    alert(
      `Error generating Excel file: ${error.message}`
    );
  }
}


// =====================================================
// FORMAT EXCEL VALUE
// =====================================================

function formatExcelValue(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  if (
    value instanceof Date
  ) {

    return format(
      value,
      'dd-MM-yyyy HH:mm:ss'
    );
  }

  if (
    typeof value === 'object'
  ) {

    return JSON.stringify(
      value
    );
  }

  return value;
}


// =====================================================
// FORMAT REPORT TYPE
// =====================================================

function formatReportType(type) {

  const types = {

    'dashboard':
      'Dashboard Summary',

    'summary':
      'Dashboard Summary',

    'sales':
      'Sales Report',

    'orders':
      'Order Report',

    'products':
      'Product Sales Report',

    'categories':
      'Category Sales Report',

    'customers':
      'Customer/Retailer Report',

    'payments':
      'Payment Report'
  };

  return (
    types[type] ||
    type ||
    'Report'
  );
}

export async function downloadInvoice(order) {
  const { jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const orderId = order.orderId || order.id || 'N/A';
  const address = order.shippingAddress || {};
  const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A';
  const discount = Number(order.discountAmount ?? 0);
  const shipping = Number(order.shippingFee ?? 0);

  try {
    const logoResponse = await fetch('/logo.jpeg');
    const logoBlob = await logoResponse.blob();
    const logoData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(logoBlob);
    });
    doc.addImage(logoData, 'JPEG', 15, 20, 25, 18);
  } catch (error) {
    console.warn('Invoice logo could not be loaded:', error);
  }

  doc.setDrawColor(6, 78, 59);
  doc.setLineWidth(0.6);
  doc.line(15, 15, pageWidth - 15, 15);
  doc.setTextColor(6, 78, 59);
  doc.setFontSize(20);
  doc.text('BOMMAL FOODS', pageWidth / 2, 27, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('WHOLESALE FOOD STORE', pageWidth / 2, 34, { align: 'center' });
  doc.setFontSize(15);
  doc.setTextColor(0, 0, 0);
  doc.text('TAX INVOICE', pageWidth / 2, 45, { align: 'center' });
  doc.line(15, 51, pageWidth - 15, 51);

  doc.setFontSize(9);
  doc.text(`Invoice No: ${order.invoiceNumber || 'N/A'}`, 15, 61);
  doc.text(`Order ID: ${orderId}`, 15, 67);
  doc.text(`Order Date: ${date}`, 15, 73);
  doc.setFontSize(11);
  doc.setTextColor(6, 78, 59);
  doc.text('BILL TO', 15, 86);
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${address.name || 'N/A'}`, 15, 94);
  doc.text(`Email: ${order.userEmail || 'N/A'}`, 15, 100);
  doc.text(`Phone: ${address.phone || 'N/A'}`, 15, 106);
  doc.text(`Address: ${[address.address, address.city, address.state, address.pincode].filter(Boolean).join(', ') || 'N/A'}`, 15, 112, { maxWidth: pageWidth - 30 });

  autoTable(doc, {
    startY: 123,
    head: [['Product', 'Qty', 'Price', 'Total']],
    body: (order.items || []).map((item) => [item.name || 'N/A', item.quantity || 0, money(item.price), money(Number(item.price || 0) * Number(item.quantity || 0))]),
    theme: 'grid',
    headStyles: { fillColor: [6, 78, 59], textColor: 255 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    styles: { fontSize: 9 }
  });

  let y = doc.lastAutoTable.finalY + 12;
  const summary = [['Subtotal', money(order.subtotal)], ['Shipping / Freight', shipping === 0 ? 'FREE' : money(shipping)], ['Discount', discount ? `- ${money(discount)}` : money(0)], ['TOTAL', money(order.total)]];
  autoTable(doc, { startY: y, body: summary, theme: 'plain', tableWidth: 85, margin: { left: pageWidth - 100 }, styles: { fontSize: 9 }, columnStyles: { 1: { halign: 'right' } }, didParseCell: (data) => { if (data.row.index === 3) data.cell.styles.fontStyle = 'bold'; } });
  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.text(`Payment Status: ${String(order.paymentStatus || 'N/A').replaceAll('_', ' ')}`, 15, y);
  doc.text(`Payment Method: ${order.paymentMethod || 'N/A'}`, 15, y + 6);
  doc.text(`Order Status: ${order.status || 'N/A'}`, 15, y + 12);
  doc.setTextColor(6, 78, 59);
  doc.setFontSize(11);
  doc.text('Thank you for your order!', pageWidth / 2, 280, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('BOMMAL FOODS', pageWidth / 2, 287, { align: 'center' });
  doc.save(`Bommal-Foods-Invoice-${order.invoiceNumber || orderId}.pdf`);
}