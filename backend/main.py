from dotenv import load_dotenv
load_dotenv()

import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from parser import parse_vcf_content, is_valid_vcf
from predictor import predict_drug_risk, DRUG_GENE_MAP
from llm_service import get_llm_explanation
from schemas import AnalysisResult, MultiDrugResult

app = FastAPI(
    title="PharmaGuard API",
    description="Pharmacogenomic Risk Prediction System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
SUPPORTED_DRUGS = list(DRUG_GENE_MAP.keys())


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "PharmaGuard API",
        "version": "1.0.0",
        "supported_drugs": SUPPORTED_DRUGS,
        "supported_genes": list(set(DRUG_GENE_MAP.values())),
        "llm_available": bool(os.environ.get("OPENAI_API_KEY") or os.environ.get("GEMINI_API_KEY")),
    }


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    drugs: str = Form(...),  # comma-separated drug names
    patient_id: Optional[str] = Form(None)
):
    # Validate file
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File size exceeds 5MB limit")
    
    if not file.filename.endswith(".vcf"):
        raise HTTPException(status_code=400, detail="Only .vcf files are accepted")
    
    vcf_valid = is_valid_vcf(content)
    
    # Parse VCF
    variants = []
    if vcf_valid:
        variants = parse_vcf_content(content)
    
    # Parse drugs list
    drug_list = [d.strip().upper() for d in drugs.split(",") if d.strip()]
    invalid_drugs = [d for d in drug_list if d not in SUPPORTED_DRUGS]
    if invalid_drugs:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported drugs: {invalid_drugs}. Supported: {SUPPORTED_DRUGS}"
        )
    
    pid = patient_id or f"PATIENT_{str(uuid.uuid4())[:8].upper()}"
    timestamp = datetime.now(timezone.utc).isoformat()
    
    results = []
    
    for drug in drug_list:
        prediction = predict_drug_risk(drug, variants)
        
        # Get LLM explanation
        variant_ids = [v.get("id", "unknown") for v in prediction["gene_variants"]]
        variant_id_str = ", ".join(variant_ids) if variant_ids else "No variant detected"
        
        llm_explanation = await get_llm_explanation(
            drug=drug,
            gene=prediction["gene"],
            variant_id=variant_id_str,
            diplotype=prediction["diplotype"],
            phenotype=prediction["phenotype_label"],
            risk_label=prediction["risk_label"],
            severity=prediction["severity"]
        )
        
        result = {
            "patient_id": pid,
            "drug": drug,
            "timestamp": timestamp,
            "risk_assessment": {
                "risk_label": prediction["risk_label"],
                "confidence_score": prediction["confidence"],
                "severity": prediction["severity"]
            },
            "pharmacogenomic_profile": {
                "primary_gene": prediction["gene"],
                "diplotype": prediction["diplotype"],
                "phenotype": prediction["phenotype_label"],
                "detected_variants": prediction["gene_variants"]
            },
            "clinical_recommendation": {
                "action": prediction["action"],
                "notes": prediction["notes"]
            },
            "llm_generated_explanation": llm_explanation,
            "quality_metrics": {
                "vcf_parsing_success": vcf_valid
            }
        }
        results.append(result)
    
    # Generate overall risk summary
    risk_levels = [r["risk_assessment"]["risk_label"] for r in results]
    if "Toxic" in risk_levels or any(r["risk_assessment"]["severity"] == "critical" for r in results):
        overall = "HIGH RISK: Critical drug-gene interactions detected. Immediate clinical review required."
    elif "Adjust Dosage" in risk_levels or "Ineffective" in risk_levels:
        overall = "MODERATE RISK: Dose adjustments or drug substitutions recommended."
    else:
        overall = "LOW RISK: No significant drug-gene interactions detected. Standard therapy appropriate."
    
    if len(results) == 1:
        return JSONResponse(content=results[0])
    
    return JSONResponse(content={
        "patient_id": pid,
        "timestamp": timestamp,
        "results": results,
        "overall_risk_summary": overall
    })


@app.post("/analyze/demo")
async def analyze_demo(drugs: str = Form(...)):
    """Demo endpoint with synthetic VCF data for testing."""
    
    # Simulate some interesting variants
    synthetic_variants = [
        {"chrom": "22", "pos": "42526694", "id": "rs3892097", "ref": "C", "alt": "T",
         "gene": "CYP2D6", "star_allele": "*4", "info": {"GENE": "CYP2D6", "RSID": "rs3892097"}},
        {"chrom": "10", "pos": "96521657", "id": "rs4244285", "ref": "G", "alt": "A",
         "gene": "CYP2C19", "star_allele": "*2", "info": {"GENE": "CYP2C19", "RSID": "rs4244285"}},
        {"chrom": "10", "pos": "96741053", "id": "rs1057910", "ref": "A", "alt": "C",
         "gene": "CYP2C9", "star_allele": "*3", "info": {"GENE": "CYP2C9", "RSID": "rs1057910"}},
        {"chrom": "12", "pos": "21331549", "id": "rs4149056", "ref": "T", "alt": "C",
         "gene": "SLCO1B1", "star_allele": "*5", "info": {"GENE": "SLCO1B1", "RSID": "rs4149056"}},
    ]
    
    drug_list = [d.strip().upper() for d in drugs.split(",") if d.strip()]
    invalid_drugs = [d for d in drug_list if d not in SUPPORTED_DRUGS]
    if invalid_drugs:
        raise HTTPException(status_code=400, detail=f"Unsupported drugs: {invalid_drugs}")
    
    pid = f"DEMO_{str(uuid.uuid4())[:8].upper()}"
    timestamp = datetime.now(timezone.utc).isoformat()
    results = []
    
    for drug in drug_list:
        prediction = predict_drug_risk(drug, synthetic_variants)
        variant_id_str = ", ".join([v.get("id", "unknown") for v in prediction["gene_variants"]]) or "No variant detected"
        
        llm_explanation = await get_llm_explanation(
            drug=drug, gene=prediction["gene"],
            variant_id=variant_id_str, diplotype=prediction["diplotype"],
            phenotype=prediction["phenotype_label"],
            risk_label=prediction["risk_label"], severity=prediction["severity"]
        )
        
        results.append({
            "patient_id": pid, "drug": drug, "timestamp": timestamp,
            "risk_assessment": {
                "risk_label": prediction["risk_label"],
                "confidence_score": prediction["confidence"],
                "severity": prediction["severity"]
            },
            "pharmacogenomic_profile": {
                "primary_gene": prediction["gene"], "diplotype": prediction["diplotype"],
                "phenotype": prediction["phenotype_label"],
                "detected_variants": prediction["gene_variants"]
            },
            "clinical_recommendation": {"action": prediction["action"], "notes": prediction["notes"]},
            "llm_generated_explanation": llm_explanation,
            "quality_metrics": {"vcf_parsing_success": True}
        })
    
    risk_levels = [r["risk_assessment"]["risk_label"] for r in results]
    if "Toxic" in risk_levels:
        overall = "HIGH RISK: Critical drug-gene interactions detected. Immediate clinical review required."
    elif "Adjust Dosage" in risk_levels or "Ineffective" in risk_levels:
        overall = "MODERATE RISK: Dose adjustments or drug substitutions recommended."
    else:
        overall = "LOW RISK: No significant drug-gene interactions detected."
    
    return JSONResponse(content={
        "patient_id": pid, "timestamp": timestamp,
        "results": results, "overall_risk_summary": overall
    })
