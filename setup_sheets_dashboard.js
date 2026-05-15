// AKSHARA WORLD — GOOGLE SHEETS DASHBOARD SYNC (Apps Script)
// Instructions:
// 1. Go to Google Sheets -> Create a new sheet "Akshara World - Live Dashboard"
// 2. Extensions -> Apps Script
// 3. Paste this code.
// 4. Run `setupDashboard()` once to create the headers.
// 5. Deploy -> New Deployment -> Web app -> Execute as: Me, Access: Anyone -> Deploy.
// 6. Copy the Web App URL and add it to sam-brain wrangler.toml as GOOGLE_SHEETS_WEBHOOK_URL.

function setupDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Revenue Log Sheet
  let revenueSheet = ss.getSheetByName("Revenue_Log");
  if (!revenueSheet) {
    revenueSheet = ss.insertSheet("Revenue_Log");
    revenueSheet.appendRow(["Timestamp", "Payment ID", "Amount (INR)", "Status", "Notes"]);
    revenueSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#d9ead3");
  }

  // 2. AI Action Log Sheet
  let aiLogSheet = ss.getSheetByName("Sam_Action_Log");
  if (!aiLogSheet) {
    aiLogSheet = ss.insertSheet("Sam_Action_Log");
    aiLogSheet.appendRow(["Timestamp", "Action ID", "Decision", "Details"]);
    aiLogSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#c9daf8");
  }

  // 3. Summary Dashboard Sheet
  let summarySheet = ss.getSheetByName("Command_Center");
  if (!summarySheet) {
    summarySheet = ss.insertSheet("Command_Center", 0);
    summarySheet.getRange("A1").setValue("AKSHARA WORLD — COMMAND CENTER").setFontSize(16).setFontWeight("bold");
    summarySheet.getRange("A3").setValue("Total Revenue:");
    summarySheet.getRange("B3").setFormula('=SUM(Revenue_Log!C:C)');
    summarySheet.getRange("A4").setValue("Total AI Actions:");
    summarySheet.getRange("B4").setFormula('=COUNTA(Sam_Action_Log!A:A)-1');
  }
}

// Webhook listener for Sam Brain
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.type === "revenue") {
      const sheet = ss.getSheetByName("Revenue_Log");
      sheet.appendRow([new Date(), data.paymentId, data.amount, data.status, data.notes]);
    } else if (data.type === "action") {
      const sheet = ss.getSheetByName("Sam_Action_Log");
      sheet.appendRow([new Date(), data.actionId, data.decision, data.details]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
