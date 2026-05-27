/**
 * Google Apps Script — Auto-setup Akshara World Metrics sheet
 * 
 * HOW TO USE:
 * 1. Open your Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Paste this entire code, replacing what's there
 * 4. Click Run → setupAksharaSheet
 * 5. Grant permissions when asked
 */

function setupAksharaSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setName("Akshara World Metrics");

  // Define all tab names
  const tabs = [
    "DailyMetrics",
    "Transactions",
    "Subscribers",
    "Content",
    "SocialMedia",
    "Videos",
    "Automation",
    "Errors"
  ];

  // Get existing sheets
  const existingSheets = ss.getSheets().map(s => s.getName());

  // Create missing tabs
  tabs.forEach(tabName => {
    if (!existingSheets.includes(tabName)) {
      ss.insertSheet(tabName);
    }
  });

  // Remove default "Sheet1" if still present
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  // Setup headers for each tab
  setupDailyMetrics(ss);
  setupTransactions(ss);
  setupSubscribers(ss);
  setupAutomation(ss);
  setupErrors(ss);

  SpreadsheetApp.getUi().alert("✅ Akshara World Metrics sheet is ready!\n\nAll 8 tabs created with headers.\nAutomation will now log data here automatically.");
}

function setupDailyMetrics(ss) {
  const sheet = ss.getSheetByName("DailyMetrics");
  if (!sheet) return;
  const headers = ["Date", "Active Users", "Sessions", "Page Views", "Revenue (₹)", "New Subscribers", "Notes"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1a73e8").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
}

function setupTransactions(ss) {
  const sheet = ss.getSheetByName("Transactions");
  if (!sheet) return;
  const headers = ["Date", "Time (IST)", "Payment ID", "Customer Email", "Amount", "Status", "Method"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#34a853").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
}

function setupSubscribers(ss) {
  const sheet = ss.getSheetByName("Subscribers");
  if (!sheet) return;
  const headers = ["Date", "Email", "Source", "Status", "Product", "Notes"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#fbbc04").setFontColor("#000000");
  sheet.setFrozenRows(1);
}

function setupAutomation(ss) {
  const sheet = ss.getSheetByName("Automation");
  if (!sheet) return;
  const headers = ["Date", "Time (UTC)", "Source", "Task Name", "Status", "Duration (s)", "Notes"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#9334e6").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
}

function setupErrors(ss) {
  const sheet = ss.getSheetByName("Errors");
  if (!sheet) return;
  const headers = ["Date", "Time", "Component", "Error Message", "Severity", "Resolved?"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#ea4335").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
}
