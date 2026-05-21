import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

export async function POST(req: NextRequest) {
  const { id, action } = await req.json();
  const capsulePath = "G:\\My Drive\\Akshara World\\01_Capsule\\capsule_latest.md";
  
  console.log(`[APPROVAL SYSTEM] Processing ${id} - Action: ${action}`);

  try {
    let capsule = await fs.promises.readFile(capsulePath, 'utf8');
    
    if (action === 'approve') {
      // Robust Regex to find the line regardless of minor spacing differences
      const approvalRegex = new RegExp(`- ${id}: .*`, 'g');
      const inProgressRegex = new RegExp(`- 🔄 ${id === 'APR-001' ? 'Deploy dashboard' : 'Complete Drive folder'}.*`, 'g');

      if (approvalRegex.test(capsule)) {
        console.log(`[APPROVAL SYSTEM] Match found for ${id}. Updating...`);
        capsule = capsule.replace(approvalRegex, `- ✅ ${id} (Approved by Owner - ${new Date().toLocaleString()})`);
        capsule = capsule.replace(inProgressRegex, `- ✅ ${id === 'APR-001' ? 'Deploy dashboard' : 'Complete Drive folder'} (Ready)`);
        
        await fs.promises.writeFile(capsulePath, capsule);
        console.log(`[APPROVAL SYSTEM] Successfully saved to Drive.`);
        return NextResponse.json({ success: true, message: `Approved ${id}` });
      } else {
        console.warn(`[APPROVAL SYSTEM] No match found for ${id} in capsule.`);
        return NextResponse.json({ success: false, message: "Could not find task in Capsule file." });
      }
    }
    
    return NextResponse.json({ success: false, message: "Action ignored." });
  } catch (e: any) {
    console.error(`[APPROVAL SYSTEM] ERROR: ${e.message}`);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
