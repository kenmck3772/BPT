
import { chromium, Browser, Page } from '@playwright/test';
import { getAgentDecision } from '../services/geminiService';

export async function runDeepAgent(startUrl: string, goal: string) {
  console.log(`🚀 Deep Agent Launching... Target: ${startUrl}`);
  
  let browser: Browser | null = null;
  let page: Page | null = null;
  const logs: string[] = [];

  try {
    // Launching chromium for automation
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    page = await context.newPage();

    // 1. Go to Start URL
    await page.goto(startUrl, { waitUntil: 'domcontentloaded' });
    
    // MAX STEPS prevents infinite loops
    const MAX_STEPS = 15;

    for (let step = 1; step <= MAX_STEPS; step++) {
      console.log(`\n--- Step ${step} ---`);
      
      // A. OBSERVE (Take Screenshot)
      const screenshotBuffer = await page.screenshot({ fullPage: false });
      const screenshotBase64 = screenshotBuffer.toString('base64');

      // B. THINK (Ask Gemini)
      console.log("Thinking...");
      const decision = await getAgentDecision(screenshotBase64, goal, logs);
      
      console.log(`🧠 Thought: ${decision.thought}`);
      console.log(`👉 Action: ${decision.action} on ${decision.selector || 'N/A'}`);
      
      logs.push(`Step ${step}: ${decision.thought} -> ${decision.action}`);

      // C. TERMINATION CHECK
      if (decision.status === 'success') {
        console.log("✅ MISSION ACCOMPLISHED");
        return { status: 'success', logs };
      }

      if (decision.status === 'failed' || decision.action === 'failed') {
        console.log("❌ MISSION FAILED");
        return { status: 'failed', logs };
      }

      // D. ACT (Execute Playwright Command)
      try {
        if (decision.action === 'click') {
          await page.waitForSelector(decision.selector, { timeout: 5000 });
          await page.click(decision.selector);
        } 
        else if (decision.action === 'type') {
          await page.waitForSelector(decision.selector, { timeout: 5000 });
          await page.fill(decision.selector, decision.value || "");
        } 
        else if (decision.action === 'scroll') {
          await page.mouse.wheel(0, 500);
        }
        else if (decision.action === 'wait') {
          await page.waitForTimeout(2000);
        }
        else if (decision.action === 'goto') {
            await page.goto(decision.value || startUrl);
        }

        // Wait a moment for the UI to react to the action
        await page.waitForTimeout(2000);

      } catch (err: any) {
        console.warn(`⚠️ Interaction Error: ${err.message}`);
        logs.push(`Error on step ${step}: Could not interact with ${decision.selector}.`);
      }
    }
    
    return { status: 'timeout', logs };

  } catch (error) {
    console.error("Critical Engine Failure:", error);
    return { status: 'error', logs };
  } finally {
    if (browser) await browser.close();
  }
}
