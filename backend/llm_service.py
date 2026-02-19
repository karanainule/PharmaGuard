import os
import json
import httpx
from typing import Dict, Any

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

LLM_PROMPT_TEMPLATE = """You are a clinical pharmacogenomics expert AI assistant.

Analyze the following pharmacogenomic data and provide a structured clinical explanation.

Patient Data:
- Drug: {drug}
- Gene: {gene}
- Variant ID: {variant_id}
- Diplotype: {diplotype}
- Phenotype: {phenotype}
- Predicted Risk: {risk_label}
- Severity: {severity}

Respond ONLY with valid JSON in this exact structure (no markdown, no preamble):
{{
  "summary": "2-3 sentence clinical summary of the drug-gene interaction and what it means for this patient",
  "mechanism": "Explanation of the molecular/enzymatic mechanism behind this interaction",
  "clinical_impact": "Specific clinical implications and what healthcare providers should watch for"
}}"""


async def get_llm_explanation(
    drug: str,
    gene: str,
    variant_id: str,
    diplotype: str,
    phenotype: str,
    risk_label: str,
    severity: str
) -> Dict[str, str]:
    
    prompt = LLM_PROMPT_TEMPLATE.format(
        drug=drug,
        gene=gene,
        variant_id=variant_id,
        diplotype=diplotype,
        phenotype=phenotype,
        risk_label=risk_label,
        severity=severity
    )
    
    # Try OpenAI first
    if OPENAI_API_KEY:
        result = await _call_openai(prompt)
        if result:
            return result
    
    # Try Gemini
    if GEMINI_API_KEY:
        result = await _call_gemini(prompt)
        if result:
            return result
    
    # Fallback to deterministic explanation
    return _generate_fallback_explanation(drug, gene, diplotype, phenotype, risk_label)


async def _call_openai(prompt: str) -> Dict[str, str] | None:
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 500
                }
            )
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)
    except Exception:
        return None


async def _call_gemini(prompt: str) -> Dict[str, str] | None:
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 500}
                }
            )
            data = response.json()
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            # Strip markdown if present
            content = content.strip().lstrip("```json").rstrip("```").strip()
            return json.loads(content)
    except Exception:
        return None


def _generate_fallback_explanation(
    drug: str, gene: str, diplotype: str, phenotype: str, risk_label: str
) -> Dict[str, str]:
    
    FALLBACKS = {
        ("CODEINE", "URM"): {
            "summary": f"This patient is an Ultra-Rapid Metabolizer (URM) of CYP2D6 with diplotype {diplotype}. Codeine is rapidly converted to morphine, leading to dangerously high opioid plasma levels.",
            "mechanism": "CYP2D6 gene duplication increases enzymatic activity, converting codeine to morphine at an accelerated rate, overwhelming normal clearance mechanisms.",
            "clinical_impact": "Risk of life-threatening respiratory depression. Avoid codeine and tramadol. Use non-opioid analgesics or carefully titrated opioids not metabolized by CYP2D6."
        },
        ("CODEINE", "PM"): {
            "summary": f"This patient is a Poor Metabolizer (PM) of CYP2D6 with diplotype {diplotype}. Codeine cannot be converted to its active form (morphine), rendering it ineffective.",
            "mechanism": "Loss-of-function CYP2D6 variants prevent O-demethylation of codeine to morphine. No analgesic effect is achieved at standard doses.",
            "clinical_impact": "Codeine will not provide pain relief. Consider alternative analgesics such as NSAIDs, acetaminophen, or opioids not requiring CYP2D6 activation."
        },
        ("WARFARIN", "PM"): {
            "summary": f"This patient has reduced CYP2C9 metabolic capacity with diplotype {diplotype}. Warfarin will accumulate to toxic levels, significantly increasing hemorrhage risk.",
            "mechanism": "CYP2C9 loss-of-function variants reduce S-warfarin hydroxylation, dramatically extending the drug's half-life and anticoagulant effect.",
            "clinical_impact": "Initiate warfarin at 20-40% of standard dose. Perform INR every 3-5 days during initiation. Target INR 2.0-3.0 with close monitoring for signs of bleeding."
        },
        ("AZATHIOPRINE", "PM"): {
            "summary": f"Critical TPMT deficiency detected ({diplotype}). Azathioprine will cause severe, potentially fatal hematopoietic toxicity.",
            "mechanism": "TPMT inactivates thiopurine metabolites. PM status leads to accumulation of cytotoxic 6-thioguanine nucleotides in hematopoietic tissue.",
            "clinical_impact": "Azathioprine is contraindicated. If thiopurine therapy is essential, use 10% of standard dose with intensive CBC monitoring, or switch to a non-thiopurine immunosuppressant."
        },
        ("FLUOROURACIL", "PM"): {
            "summary": f"Severe DPYD deficiency identified ({diplotype}). Standard 5-FU dosing carries life-threatening toxicity risk in this patient.",
            "mechanism": "DPYD enzyme degrades >80% of administered 5-FU. PM status leads to massive drug accumulation causing systemic toxicity.",
            "clinical_impact": "Reduce 5-FU dose by ≥50% or avoid entirely. Consider capecitabine dose reduction. Pre-treatment DPYD genotyping is now standard of care in many guidelines."
        },
    }
    
    # Try specific fallback first
    key = (drug, phenotype.split()[0] if phenotype else "NM")
    # Map phenotype label to code
    phenotype_code_map = {"Poor Metabolizer": "PM", "Intermediate Metabolizer": "IM", 
                          "Normal Metabolizer": "NM", "Rapid Metabolizer": "RM", 
                          "Ultra-Rapid Metabolizer": "URM"}
    pcode = phenotype_code_map.get(phenotype, "NM")
    key = (drug, pcode)
    
    if key in FALLBACKS:
        return FALLBACKS[key]
    
    return {
        "summary": f"Pharmacogenomic analysis identified {gene} diplotype {diplotype} ({phenotype}) in this patient. Risk assessment for {drug}: {risk_label}.",
        "mechanism": f"{gene} enzyme activity is altered by the detected variant, affecting {drug} metabolism and/or transport in the body.",
        "clinical_impact": f"Risk classification: {risk_label}. Healthcare providers should review dosing guidelines and consider therapeutic drug monitoring where applicable."
    }
