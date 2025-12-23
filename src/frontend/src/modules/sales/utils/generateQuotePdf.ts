import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import { QuotePDFDocument, QuotePDFData } from '../components/QuotePDF';

/**
 * Generate a PDF blob from quote data
 */
export const generateQuotePdfBlob = async (data: QuotePDFData): Promise<Blob> => {
  const doc = createElement(QuotePDFDocument, { data });
  const blob = await pdf(doc).toBlob();
  return blob;
};

/**
 * Generate and download a PDF from quote data
 */
export const downloadQuotePdf = async (
  data: QuotePDFData,
  filename?: string
): Promise<void> => {
  const blob = await generateQuotePdfBlob(data);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `Quote-${data.quoteNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Open PDF in a new browser tab
 */
export const openQuotePdfInNewTab = async (data: QuotePDFData): Promise<void> => {
  const blob = await generateQuotePdfBlob(data);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  
  // Clean up after a delay
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

/**
 * Default company info for PDF generation
 */
export const DEFAULT_COMPANY_INFO = {
  companyName: "April's Pest Control",
  companyAddress: '123 Main Street, Suite 100\nAnytown, ST 12345',
  companyPhone: '(555) 123-4567',
  companyEmail: 'info@aprilspestcontrol.com',
  companyWebsite: 'www.aprilspestcontrol.com',
};

/**
 * Default terms and conditions
 */
export const DEFAULT_TERMS = `TERMS AND CONDITIONS:

1. Payment: Payment is due upon completion of service unless other arrangements have been made.

2. Guarantee: We guarantee our services for 30 days. If pests return within this period, we will re-treat at no additional cost.

3. Access: Customer agrees to provide access to all areas required for treatment.

4. Preparation: For certain treatments, customer may be required to prepare the property according to our instructions.

5. Safety: Please follow all safety instructions provided by our technicians regarding pets, children, and food preparation areas.

6. Cancellation: Cancellations made less than 24 hours before scheduled service may be subject to a cancellation fee.

This quote is valid for 30 days from the date of issue.`;

/**
 * Convert internal quote format to PDF data format
 */
export interface QuoteForPDF {
  id?: string;
  quoteNumber?: string;
  status: string;
  createdAt?: string;
  validUntil: string;
  contact?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  termsAndConditions: string;
  notes?: string;
}

export const convertQuoteToPDFData = (
  quote: QuoteForPDF,
  companyInfo = DEFAULT_COMPANY_INFO
): QuotePDFData => {
  const contact = quote.contact;
  
  // Build customer address
  const addressParts: string[] = [];
  if (contact?.addressLine1) addressParts.push(contact.addressLine1);
  if (contact?.addressLine2) addressParts.push(contact.addressLine2);
  if (contact?.city || contact?.state || contact?.postalCode) {
    addressParts.push(
      [contact.city, contact.state, contact.postalCode].filter(Boolean).join(', ')
    );
  }
  
  return {
    quoteNumber: quote.quoteNumber || `Q-${quote.id?.slice(0, 8) || 'DRAFT'}`,
    status: quote.status,
    createdAt: quote.createdAt || new Date().toISOString(),
    validUntil: quote.validUntil,
    customerName: contact 
      ? `${contact.firstName} ${contact.lastName}` 
      : 'Customer',
    customerEmail: contact?.email,
    customerPhone: contact?.phone,
    customerAddress: addressParts.length > 0 ? addressParts.join('\n') : undefined,
    ...companyInfo,
    lineItems: quote.lineItems,
    subtotal: quote.subtotal,
    discountType: quote.discountType,
    discountValue: quote.discountValue,
    discountAmount: quote.discountAmount,
    taxRate: quote.taxRate,
    taxAmount: quote.taxAmount,
    total: quote.total,
    termsAndConditions: quote.termsAndConditions || DEFAULT_TERMS,
    notes: quote.notes,
  };
};

