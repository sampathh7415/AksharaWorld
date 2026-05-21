import { NextResponse } from 'next/server';
import { runInnovationScan } from '../../../../lib/scout';
import { appendSheetData } from '../../../../lib/googleSheets';
import { createDriveFolder, uploadDriveFile } from '../../../../lib/googleDrive';
import { sendTelegramAlert } from '../../../../lib/telegram';

export const runtime = 'edge';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log("🤖 Starting Fully Autonomous Daily Loop...");

    // 1. Innovation_Scout
    const scanResult = await runInnovationScan();

    // 2. Archiving to Drive (Guardian_Ops)
    let folderId;
    if (process.env.DRIVE_ARCHIVE_FOLDER_ID) {
      const now = new Date();
      const monthStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}`;

      folderId = await createDriveFolder(`${monthStr}_Innovation_Scans`, process.env.DRIVE_ARCHIVE_FOLDER_ID);
      await uploadDriveFile(
        `scan_${now.toISOString().split('T')[0]}.txt`,
        scanResult.findings.join('\n'),
        'text/plain',
        folderId
      );
    }

    // 3. Logging to Sheets
    if (process.env.LOGS_SPREADSHEET_ID) {
      await appendSheetData(
        process.env.LOGS_SPREADSHEET_ID,
        'DailyLogs!A:E',
        [[new Date().toISOString(), 'run-daily-loop', 'SUCCESS', 'Scanned & Archived', folderId || 'None']]
      );
    }

    await sendTelegramAlert("🤖 <b>Daily Loop Complete</b>\n\nInnovation Scout, Drive Archive, and Sheets Logging executed successfully.");

    return NextResponse.json({ success: true, message: 'Daily loop completed successfully' });
  } catch (error: any) {
    console.error("Daily loop failed:", error);
    await sendTelegramAlert(`🚨 <b>Daily Loop Failed</b>\n\nError: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
