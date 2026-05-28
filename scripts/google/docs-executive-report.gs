/**
 * Akshara World — Option A: Google Docs Automated Executive Reporting
 * Paste this file in your Google Sheet's Extensions > Apps Script editor.
 * Trigger: On a weekly cron schedule (or run manually).
 */

function generateWeeklyExecutiveReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scorecardSheet = ss.getSheetByName('WeeklyScorecard');
  const systemLogSheet = ss.getSheetByName('Automation'); // or daily system logs
  
  if (!scorecardSheet) {
    throw new Error('WeeklyScorecard tab missing. Run setupAksharaOpsTabs first.');
  }

  const lastRow = scorecardSheet.getLastRow();
  if (lastRow < 2) {
    Logger.log('No data available in WeeklyScorecard to compile report.');
    return;
  }

  // Fetch the latest weekly row data
  const headers = scorecardSheet.getRange(1, 1, 1, scorecardSheet.getLastColumn()).getValues()[0];
  const lastRowValues = scorecardSheet.getRange(lastRow, 1, 1, scorecardSheet.getLastColumn()).getValues()[0];
  const metrics = Object.fromEntries(headers.map((h, i) => [h, lastRowValues[i]]));

  const weekStart = metrics.week_start ? Utilities.formatDate(new Date(metrics.week_start), 'GMT+5:30', 'yyyy-MM-dd') : 'N/A';
  const weekEnd = metrics.week_end ? Utilities.formatDate(new Date(metrics.week_end), 'GMT+5:30', 'yyyy-MM-dd') : 'N/A';
  const revenue = metrics.revenue_inr || 0;
  const netRevenue = metrics.net_revenue_inr || 0;
  const demos = metrics.pipeline_demo || 0;
  const paid = metrics.pipeline_paid || 0;
  const conversionRate = demos > 0 ? ((paid / demos) * 100).toFixed(1) + '%' : '0.0%';

  // Create a new Google Doc report in your Drive
  const docName = `Akshara_Executive_Report_Week_${weekStart}_to_${weekEnd}`;
  const doc = DocumentApp.create(docName);
  const body = doc.getBody();

  // Style properties
  body.setBackgroundColor('#090d16'); // Dark theme background matching Akshara World
  
  // Title Header
  const title = body.appendParagraph('AKSHARA WORLD');
  title.setFontFamily('Montserrat');
  title.setFontSize(26);
  title.setFontColor('#ffffff');
  title.setBold(true);
  title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  const subtitle = body.appendParagraph('Autonomous Weekly Executive Memo');
  subtitle.setFontFamily('Montserrat');
  subtitle.setFontSize(14);
  subtitle.setFontColor('#94a3b8');
  subtitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  // Gradient Bar placeholder (using border or text)
  body.appendHorizontalRule().setLineHeight(3);

  // Greeting / Overview section
  const sectionTitle = body.appendParagraph('\n📊 BUSINESS OVERVIEW & PERFORMANCE');
  sectionTitle.setFontSize(16);
  sectionTitle.setFontColor('#22d3ee'); // Cyan highlight
  sectionTitle.setBold(true);

  const p1 = body.appendParagraph(
    `This executive performance report was autonomously compiled by Sam AI CEO on ${Utilities.formatDate(new Date(), 'GMT+5:30', 'yyyy-MM-dd HH:mm:ss')} IST.\n` +
    `Analyzing performance ledger values from ${weekStart} to ${weekEnd}.`
  );
  p1.setFontColor('#cbd5e1');
  p1.setFontSize(11);

  // Scorecard Metrics Table
  const tableData = [
    ['Indicator Metric', 'Value / Performance Details', 'Status'],
    ['Week Period', `${weekStart} to ${weekEnd}`, 'Active'],
    ['Gross Revenue', `INR ${revenue.toLocaleString('en-IN')}`, 'Logged'],
    ['Net Payouts', `INR ${netRevenue.toLocaleString('en-IN')}`, 'Cleared'],
    ['Product Demos Scheduled', String(demos), 'In Pipeline'],
    ['Paid Conversions', String(paid), 'Won'],
    ['Sales Conversion Rate', conversionRate, conversionRate !== '0.0%' ? 'Stable' : 'Awaiting Data']
  ];

  const table = body.appendTable(tableData);
  table.setBorderColor('#1e293b');
  
  // Table Styling
  for (let r = 0; r < tableData.length; r++) {
    const row = table.getRow(r);
    for (let c = 0; c < tableData[r].length; c++) {
      const cell = row.getCell(c);
      cell.setBackgroundColor(r === 0 ? '#1e293b' : '#0f172a');
      cell.setFontColor(r === 0 ? '#ffffff' : '#cbd5e1');
      cell.setFontSize(10);
      cell.setPadding(8);
      if (r === 0) cell.setBold(true);
    }
  }

  // Summary / Insights
  const insightsTitle = body.appendParagraph('\n💡 SAM AI DIRECTIVE & FORECAST');
  insightsTitle.setFontSize(16);
  insightsTitle.setFontColor('#a78bfa'); // Purple highlight
  insightsTitle.setBold(true);

  const directive = getAiCEOWeeklySummary_(revenue, demos, paid);
  const p2 = body.appendParagraph(directive);
  p2.setFontColor('#cbd5e1');
  p2.setFontSize(11);
  p2.setLineSpacing(1.5);

  doc.saveAndClose();

  // Alert Owner via Telegram
  const docUrl = doc.getUrl();
  const telegramToken = PropertiesService.getScriptProperties().getProperty('TELEGRAM_TOKEN');
  const telegramChatId = PropertiesService.getScriptProperties().getProperty('TELEGRAM_CHAT_ID');

  if (telegramToken && telegramChatId) {
    const msg = `📊 *Weekly Executive Report Compiled!* \n\n` +
                `*Period*: ${weekStart} to ${weekEnd}\n` +
                `*Gross Revenue*: ₹${revenue}\n` +
                `*Paid Leads*: ${paid}\n` +
                `*Conversion*: ${conversionRate}\n\n` +
                `🔗 [View Live Executive Report in Google Docs](${docUrl})`;
                
    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: telegramChatId,
        text: msg,
        parse_mode: 'Markdown'
      })
    });
  }

  Logger.log(`Executive report created: ${docUrl}`);
}

function getAiCEOWeeklySummary_(revenue, demos, paid) {
  if (revenue === 0) {
    return 'Directive: Customer acquisition metrics currently static. Sam recommends initiating Outreach Campaign v1.0 targeting tech startups on LinkedIn to load pipeline interest.';
  }
  if (paid / demos < 0.2 && demos > 0) {
    return 'Directive: High interest logged, but conversion remains below threshold. Retool sales script on WhatsApp, establish high-touch follow-ups, and review early-bird incentive slots.';
  }
  return 'Directive: Core system healthy and scaling. Auto-allocating passive ad-revenue slots on Blogger. Tech department directed to implement incremental feature checks.';
}
