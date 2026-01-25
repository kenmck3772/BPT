
"""
BRAHAN_SEER FORENSIC TOOLKIT: DDR_METADATA_SCRAPER
Audits PDF/CSV artifacts for 'smoothing' trails and timestamp discordance.
"Metadata is the digital fingerprint of the lie."
"""

import time
import hashlib
import json

class DDRForensicScraper:
    def __init__(self):
        self.suspicious_producers = ["Quartz PDF Context", "Microsoft Excel Export", "Adobe PDF Library 15.0"]
        self.veto_level = 7

    def calculate_entropy(self, data_series):
        """Detects 'smoothing' by analyzing local variance. Real data is noisy."""
        if len(data_series) < 10: return 1.0
        diffs = np.diff(data_series)
        zero_diff_count = sum(1 for d in diffs if d == 0)
        # High zero-diff ratio in high-frequency logs (like GR) suggests copy-pasting
        return 1.0 - (zero_diff_count / len(diffs))

    def audit_metadata(self, artifact_path, metadata_dict):
        """
        Cross-references creation dates against report dates.
        Identifies if reports were 'backfilled' months later.
        """
        print(f"\n>>> AUDITING_ARTIFACT: {artifact_path}")
        time.sleep(0.8)
        
        creation_date = metadata_dict.get("creation_date")
        report_date = metadata_dict.get("report_date")
        producer = metadata_dict.get("producer", "UNKNOWN")
        
        flags = []
        
        # 1. Check for 'Report Backfilling'
        if creation_date and report_date:
            delta_days = (creation_date - report_date).days
            if delta_days > 7:
                flags.append(f"BACKFILL_DETECTION: Created {delta_days} days after report date.")
        
        # 2. Check for suspicious tools
        if producer in self.suspicious_producers:
            flags.append(f"NON_STANDARD_INGEST: Produced via {producer}. Potential manual override.")
            
        # 3. Check for Editing Trails
        if metadata_dict.get("mod_count", 0) > 3:
            flags.append(f"EDIT_TRAIL_VERBOSE: {metadata_dict['mod_count']} revisions detected. High potential for 'smoothing'.")

        return {
            "artifact": artifact_path,
            "integrity_score": max(0, 100 - (len(flags) * 25)),
            "flags": flags,
            "status": "VETO_REQUIRED" if flags else "CLEAN"
        }

if __name__ == "__main__":
    scraper = DDRForensicScraper()
    # Mock audit of a suspicious report
    mock_meta = {
        "report_date": "2023-01-15",
        "creation_date": "2023-04-20",
        "producer": "Quartz PDF Context",
        "mod_count": 5
    }
    
    # Simple date handling stub
    from datetime import datetime
    mock_meta["report_date"] = datetime.strptime(mock_meta["report_date"], "%Y-%m-%d")
    mock_meta["creation_date"] = datetime.strptime(mock_meta["creation_date"], "%Y-%m-%d")
    
    report = scraper.audit_metadata("THISTLE_A7_FINAL_REPORT.pdf", mock_meta)
    print(json.dumps(report, indent=2))
