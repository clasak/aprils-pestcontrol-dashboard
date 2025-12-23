/**
 * Quote email template data
 */
export interface QuoteEmailData {
  quoteNumber: string;
  customerName: string;
  customerEmail?: string;
  totalAmount: string; // Formatted currency string
  validUntil: string; // Formatted date string
  quoteViewUrl?: string;
  companyName?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  lineItemsSummary?: Array<{
    name: string;
    amount: string;
  }>;
  customMessage?: string;
}

/**
 * Generate quote email HTML
 */
export const quoteEmailTemplate = (data: QuoteEmailData): string => {
  const {
    quoteNumber,
    customerName,
    totalAmount,
    validUntil,
    quoteViewUrl,
    companyName = "April's Pest Control",
    companyPhone = '(555) 123-4567',
    companyEmail = 'info@aprilspestcontrol.com',
    companyAddress = '123 Main Street, Anytown, ST 12345',
    lineItemsSummary = [],
    customMessage,
  } = data;

  const lineItemsHtml = lineItemsSummary.length > 0
    ? `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #1976d2;">
            <th style="padding: 12px; text-align: left; color: #ffffff; border-radius: 4px 0 0 0;">Service</th>
            <th style="padding: 12px; text-align: right; color: #ffffff; border-radius: 0 4px 0 0;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsSummary.map((item, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#fafafa'};">
              <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e0e0e0;">${item.amount}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
    : '';

  const viewQuoteButton = quoteViewUrl
    ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${quoteViewUrl}" 
           style="display: inline-block; background-color: #1976d2; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
          View & Accept Quote
        </a>
      </div>
    `
    : '';

  const customMessageHtml = customMessage
    ? `
      <div style="background-color: #e3f2fd; padding: 16px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #1976d2;">
        <p style="margin: 0; color: #1565c0;">${customMessage}</p>
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Quote from ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #212121;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background-color: #1976d2; padding: 30px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
        ${companyName}
      </h1>
      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
        Professional Pest Control Services
      </p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      
      <!-- Greeting -->
      <h2 style="margin: 0 0 20px 0; color: #212121; font-size: 24px; font-weight: 500;">
        Hello ${customerName},
      </h2>
      
      <p style="margin: 0 0 20px 0; color: #616161; font-size: 16px; line-height: 1.6;">
        Thank you for your interest in our services! We've prepared a customized quote for you.
      </p>
      
      ${customMessageHtml}
      
      <!-- Quote Summary Box -->
      <div style="background-color: #fafafa; border-radius: 8px; padding: 24px; margin: 24px 0; border: 1px solid #e0e0e0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <p style="margin: 0; color: #757575; font-size: 12px; text-transform: uppercase;">Quote Number</p>
            <p style="margin: 4px 0 0 0; color: #1976d2; font-size: 18px; font-weight: 700;">${quoteNumber}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; color: #757575; font-size: 12px; text-transform: uppercase;">Total Amount</p>
            <p style="margin: 4px 0 0 0; color: #212121; font-size: 24px; font-weight: 700;">${totalAmount}</p>
          </div>
        </div>
        
        <div style="border-top: 1px solid #e0e0e0; padding-top: 16px; margin-top: 16px;">
          <p style="margin: 0; color: #757575; font-size: 12px;">
            <strong style="color: #ff9800;">⏰ Valid Until:</strong> ${validUntil}
          </p>
        </div>
      </div>
      
      <!-- Line Items Summary -->
      ${lineItemsHtml}
      
      <!-- CTA Button -->
      ${viewQuoteButton}
      
      <!-- What's Next -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <h3 style="margin: 0 0 16px 0; color: #212121; font-size: 18px;">What Happens Next?</h3>
        <ol style="margin: 0; padding-left: 20px; color: #616161; line-height: 1.8;">
          <li>Review the quote details</li>
          <li>Click the button above to accept online, or reply to this email with any questions</li>
          <li>Once accepted, we'll contact you to schedule your service</li>
        </ol>
      </div>
      
      <!-- Contact Info -->
      <div style="margin-top: 30px; padding: 20px; background-color: #e8f5e9; border-radius: 8px;">
        <h3 style="margin: 0 0 12px 0; color: #2e7d32; font-size: 16px;">Questions? We're Here to Help!</h3>
        <p style="margin: 0; color: #616161; font-size: 14px; line-height: 1.6;">
          📞 Call us: <a href="tel:${companyPhone.replace(/[^0-9]/g, '')}" style="color: #1976d2; text-decoration: none;">${companyPhone}</a><br>
          ✉️ Email us: <a href="mailto:${companyEmail}" style="color: #1976d2; text-decoration: none;">${companyEmail}</a>
        </p>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="background-color: #fafafa; padding: 24px 30px; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0 0 8px 0; color: #616161; font-size: 14px; text-align: center;">
        <strong>${companyName}</strong>
      </p>
      <p style="margin: 0; color: #9e9e9e; font-size: 12px; text-align: center; line-height: 1.6;">
        ${companyAddress}<br>
        ${companyPhone} | ${companyEmail}
      </p>
      <p style="margin: 16px 0 0 0; color: #bdbdbd; font-size: 11px; text-align: center;">
        © ${new Date().getFullYear()} ${companyName}. All rights reserved.
      </p>
    </div>
    
  </div>
</body>
</html>
  `.trim();
};

/**
 * Generate plain text version of quote email
 */
export const quoteEmailPlainText = (data: QuoteEmailData): string => {
  const {
    quoteNumber,
    customerName,
    totalAmount,
    validUntil,
    quoteViewUrl,
    companyName = "April's Pest Control",
    companyPhone = '(555) 123-4567',
    companyEmail = 'info@aprilspestcontrol.com',
    lineItemsSummary = [],
    customMessage,
  } = data;

  let text = `
${companyName}
Professional Pest Control Services

Hello ${customerName},

Thank you for your interest in our services! We've prepared a customized quote for you.

${customMessage ? customMessage + '\n\n' : ''}
QUOTE DETAILS
-------------
Quote Number: ${quoteNumber}
Total Amount: ${totalAmount}
Valid Until: ${validUntil}

`;

  if (lineItemsSummary.length > 0) {
    text += 'SERVICES\n--------\n';
    lineItemsSummary.forEach(item => {
      text += `${item.name}: ${item.amount}\n`;
    });
    text += '\n';
  }

  if (quoteViewUrl) {
    text += `VIEW YOUR QUOTE: ${quoteViewUrl}\n\n`;
  }

  text += `
WHAT HAPPENS NEXT?
1. Review the quote details
2. Accept online or reply to this email with questions
3. Once accepted, we'll contact you to schedule your service

QUESTIONS? WE'RE HERE TO HELP!
Phone: ${companyPhone}
Email: ${companyEmail}

---
${companyName}
${companyPhone} | ${companyEmail}
  `.trim();

  return text;
};

