export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
// import fs from 'fs';

export async function POST(req: NextRequest) {
  const { id, action } = await req.json();
  const capsulePath = "G:\\My Drive\\Akshara World\\01_Capsule\\capsule_latest.md";
  
  console.log(`[APPROVAL SYSTEM] Processing ${id} - Action: ${action}`);

  try {
    // Cloudflare Edge Runtime does not support 'fs'.
    // let capsule = fs.readFileSync(capsulePath, 'utf8');
    
    // if (action === 'approve') {
    //   const approvalRegex = new RegExp(`- ${id}: .*`, 'g');
    //   const inProgressRegex = new RegExp(`- 🔄 ${id === 'APR-001' ? 'Deploy dashboard' : 'Complete Drive folder'}.*`, 'g');

    //   if (approvalRegex.test(capsule)) {
    //     console.log(`[APPROVAL SYSTEM] Match found for ${id}. Updating...`);
    //     capsule = capsule.replace(approvalRegex, `- ✅ ${id} (Approved by Owner - ${new Date().toLocaleString()})`);
    //     capsule = capsule.replace(inProgressRegex, `- ✅ ${id === 'APR-001' ? 'Deploy dashboard' : 'Complete Drive folder'} (Ready)`);
        
    //     fs.writeFileSync(capsulePath, capsule);
    //     console.log(`[APPROVAL SYSTEM] Successfully saved to Drive.`);
    //     return NextResponse.json({ success: true, message: `Approved ${id}` });
    //   } else {
    //     console.warn(`[APPROVAL SYSTEM] No match found for ${id} in capsule.`);
    //     return NextResponse.json({ success: false, message: "Could not find task in Capsule file." });
    //   }
    // }
    
    // Fallback stub for edge runtimes
    console.log(`[APPROVAL SYSTEM] Simulated approve step on Edge`);
    return NextResponse.json({ success: true, message: `Simulated edge approval` });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    console.error(`[APPROVAL SYSTEM] ERROR: ${errorMsg}`);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
