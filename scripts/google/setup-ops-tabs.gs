/**
 * Akshara World — 30-Day Ops Sheets Setup
 * Run once from Extensions > Apps Script in your Akshara SOT spreadsheet.
 * Creates SalesPipeline and WeeklyScorecard tabs with headers and data validation.
 */
function setupAksharaOpsTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  ensureTab_(ss, 'SalesPipeline', [
    'date', 'prospect_name', 'channel', 'stage', 'offer_variant',
    'notes', 'next_action', 'owner'
  ], {
    stage: ['prospect', 'contacted', 'replied', 'demo', 'paid', 'lost'],
    channel: ['WhatsApp', 'Email', 'LinkedIn', 'DM', 'Referral', 'Other'],
    offer_variant: ['early_bird_999', 'standard_1500', 'premium_4999']
  });

  ensureTab_(ss, 'WeeklyScorecard', [
    'week_start', 'week_end', 'touches', 'demos', 'early_bird_sold',
    'standard_sold', 'revenue_inr', 'refunds_inr', 'net_revenue_inr',
    'pipeline_contacted', 'pipeline_replied', 'pipeline_demo',
    'pipeline_paid', 'notes'
  ]);

  ensureTab_(ss, 'ProspectList', [
    'id', 'prospect_name', 'segment', 'channel_primary',
    'email_or_handle', 'source', 'status', 'priority', 'notes'
  ], {
    status: ['prospect', 'contacted', 'replied', 'demo', 'paid', 'lost'],
    priority: ['high', 'medium', 'low']
  });

  SpreadsheetApp.getUi().alert(
    'Akshara ops tabs ready: SalesPipeline, WeeklyScorecard, ProspectList'
  );
}

function ensureTab_(ss, name, headers, validations) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  if (validations) {
    const headerRow = headers;
    Object.keys(validations).forEach(function (colName) {
      const colIndex = headerRow.indexOf(colName) + 1;
      if (colIndex > 0) {
        const rule = SpreadsheetApp.newDataValidation()
          .requireValueInList(validations[colName], true)
          .build();
        sheet.getRange(2, colIndex, 500, 1).setDataValidation(rule);
      }
    });
  }
}

/**
 * Append a SalesPipeline row from webhook or manual form.
 */
function appendSalesPipelineRow_(row) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SalesPipeline');
  if (!sheet) throw new Error('SalesPipeline tab missing — run setupAksharaOpsTabs first');
  sheet.appendRow(row);
}
