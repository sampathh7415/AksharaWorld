/**
 * Send receipt via Gmail API after Transactions row is added.
 * Trigger: onEdit on Transactions sheet or manual menu.
 * Requires Gmail API enabled in Apps Script project.
 */
function sendAksharaReceiptFromRow(rowIndex) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transactions');
  if (!sheet) throw new Error('Transactions sheet not found');

  const row = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const data = Object.fromEntries(headers.map((h, i) => [h, row[i]]));

  const email = data.customer_email || data.email;
  if (!email) throw new Error('No customer_email on transaction row');

  const html = HtmlService.createHtmlOutputFromFile('gmail-receipt-template')
    .getContent()
    .replace('{{CUSTOMER_NAME}}', data.customer_name || 'there')
    .replace('{{AMOUNT_INR}}', String(data.amount || data.amount_inr || ''))
    .replace('{{RAZORPAY_PAYMENT_ID}}', data.payment_id || data.id || '')
    .replace('{{PAYMENT_DATE}}', String(data.date || new Date()))
    .replace('{{OFFER_VARIANT}}', data.offer_variant || 'standard_1500')
    .replace('{{TERMS_URL}}', 'https://your-domain.pages.dev/public/terms');

  GmailApp.sendEmail(email, 'Akshara World — Payment receipt', 'Thank you for your purchase.', {
    htmlBody: html,
    name: 'Akshara World',
  });
}
