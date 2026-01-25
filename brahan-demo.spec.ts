
import { test, expect } from '@playwright/test';

/**
 * BRAHAN PERSONAL TERMINAL: EXECUTIVE FORENSIC SUITE
 * This suite automates the identification of "The Ignorance Tax" 
 * and the generation of a Board-Level Fiscal Veto.
 */

test.describe('Sovereign Fiscal Veto Workflow', () => {

  test.beforeEach(async ({ page }) => {
    // Access the Terminal
    await page.goto('http://localhost:3000');
    await expect(page.getByText('BRAHAN_v88')).toBeVisible();
  });

  test('Execute Commercial Veto for Well D-03', async ({ page }) => {
    // 1. Navigate to Chemistry Forensics Node
    await page.click('button:has-text("Chem_Autopsy")');
    await expect(page.getByText('NODE: PRODUCTION_CHEMISTRY')).toBeVisible();

    // 2. Perform Diagnostic Autopsy
    // Verify waveform telemetry is active
    await expect(page.getByText('Pressure_Waveform_Telemetry')).toBeVisible();
    await page.click('button:has-text("Execute_Forensic_Autopsy")');
    
    // Wait for Gemini to synthesize the Ratchet Effect evidence
    await expect(page.getByText('PROCESSING')).toBeVisible();
    await expect(page.getByText('Technical_Forensic_Memo')).toBeVisible();
    // Validate that the AI identified the scale kinetics
    await expect(page.getByText('Barium Sulfate', { exact: false })).toBeVisible({ timeout: 15000 });

    // 3. Trigger Commercial Veto Logic
    await page.click('button:has-text("Commercial_Veto")');
    await expect(page.getByText('The_Ignorance_Tax: D-03_Intervention')).toBeVisible();

    // Verify Ledger Values match the forensic audit data
    await expect(page.getByText('£7,200,000')).toBeVisible(); // Option A exposure
    await expect(page.getByText('£55,000')).toBeVisible();   // Option B exposure

    // Execute the Audit
    await page.click('button:has-text("Execute_Commercial_Audit")');
    
    // Verify Board Directive Output
    await expect(page.getByText('BOARD_FISCAL_DIRECTIVE')).toBeVisible();
    await expect(page.getByText('£7,145,000')).toBeVisible();
    
    // Check for predatory financial language requirement
    await expect(page.getByText('fiduciary duty', { exact: false })).toBeVisible({ timeout: 15000 });

    // 4. Secure Evidence to Sovereign Vault
    await page.click('button:has-text("Secure_Veto_to_Vault")');
    await expect(page.getByText('ARCHIVING_DIRECTIVE...')).toBeVisible();

    // 5. Verify Archival in Vault Node
    await page.click('button:has-text("Sovereign_Vault")');
    await expect(page.getByText('Encrypted_Asset_Storage')).toBeVisible();
    
    // Find the commercial veto in the archive list
    const vaultItem = page.getByText('Commercial_Veto: D-03_Ignorance_Tax_Audit');
    await expect(vaultItem).toBeVisible();
    await vaultItem.click();

    // Verify detailed metrics in the Vault Detail Viewer
    await expect(page.getByText('$7.15M')).toBeVisible(); // Rounded value in vault view
    await expect(page.getByText('CRITICAL')).toBeVisible();
    await expect(page.getByText('FIDUCIARY_DUTY_WARNING', { exact: false })).toBeHidden(); // Warning bar is in module, check summary instead
    await expect(page.getByText('financial negligence', { exact: false })).toBeVisible();
  });

  test('Verify Data Archeology Subsidence Veto', async ({ page }) => {
    // Navigate to Data Archeology
    await page.click('button:has-text("Data_Archeology")');
    await expect(page.getByText('NODE: DATA_ARCHEOLOGY')).toBeVisible();

    // Input Artifact Manifest
    await page.fill('textarea >> nth=1', 'WELL: T-09\n1978_LAS_SURVEY\nGEOMECHANICAL_SUBSIDENCE_DATA');
    
    // Execute Triangulation
    await page.click('button:has-text("Perform_Forensic_Triangulation")');
    
    // Verify specific geomechanical corrections
    await expect(page.getByText('4.8M OFFSET APPLIED')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('£12.5M')).toBeVisible();
    
    // Secure to Vault
    await page.click('button:has-text("Secure_Archeology_Composite")');
    
    // Final check in Vault
    await page.click('button:has-text("Sovereign_Vault")');
    await expect(page.getByText('Forensic_Archeology_Audit: Block 3/3')).toBeVisible();
  });

});
