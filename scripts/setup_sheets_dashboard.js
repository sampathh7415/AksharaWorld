function createDashboardSheet() {
  const FOLDER_ID = '17lcOvG7lVxN7FZvuBGsKYX-vQgr6Dt7q';
  const folder = DriveApp.getFolderById(FOLDER_ID);
  
  // Create Spreadsheet
  const ss = SpreadsheetApp.create('Akshara World - Live Dashboard');
  
  // Define sheets and headers
  const sheetsConfig = {
    'Business KPIs': ['Date', 'Uptime (%)', 'MTTR (min)', 'Human Intervention (hrs)', 'Total Revenue (INR)', 'Traffic (Daily)', 'Notes'],
    'Department Grid': ['Department', 'Status', 'Last Heartbeat', 'Active Tasks', 'Alerts'],
    'Approvals Queue': ['ID', 'Date', 'Type', 'Description', 'Action Required', 'Status', 'Owner Approval'],
    'Resource Inventory': ['Resource Name', 'Type', 'Provider', 'Quota Used (%)', 'Cost', 'Status', 'Last Checked'],
    'Change Log': ['Timestamp', 'Component', 'Change Type', 'Description', 'Rollback Plan'],
    'Three-Try Failures': ['Date', 'Task', 'Department', 'Error Root Cause', 'Standard Alternative Proposed', 'Status'],
    'Upgrade Proposals': ['Proposal ID', 'Date', 'New Tool', 'Department', 'Impact', 'Owner Status'],
    'File Review Reports': ['Date', 'Filename', 'Department', 'Recommendation', 'Action Taken']
  };

  // Setup each sheet
  let firstSheet = ss.getSheets()[0];
  let isFirst = true;

  for (const [sheetName, headers] of Object.entries(sheetsConfig)) {
    let currentSheet;
    if (isFirst) {
      currentSheet = firstSheet;
      currentSheet.setName(sheetName);
      isFirst = false;
    } else {
      currentSheet = ss.insertSheet(sheetName);
    }
    
    // Set headers
    if (headers.length > 0) {
      currentSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      currentSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      currentSheet.getRange(1, 1, 1, headers.length).setBackground('#f3f3f3');
      currentSheet.setFrozenRows(1);
    }
  }

  // Initial Data
  const deptSheet = ss.getSheetByName('Department Grid');
  const depts = [
    ['Content_Forge', '🟢 Active', new Date(), '0', 'None'],
    ['Media_Studio', '🟢 Active', new Date(), '0', 'None'],
    ['Growth_Engine', '🟢 Active', new Date(), '0', 'None'],
    ['Revenue_Vault', '🟢 Active', new Date(), '0', 'None'],
    ['Tech_Core', '🟢 Active', new Date(), '0', 'None'],
    ['Guardian_Ops', '🟢 Active', new Date(), '0', 'None'],
    ['Insight_Lab', '🟢 Active', new Date(), '0', 'None'],
    ['Innovation_Scout', '🟢 Active', new Date(), '0', 'None']
  ];
  deptSheet.getRange(2, 1, depts.length, 5).setValues(depts);

  // Move the file into the Akshara World folder -> 03_Dashboard
  const fileId = ss.getId();
  const file = DriveApp.getFileById(fileId);
  
  // Find or create 03_Dashboard folder
  let dashboardFolder;
  const folders = folder.getFoldersByName('03_Dashboard');
  if (folders.hasNext()) {
    dashboardFolder = folders.next();
  } else {
    dashboardFolder = folder.createFolder('03_Dashboard');
  }
  
  dashboardFolder.addFile(file);
  DriveApp.getRootFolder().removeFile(file); // Remove from root

  // Create link text file
  const linkFile = dashboardFolder.getFilesByName('google_sheets_link.txt');
  if (linkFile.hasNext()) {
    linkFile.next().setContent(ss.getUrl());
  } else {
    dashboardFolder.createFile('google_sheets_link.txt', ss.getUrl(), MimeType.PLAIN_TEXT);
  }

  // Ensure owner only
  const OWNER_EMAIL = Session.getActiveUser().getEmail();
  try {
    file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    file.getEditors().forEach(ed => {
      if(ed.getEmail() !== OWNER_EMAIL) file.removeEditor(ed);
    });
    file.getViewers().forEach(v => {
      if(v.getEmail() !== OWNER_EMAIL) file.removeViewer(v);
    });
  } catch (e) {
    Logger.log('Permissions error: ' + e);
  }

  Logger.log('Dashboard Sheet created successfully! Link: ' + ss.getUrl());
}
