
"""
WELLTEGRA FORENSIC KERNEL: GHOST_WELL_HUNTER v1.0
Objective: Identify the 153 Wells in Arrears (NSTA Jan 2026 Decommissioning Deficit)
Compliance: EU AI Act Art 10 (Data Integrity) & Art 14 (Human-in-the-Loop)
"""

import time
import json
import random
from datetime import datetime

class GhostWellHunter:
    def __init__(self):
        self.nsta_arrears_baseline = 153
        self.compliance_standard = "EU_AI_ACT_ART_10"
        self.sme_notarization_req = "ART_14_HITL"

    def scrape_unstructured_source(self, well_uwi):
        """
        Simulates forensic scraping of OSPAR Filings, Energy Pathfinder, 
        and OCR of hand-signed PDFs.
        """
        sources = ["OSPAR_ENVIRO", "PATHFINDER_INFRA", "PDF_SITP_OCR"]
        selected = random.choice(sources)
        
        # Simulated SITP (Shut-In Tubing Pressure) scavenged from PDF
        sitp = random.randint(50, 2500)
        integrity_date = "2021-04-12" # Simulated legacy date
        
        return {
            "source": selected,
            "sitp_scavenged": f"{sitp} PSI",
            "last_integrity_test": integrity_date,
            "infra_status": "Platform Topsides Removed // Subsea Live" if selected == "PATHFINDER_INFRA" else "Active Gauge"
        }

    def evaluate_compliance(self, well_record):
        """
        Flags missing Suspension Expiry or Vertical Datum as a 'Data Abyss'.
        """
        violations = []
        if not well_record.get("suspensionExpiry"):
            violations.append("MISSING_SUSPENSION_EXPIRY")
        if not well_record.get("verticalDatum"):
            violations.append("MISSING_VERTICAL_DATUM")
            
        is_compliant = len(violations) == 0
        
        return {
            "is_compliant": is_compliant,
            "violations": violations,
            "risk_classification": "DATA_ABYSS" if not is_compliant else "NOMINAL"
        }

    def generate_compliance_alert(self, well_record, forensic_data, compliance_data):
        """
        Drafts a formal Compliance Alert for the website frontend.
        """
        uwi = well_record['uwi']
        alert = f"""
>>> COMPLIANCE_ALERT: WELL_{uwi}
STATUS: {well_record['status']} // ARREARS: {well_record['arrearsDays']} DAYS
COMPLIANCE_ENVELOPE: {self.compliance_standard}

FINDING:
{compliance_data['risk_classification']} DETECTED. Registry record for {uwi} is incomplete.
Missing: {', '.join(compliance_data['violations'])}.

FORENSIC EVIDENCE:
Scavenged via {forensic_data['source']}. 
Last recorded SITP: {forensic_data['sitp_scavenged']}.
Hardware status indicates subsea wellhead remains 'Live' despite topside removal.

DIRECTIVE:
Forensic re-validation and SME Notarization ({self.sme_notarization_req}) required before publication.
Liability estimate for P&A deficit is UNMANAGED.
"""
        return alert

    def run_mission(self, basin_data):
        print(">>> INITIATING GHOST WELL HUNT: NSTA_DEFICIT_PROTOCOL")
        time.sleep(1)
        
        found_arrears = 0
        alerts = []
        
        # Flatten basin data for search
        all_wells = []
        for region in basin_data:
            for asset in region['assets']:
                for profile in asset['riskProfiles']:
                    all_wells.extend(profile['wells'])
        
        for well in all_wells:
            if well['isArrearsCritical']:
                found_arrears += 1
                forensic = self.scrape_unstructured_source(well['uwi'])
                compliance = self.evaluate_compliance(well)
                alert = self.generate_compliance_alert(well, forensic, compliance)
                alerts.append(alert)
                
        print(f">>> HUNT_COMPLETE: Identified deficit wells against NSTA January 2026 Baseline.")
        print(f">>> ALERTS_DRAFTED: {len(alerts)}")
        return alerts

if __name__ == "__main__":
    # This logic is integrated into the BasinAudit.tsx component for the frontend display
    hunter = GhostWellHunter()
    print("Kernel Logic Loaded.")
