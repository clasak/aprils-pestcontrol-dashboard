import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Register fonts (using system fonts for simplicity)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf', fontWeight: 700 },
  ],
});

// PDF Styles following the design system
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Roboto',
    color: '#212121',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1976d2',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1976d2',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: '#616161',
    lineHeight: 1.4,
  },
  quoteInfo: {
    textAlign: 'right',
  },
  quoteTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#212121',
    marginBottom: 8,
  },
  quoteNumber: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: 700,
    marginBottom: 4,
  },
  quoteDate: {
    fontSize: 9,
    color: '#616161',
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1976d2',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  customerInfo: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 4,
  },
  customerColumn: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: '#757575',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: '#212121',
    marginBottom: 6,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1976d2',
    padding: 8,
    borderRadius: 4,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    padding: 10,
    minHeight: 40,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  colDescription: {
    flex: 4,
  },
  colQty: {
    flex: 1,
    textAlign: 'center',
  },
  colPrice: {
    flex: 1.5,
    textAlign: 'right',
  },
  colTotal: {
    flex: 1.5,
    textAlign: 'right',
  },
  itemName: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 8,
    color: '#616161',
  },
  totalsSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsBox: {
    width: 220,
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 4,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalsLabel: {
    fontSize: 10,
    color: '#616161',
  },
  totalsValue: {
    fontSize: 10,
    color: '#212121',
  },
  discountValue: {
    color: '#f44336',
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 2,
    borderTopColor: '#1976d2',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#212121',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1976d2',
  },
  termsSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fafafa',
    borderRadius: 4,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 8,
    color: '#212121',
  },
  termsText: {
    fontSize: 8,
    color: '#616161',
    lineHeight: 1.5,
  },
  notesSection: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#212121',
    marginBottom: 4,
    height: 40,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#616161',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 8,
    color: '#757575',
  },
  validUntilBadge: {
    backgroundColor: '#fff3e0',
    padding: 6,
    borderRadius: 4,
    marginTop: 8,
  },
  validUntilText: {
    fontSize: 9,
    color: '#e65100',
    fontWeight: 700,
  },
  statusBadge: {
    padding: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
});

// Types
export interface QuotePDFLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface QuotePDFData {
  quoteNumber: string;
  status: string;
  createdAt: string;
  validUntil: string;
  // Customer
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  // Company
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  // Line Items
  lineItems: QuotePDFLineItem[];
  // Totals
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  // Terms
  termsAndConditions: string;
  notes?: string;
}

// Utility functions
const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: '#9e9e9e',
    sent: '#2196f3',
    viewed: '#ff9800',
    accepted: '#4caf50',
    rejected: '#f44336',
    expired: '#f44336',
  };
  return colors[status.toLowerCase()] || '#9e9e9e';
};

// PDF Document Component
export const QuotePDFDocument: React.FC<{ data: QuotePDFData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{data.companyName}</Text>
          <Text style={styles.companyDetails}>
            {data.companyAddress && `${data.companyAddress}\n`}
            {data.companyPhone && `Phone: ${data.companyPhone}\n`}
            {data.companyEmail && `Email: ${data.companyEmail}\n`}
            {data.companyWebsite && data.companyWebsite}
          </Text>
        </View>
        <View style={styles.quoteInfo}>
          <Text style={styles.quoteTitle}>QUOTE</Text>
          <Text style={styles.quoteNumber}>{data.quoteNumber}</Text>
          <Text style={styles.quoteDate}>Date: {formatDate(data.createdAt)}</Text>
          <View style={styles.validUntilBadge}>
            <Text style={styles.validUntilText}>
              Valid Until: {formatDate(data.validUntil)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(data.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(data.status) }]}>
              {data.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Customer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PREPARED FOR</Text>
        <View style={styles.customerInfo}>
          <View style={styles.customerColumn}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{data.customerName}</Text>
            {data.customerEmail && (
              <>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{data.customerEmail}</Text>
              </>
            )}
          </View>
          <View style={styles.customerColumn}>
            {data.customerPhone && (
              <>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.value}>{data.customerPhone}</Text>
              </>
            )}
            {data.customerAddress && (
              <>
                <Text style={styles.label}>Service Address</Text>
                <Text style={styles.value}>{data.customerAddress}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Line Items Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SERVICES</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.colDescription}>
              <Text style={styles.tableHeaderText}>Description</Text>
            </View>
            <View style={styles.colQty}>
              <Text style={styles.tableHeaderText}>Qty</Text>
            </View>
            <View style={styles.colPrice}>
              <Text style={styles.tableHeaderText}>Unit Price</Text>
            </View>
            <View style={styles.colTotal}>
              <Text style={styles.tableHeaderText}>Total</Text>
            </View>
          </View>

          {/* Table Rows */}
          {data.lineItems.map((item, index) => (
            <View
              key={item.id}
              style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
            >
              <View style={styles.colDescription}>
                <Text style={styles.itemName}>{item.description.split(' - ')[0]}</Text>
                {item.description.includes(' - ') && (
                  <Text style={styles.itemDescription}>
                    {item.description.split(' - ').slice(1).join(' - ')}
                  </Text>
                )}
              </View>
              <View style={styles.colQty}>
                <Text>{item.quantity}</Text>
              </View>
              <View style={styles.colPrice}>
                <Text>{formatCurrency(item.unitPrice)}</Text>
              </View>
              <View style={styles.colTotal}>
                <Text>{formatCurrency(item.total)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatCurrency(data.subtotal)}</Text>
          </View>
          {data.discountAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>
                Discount
                {data.discountType === 'percentage' && ` (${data.discountValue}%)`}
              </Text>
              <Text style={[styles.totalsValue, styles.discountValue]}>
                -{formatCurrency(data.discountAmount)}
              </Text>
            </View>
          )}
          {data.taxAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax ({data.taxRate}%)</Text>
              <Text style={styles.totalsValue}>{formatCurrency(data.taxAmount)}</Text>
            </View>
          )}
          <View style={styles.totalRowFinal}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.total)}</Text>
          </View>
        </View>
      </View>

      {/* Notes */}
      {data.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.termsTitle}>Notes</Text>
          <Text style={styles.termsText}>{data.notes}</Text>
        </View>
      )}

      {/* Terms and Conditions */}
      <View style={styles.termsSection}>
        <Text style={styles.termsTitle}>Terms and Conditions</Text>
        <Text style={styles.termsText}>{data.termsAndConditions}</Text>
      </View>

      {/* Signature Section */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Customer Signature</Text>
        </View>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Date</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for choosing {data.companyName}. We appreciate your business!
        </Text>
        <Text style={styles.footerText}>
          Questions? Contact us at {data.companyEmail || data.companyPhone}
        </Text>
      </View>
    </Page>
  </Document>
);

export default QuotePDFDocument;

