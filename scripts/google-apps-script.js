/**
 * 📊 AKSHARA WORLD — SheetsDb Webhook Script
 * 
 * Instructions:
 * 1. Open Google Sheets.
 * 2. Create/Open the spreadsheet with ID: 1yhdlHcayP5ZlzZnlr8neS6UMQcQIYqvipP0tek7E5oU
 * 3. Go to Extensions -> Apps Script.
 * 4. Paste this code, save, and click "Deploy" -> "New Deployment" -> "Web App".
 * 5. Set "Execute as": Me.
 * 6. Set "Who has access": Anyone.
 * 7. Copy the Web App URL and ensure it matches APPS_SCRIPT_WEBHOOK_URL in .env.local.
 */

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById("1yhdlHcayP5ZlzZnlr8neS6UMQcQIYqvipP0tek7E5oU");
  
  if (action === "getSubscriberCount") {
    let sheet = ss.getSheetByName("Subscribers");
    if (!sheet) {
      sheet = ss.insertSheet("Subscribers");
      sheet.appendRow(["Email", "Timestamp"]);
    }
    const lastRow = sheet.getLastRow();
    const count = lastRow > 1 ? lastRow - 1 : 0;
    return jsonResponse({ count: count });
  }
  
  if (action === "getLogs") {
    let sheet = ss.getSheetByName("System Logs");
    if (!sheet) {
      sheet = ss.insertSheet("System Logs");
      sheet.appendRow(["Timestamp", "Level", "Message"]);
    }
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return jsonResponse({ items: [] });
    }
    
    // Read last 10 log entries
    const startRow = Math.max(2, lastRow - 9);
    const numRows = lastRow - startRow + 1;
    const values = sheet.getRange(startRow, 1, numRows, 3).getValues();
    
    const items = values.reverse().map(row => ({
      timestamp: row[0],
      level: row[1],
      message: row[2]
    }));
    
    return jsonResponse({ items: items });
  }
  
  return jsonResponse({ error: "Invalid GET action" }, 400);
}

function doPost(e) {
  try {
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    const action = data.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById("1yhdlHcayP5ZlzZnlr8neS6UMQcQIYqvipP0tek7E5oU");
    
    if (action === "addSubscriber") {
      let sheet = ss.getSheetByName("Subscribers");
      if (!sheet) {
        sheet = ss.insertSheet("Subscribers");
        sheet.appendRow(["Email", "Timestamp"]);
      }
      const email = data.email;
      if (!email) {
        return jsonResponse({ error: "Missing email" }, 400);
      }
      
      // Prevent duplicates
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const emails = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
        if (emails.includes(email)) {
          return jsonResponse({ success: true, message: "Already subscribed" });
        }
      }
      
      sheet.appendRow([email, new Date().toISOString()]);
      return jsonResponse({ success: true, message: "Subscribed successfully" });
    }
    
    if (action === "addLog") {
      let sheet = ss.getSheetByName("System Logs");
      if (!sheet) {
        sheet = ss.insertSheet("System Logs");
        sheet.appendRow(["Timestamp", "Level", "Message"]);
      }
      const level = data.level || "INFO";
      const message = data.message;
      if (!message) {
        return jsonResponse({ error: "Missing message" }, 400);
      }
      
      sheet.appendRow([new Date().toISOString(), level, message]);
      
      // Keep logs size clean (prune older than 500 lines)
      const lastRow = sheet.getLastRow();
      if (lastRow > 500) {
        sheet.deleteRows(2, lastRow - 500);
      }
      
      return jsonResponse({ success: true });
    }
    
    return jsonResponse({ error: "Invalid POST action" }, 400);
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  }
}

function jsonResponse(obj, status = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
