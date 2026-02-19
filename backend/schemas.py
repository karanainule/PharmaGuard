from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class RiskAssessment(BaseModel):
    risk_label: str
    confidence_score: float
    severity: str


class PharmacogenomicProfile(BaseModel):
    primary_gene: str
    diplotype: str
    phenotype: str
    detected_variants: List[dict]


class ClinicalRecommendation(BaseModel):
    action: str
    notes: str


class LLMExplanation(BaseModel):
    summary: str
    mechanism: str
    clinical_impact: str


class QualityMetrics(BaseModel):
    vcf_parsing_success: bool


class AnalysisResult(BaseModel):
    patient_id: str
    drug: str
    timestamp: str
    risk_assessment: RiskAssessment
    pharmacogenomic_profile: PharmacogenomicProfile
    clinical_recommendation: ClinicalRecommendation
    llm_generated_explanation: LLMExplanation
    quality_metrics: QualityMetrics


class MultiDrugResult(BaseModel):
    patient_id: str
    timestamp: str
    results: List[AnalysisResult]
    overall_risk_summary: str
