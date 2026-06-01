/**
 * 🕸️ SCRAPEGRAPH LOCAL AI WEB SCRAPER INTEGRATION
 * 📁 services/scrapegraph/scraper.ts
 *
 * Utilizes the local/cloud Gemini gateway to parse fetched raw web HTML/markdown
 * into clean, structured schema-aware JSON entities autonomously.
 */

import * as fs from 'fs';
import * as path from 'path';

interface ScrapingJob {
  jobId: string;
  url: string;
  schemaPrompt: string;
  timestamp: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  result?: Record<string, any> | string;
}

export class ScrapeGraphScraper {
  private outputDir: string;
  private memoryPath: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), '.code-review-graph');
    this.memoryPath = path.join(this.outputDir, 'scrapegraph-memory.json');
    this.ensureStorage();
  }

  private ensureStorage() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Helper to fetch and clean raw HTML from a page, converting it into clean markdown/text.
   */
  private async fetchAndCleanHTML(url: string): Promise<string> {
    try {
      console.log(`[ScrapeGraph] Fetching page content: ${url}...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const html = await response.text();
      
      // Basic tag cleaner (removes scripts, styles, and extracts readable text)
      let cleanedText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<\/?[^>]+(>|$)/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return cleanedText.substring(0, 15000); // Truncate to save token window
    } catch (e: any) {
      console.error(`[ScrapeGraph] Failed to fetch page content: ${e.message}`);
      return `MOCK_DATA_FALLBACK: Page fetch failed. Target URL: ${url}. Reason: ${e.message}`;
    }
  }

  /**
   * Processes the raw text with Gemini AI to parse it into structured JSON entities.
   */
  public async scrape(url: string, schemaPrompt: string): Promise<Record<string, any>> {
    const jobId = `JOB-SG-${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(`[ScrapeGraph] Starting scraping job ${jobId} on ${url}...`);
    
    const pageText = await this.fetchAndCleanHTML(url);
    const apiKey = process.env.GEMINI_API_KEY || '';
    const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    let structuredResult: Record<string, any> = {};
    
    if (apiKey) {
      try {
        console.log(`[ScrapeGraph] Asking Gemini to structure data based on schema prompt...`);
        const systemInstruction = `You are a high-fidelity data scraper. You take raw web text content and structure it strictly into a JSON object based on the requested fields. Output ONLY valid JSON inside markdown blocks or raw text. Do not comment.`;
        
        const response = await fetch(`${geminiUrl}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{
                text: `${systemInstruction}\n\nSchema Requirements:\n${schemaPrompt}\n\nWebpage Text Content:\n${pageText}`
              }]
            }]
          }),
          signal: AbortSignal.timeout(20000)
        });

        if (response.ok) {
          const resData = await response.json();
          const responseText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          // JSON block extractor
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            structuredResult = JSON.parse(jsonMatch[0]);
          } else {
            structuredResult = { rawText: responseText };
          }
        } else {
          throw new Error(`Gemini HTTP Error: ${response.status}`);
        }
      } catch (err: any) {
        console.error(`[ScrapeGraph] AI processing failed: ${err.message}`);
        structuredResult = { error: err.message, status: 'AI_FALLBACK' };
      }
    } else {
      // Mock data extraction fallback if API key is not configured
      console.log(`[ScrapeGraph] No API key found. Falling back to regex scraper patterns...`);
      structuredResult = {
        url,
        extractedAt: new Date().toISOString(),
        pricingFound: pageText.match(/₹\d+(?:,\d+)?/) ? pageText.match(/₹\d+(?:,\d+)?/)?.[0] : 'Not Found',
        emailContacts: pageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [],
        notes: 'Simulated heuristic regex parsing. Connect GEMINI_API_KEY for deep AI intelligence.'
      };
    }

    const job: ScrapingJob = {
      jobId,
      url,
      schemaPrompt,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      result: structuredResult
    };

    this.saveJobToMemory(job);
    return structuredResult;
  }

  private saveJobToMemory(job: ScrapingJob) {
    try {
      let currentJobs: ScrapingJob[] = [];
      if (fs.existsSync(this.memoryPath)) {
        try {
          currentJobs = JSON.parse(fs.readFileSync(this.memoryPath, 'utf8'));
        } catch {
          currentJobs = [];
        }
      }
      currentJobs.unshift(job);
      fs.writeFileSync(this.memoryPath, JSON.stringify(currentJobs.slice(0, 50), null, 2), 'utf8');
      console.log(`[ScrapeGraph] Scraping job ${job.jobId} recorded inside solid-state memory.`);
    } catch (e: any) {
      console.error(`[ScrapeGraph] Saving job to memory failed: ${e.message}`);
    }
  }
}

if (require.main === module) {
  const scraper = new ScrapeGraphScraper();
  // Quick CLI test run on startup
  scraper.scrape('https://aksharaworld.in', 'Extract company services, prices, and contact information.')
    .then(res => console.log('[ScrapeGraph Test Output]:', res))
    .catch(err => console.error('[ScrapeGraph Test Failed]:', err));
}
