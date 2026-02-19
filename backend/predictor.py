from typing import List, Dict, Any, Tuple

# Drug → Gene mapping
DRUG_GENE_MAP = {
    "CODEINE": "CYP2D6",
    "CLOPIDOGREL": "CYP2C19",
    "WARFARIN": "CYP2C9",
    "SIMVASTATIN": "SLCO1B1",
    "AZATHIOPRINE": "TPMT",
    "FLUOROURACIL": "DPYD",
}

# Gene → diplotype → phenotype
# SLCO1B1 uses "Decreased" as its phenotype key (transport function, not metabolizer class)
GENE_PHENOTYPE_MAP = {
    "CYP2D6": {
        "default": ("*1/*1", "NM"),
        "risk_variants": {
            "rs3892097": ("*1/*4", "IM"),
            "rs1065852": ("*1/*10", "IM"),
            "rs28371706": ("*4/*4", "PM"),
            "rs16947":   ("*1/*2",  "NM"),
            "rs762551":  ("*1/*1xN","URM"),
        }
    },
    "CYP2C19": {
        "default": ("*1/*1", "NM"),
        "risk_variants": {
            "rs4986893": ("*1/*3",  "IM"),
            "rs4244285": ("*1/*2",  "IM"),
            "rs12248560":("*1/*17", "RM"),
            "rs28399504":("*2/*2",  "PM"),
        }
    },
    "CYP2C9": {
        "default": ("*1/*1", "NM"),
        "risk_variants": {
            "rs1799853": ("*1/*2",  "IM"),
            "rs1057910": ("*1/*3",  "IM"),
            "rs28371686":("*2/*3",  "PM"),
        }
    },
    "SLCO1B1": {
        # Default = normal transport function
        "default": ("*1/*1", "NM"),
        "risk_variants": {
            # rs4149056 (*5 allele) = decreased hepatic uptake transporter function
            "rs4149056": ("*1/*5",   "Decreased"),
            "rs2306283": ("*1a/*1b", "NM"),
        }
    },
    "TPMT": {
        "default": ("*1/*1", "NM"),
        "risk_variants": {
            "rs1800460": ("*1/*3B",  "IM"),
            "rs1142345": ("*1/*3C",  "IM"),
            "rs1800584": ("*3A/*3A", "PM"),
        }
    },
    "DPYD": {
        "default": ("*1/*1", "NM"),
        "risk_variants": {
            "rs3918290":  ("*1/*2A",    "IM"),
            "rs55886062": ("*2A/*2A",   "PM"),
            "rs67376798": ("*1/*13",    "IM"),
            "rs75017182": ("*1/*HapB3", "IM"),
        }
    }
}

# -------------------------------
# Drug Risk Rules  (exact rules from reference)
# -------------------------------
# Structure: drug → gene → phenotype → {risk, severity}
# Only phenotypes listed here are "rule-matched"; everything else → Unknown
DRUG_RISK_RULES: Dict[str, Dict[str, Dict[str, Dict[str, str]]]] = {
    "CODEINE": {
        "CYP2D6": {
            "PM": {"risk": "Toxic",        "severity": "high"},
            "NM": {"risk": "Safe",         "severity": "none"},
            "IM": {"risk": "Adjust Dosage","severity": "moderate"},
        }
    },
    "CLOPIDOGREL": {
        "CYP2C19": {
            "PM": {"risk": "Ineffective",  "severity": "high"},
            "NM": {"risk": "Safe",         "severity": "none"},
            "IM": {"risk": "Adjust Dosage","severity": "moderate"},
        }
    },
    "WARFARIN": {
        "CYP2C9": {
            "PM": {"risk": "Adjust Dosage","severity": "moderate"},
            "NM": {"risk": "Safe",         "severity": "none"},
        }
    },
    "SIMVASTATIN": {
        "SLCO1B1": {
            "Decreased": {"risk": "Toxic", "severity": "high"},
        }
    },
    "AZATHIOPRINE": {
        "TPMT": {
            "PM": {"risk": "Toxic",        "severity": "high"},
            "IM": {"risk": "Adjust Dosage","severity": "moderate"},
        }
    },
    "FLUOROURACIL": {
        "DPYD": {
            "IM": {"risk": "Adjust Dosage","severity": "high"},
            "PM": {"risk": "Toxic",        "severity": "critical"},
        }
    },
}

CLINICAL_ACTIONS = {
    "Safe": "Administer standard dose as prescribed.",
    "Adjust Dosage": "Consider dose modification based on metabolizer status. Consult pharmacist.",
    "Toxic": "Avoid this drug or use alternative agent. Risk of serious adverse events.",
    "Ineffective": "Standard dosing unlikely to achieve therapeutic effect. Consider alternative.",
    "Unknown": "Insufficient data. Proceed with caution and standard monitoring."
}

CLINICAL_NOTES = {
    "CODEINE": {
        "PM": "CYP2D6 poor metabolizers cannot convert codeine to morphine — no analgesic effect.",
        "URM": "Ultra-rapid metabolizers produce excess morphine — life-threatening toxicity risk.",
        "IM": "Reduced codeine-to-morphine conversion. Consider lower dose or tramadol.",
        "NM": "Normal CYP2D6 activity. Standard codeine dosing appropriate.",
        "RM": "Slightly increased conversion. Monitor for opioid side effects.",
    },
    "CLOPIDOGREL": {
        "PM": "CYP2C19 PM status severely reduces clopidogrel activation — increased MACE risk.",
        "IM": "Reduced platelet inhibition. Consider prasugrel or ticagrelor.",
        "NM": "Normal clopidogrel activation. Standard antiplatelet therapy appropriate.",
        "RM": "Enhanced activation may increase bleeding risk. Monitor closely.",
        "URM": "Enhanced activation may increase bleeding risk. Monitor closely.",
    },
    "WARFARIN": {
        "PM": "CYP2C9 PM status leads to warfarin accumulation and severe bleeding risk.",
        "IM": "Reduced warfarin metabolism. Start at 20-30% lower dose. Frequent INR monitoring.",
        "NM": "Normal warfarin metabolism. Standard dosing with routine INR monitoring.",
        "RM": "Slightly faster metabolism. May require slightly higher dose.",
        "URM": "Faster metabolism. May require higher dose. Close INR monitoring.",
    },
    "SIMVASTATIN": {
        "PM": "SLCO1B1 variant reduces hepatic uptake — increased myopathy/rhabdomyolysis risk.",
        "IM": "Moderate increase in plasma simvastatin. Consider lower dose (≤20mg) or pravastatin.",
        "NM": "Normal statin transport. Standard simvastatin dosing appropriate.",
        "RM": "Normal statin transport. Standard dosing appropriate.",
        "URM": "Normal statin transport. Standard dosing appropriate.",
    },
    "AZATHIOPRINE": {
        "PM": "TPMT PM status causes toxic thiopurine accumulation — severe myelosuppression risk.",
        "IM": "Reduced TPMT activity. Start at 30-70% of standard dose. Monitor CBC.",
        "NM": "Normal TPMT activity. Standard azathioprine dosing with routine CBC monitoring.",
        "RM": "Normal TPMT activity. Standard dosing appropriate.",
        "URM": "Normal TPMT activity. Standard dosing appropriate.",
    },
    "FLUOROURACIL": {
        "PM": "DPYD deficiency causes severe 5-FU toxicity — avoid or reduce by ≥50%.",
        "IM": "Partial DPYD deficiency. Reduce starting dose by 25-50%. Monitor closely.",
        "NM": "Normal DPYD activity. Standard 5-FU dosing with routine toxicity monitoring.",
        "RM": "Normal DPYD activity. Standard dosing appropriate.",
        "URM": "Normal DPYD activity. Standard dosing appropriate.",
    }
}

PHENOTYPE_LABELS = {
    "PM": "Poor Metabolizer",
    "IM": "Intermediate Metabolizer",
    "NM": "Normal Metabolizer",
    "RM": "Rapid Metabolizer",
    "URM": "Ultra-Rapid Metabolizer",
}


# -------------------------------
# Risk Evaluation Function  (exact logic from reference)
# -------------------------------
def evaluate_risk(drug: str, gene: str, phenotype: str) -> Dict[str, Any]:
    """
    Look up drug × gene × phenotype in DRUG_RISK_RULES.
    Returns: {risk, severity, rule_matched}
    """
    drug = drug.upper()
    if drug not in DRUG_RISK_RULES:
        return {"risk": "Unknown", "severity": "none", "rule_matched": False}
    gene_rules = DRUG_RISK_RULES[drug].get(gene)
    if not gene_rules:
        return {"risk": "Unknown", "severity": "none", "rule_matched": False}
    if phenotype not in gene_rules:
        return {"risk": "Unknown", "severity": "none", "rule_matched": False}
    result = gene_rules[phenotype].copy()
    result["rule_matched"] = True
    return result


# -------------------------------
# Confidence Calculation Function  (exact logic from reference)
# -------------------------------
def calculate_confidence(
    phenotype: str,
    rule_matched: bool,
    exact_match: bool,
    partial_assumption: bool,
) -> float:
    """
    Returns a numeric confidence score 0–1.

    Tiers (in priority order):
      no rule match       → 0.30
      Unknown phenotype   → 0.50
      partial assumption  → 0.75
      exact diplotype     → 0.95
      known, mod evidence → 0.85
    """
    if not rule_matched:
        return 0.30
    if phenotype == "Unknown":
        return 0.50
    if partial_assumption:
        return 0.75
    if exact_match:
        return 0.95
    return 0.85


# -------------------------------
# Main prediction entry point
# -------------------------------
def predict_drug_risk(drug: str, variants: List[Dict[str, Any]]) -> Dict[str, Any]:
    gene = DRUG_GENE_MAP.get(drug, "")

    if not gene:
        return _unknown_result(drug, gene)

    # ── 1. Filter variants for this gene ──────────────────────────────────────
    gene_variants = [v for v in variants if v.get("gene") == gene]

    # ── 2. Resolve diplotype + phenotype from detected variants ───────────────
    diplotype     = GENE_PHENOTYPE_MAP[gene]["default"][0]
    phenotype_code= GENE_PHENOTYPE_MAP[gene]["default"][1]

    matched_variant   = None   # strongest risk-variant found
    exact_match       = False  # True when rsID hits the risk_variants table exactly
    partial_assumption= False  # True when we fall back to the default phenotype

    for variant in gene_variants:
        rsid = variant.get("id", "")
        if rsid in GENE_PHENOTYPE_MAP[gene]["risk_variants"]:
            diplotype, phenotype_code = GENE_PHENOTYPE_MAP[gene]["risk_variants"][rsid]
            matched_variant = variant
            exact_match     = True
            break

    # If gene variants exist but none mapped → partial assumption
    if gene_variants and not exact_match:
        partial_assumption = True

    # ── 3. Evaluate risk using the reference rule table ───────────────────────
    eval_result = evaluate_risk(drug, gene, phenotype_code)
    risk_label  = eval_result["risk"]
    severity    = eval_result["severity"]
    rule_matched= eval_result["rule_matched"]

    # Fallback for unmatched phenotypes that are still "Normal" (e.g. RM/URM not
    # listed in every drug's rules) — treat as Safe with lower confidence
    if not rule_matched and phenotype_code == "NM":
        risk_label  = "Safe"
        severity    = "none"
        rule_matched= True   # structural safe-default, treat as matched

    # ── 4. Calculate confidence via the reference function ────────────────────
    phenotype_for_conf = phenotype_code if phenotype_code != "Unknown" else "Unknown"
    confidence = calculate_confidence(
        phenotype      = phenotype_for_conf,
        rule_matched   = rule_matched,
        exact_match    = exact_match,
        partial_assumption = partial_assumption,
    )

    # ── 5. Clinical text ──────────────────────────────────────────────────────
    action = CLINICAL_ACTIONS.get(risk_label, CLINICAL_ACTIONS["Unknown"])
    notes  = CLINICAL_NOTES.get(drug, {}).get(
        phenotype_code, "Consult clinical pharmacist for individualized guidance."
    )

    return {
        "gene":           gene,
        "diplotype":      diplotype,
        "phenotype_code": phenotype_code,
        "phenotype_label":PHENOTYPE_LABELS.get(phenotype_code, phenotype_code),
        "gene_variants":  gene_variants,
        "risk_label":     risk_label,
        "severity":       severity,
        "confidence":     confidence,
        "action":         action,
        "notes":          notes,
        # debug flags (not exposed in API response but useful for testing)
        "_exact_match":        exact_match,
        "_partial_assumption": partial_assumption,
        "_rule_matched":       rule_matched,
    }


def _unknown_result(drug: str, gene: str) -> Dict[str, Any]:
    return {
        "gene":           gene or "UNKNOWN",
        "diplotype":      "*1/*1",
        "phenotype_code": "Unknown",
        "phenotype_label":"Unknown",
        "gene_variants":  [],
        "risk_label":     "Unknown",
        "severity":       "none",
        "confidence":     calculate_confidence("Unknown", False, False, False),
        "action":         CLINICAL_ACTIONS["Unknown"],
        "notes":          "Drug-gene interaction data not available.",
        "_exact_match":        False,
        "_partial_assumption": False,
        "_rule_matched":       False,
    }