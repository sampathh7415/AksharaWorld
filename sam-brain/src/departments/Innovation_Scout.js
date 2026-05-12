import { callGemini } from '../utils/gemini.js';

export async function runInnovationScout(env) {
  const prompt = "Act as the Innovation_Scout for Akshara World. Search for the top 3 trending AI tools or digital services niches today that have zero startup cost and high automation potential. For each, provide: 1. Tool Name, 2. Use Case, 3. Revenue Potential (₹0-100k/month). Provide the result in a structured report format.";

  // Sam will call the Gemini API on behalf of the department
  const report = await callGemini(prompt, env, {
    system: 'You are Innovation_Scout, an AI researcher finding new revenue niches for Akshara World. Focus on free tools with high automation potential.'
  });

  // In a real scenario, Sam would save this to 10_Upgrade_Proposals/ in Drive
  return {
    timestamp: new Date().toISOString(),
    report: report,
    status: "Success",
    department: "Innovation_Scout"
  };
}
