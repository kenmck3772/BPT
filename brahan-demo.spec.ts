
import { test, expect } from '@playwright/test';

/**
 * BRAHAN PERSONAL TERMINAL: FORENSIC DEMONSTRATION SUITE
 * This script showcases the high-level forensic abilities of the terminal.
 */
test('Execute Full Forensic Workflow', async ({ page }) => {
  // 1. Initial Access & System Check
  await page.goto('http://localhost:3000'); // Adjust to your local dev port
  await expect(page.getByText('Brahan_Terminal_v2.5')).toBeVisible();
  
  // 2. NDR Metadata Crawling
  // We search for the Thistle A7 legacy wellbore which has known datum shifts.
  const searchInput = page.getByTestId('ndr-search-input');
  await searchInput.fill('Thistle');
  await page.getByTestId('ndr-search-submit').click();
  
  // Apply the 'Ghost-Scan' filter to identify projects with datum shift issues
  await page.getByText('Datum shift filter (GHOST_SCAN)').click();
  
  // Verify the Thistle project appears
  await expect(page.getByText('Thistle A7 Legacy')).toBeVisible();
  
  // 3. Sovereign Batch Harvesting
  // Trigger the data harvest from the NDR secure archive
  await page.getByTestId('harvest-btn-THISTLE1978well0001').click();
  
  // Wait for the simulated progress bar to complete the harvest
  await page.waitForTimeout(2000); 
  await expect(page.getByText('Harvested project THISTLE1978well0001')).toBeVisible({ timeout: 10000 });

  // 4. GHOST_SYNC: Datum Discordance Resolution
  // Switch to Ghost Sync to align legacy logs with modern sonic surveys
  await page.getByTestId('nav-ghost_sync').click();
  
  // Run the automated cross-correlation alignment
  await page.getByText('Auto_Lineup').click();
  
  // Wait for the sync engine to lock at the 14.5m offset
  await expect(page.getByText('14.500m')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Optimal_Sync_Achieved')).toBeVisible();

  // 5. TRAUMA_NODE: 3D Structural Forensics
  // Switch to 3D reconstruction mode
  await page.getByTestId('nav-trauma_node').click();
  
  // Change visualization layer to Tubing Ovality
  await page.locator('select').selectOption('OVALITY');
  
  // Click a critical log entry in the Black Box to focus the 3D scene on the anomaly
  await page.getByText('CRITICAL').first().click();
  
  // Verify the forensic targeting HUD appears
  await expect(page.getByText('FORENSIC_LOCK')).toBeVisible();

  // 6. PULSE_ANALYZER: Annulus Leak Diagnosis
  await page.getByTestId('nav-pulse_analyzer').click();
  await page.getByText('Integrity_Scavenger').click();
  
  // Scavenge the NDR for historical 10-year ghost pressure traces
  await page.getByText('Scavenge NDR for Logs').click();
  await page.waitForTimeout(1500); // Wait for scavenge animation
  
  // Verify the diagnostic status has updated based on the sawtooth slope
  await expect(page.getByText('Sovereign_Diagnosis')).toBeVisible();
  await expect(page.getByText('CRITICAL: RAPID FLOW BREACH')).toBeVisible();

  // 7. REPORTS_SCANNER: Tally Audit
  await page.getByTestId('nav-reports_scanner').click();
  
  // Audit the Daily Drilling Report (DDR) schema against the physical tally array
  await page.getByText('Audit_DDR_Schema').click();
  
  // Look for the "Discordance_Detected" flag in the joint tally
  await expect(page.getByText('Discordance_Detected')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('DISCREPANT')).toBeVisible();

  // 8. SOVEREIGN VETO: Final Audit Generation
  // Trigger the Gemini forensic architect to finalize the insight
  await expect(page.getByTestId('gemini-insight-text')).not.toBeEmpty();
  
  // Execute the final Sovereign Veto to generate the PDF Forensic Audit
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('sovereign-veto-btn').click();
  const download = await downloadPromise;
  
  // Validate the file naming convention
  expect(download.suggestedFilename()).toContain('BRAHAN_AUDIT');
  
  console.log('Forensic Demonstration Complete: Sovereign Audit Generated.');
});
