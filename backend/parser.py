import io
import re
from typing import List, Dict, Any

TARGET_GENES = {"CYP2D6", "CYP2C19", "CYP2C9", "SLCO1B1", "TPMT", "DPYD"}


def parse_vcf_content(content: bytes) -> List[Dict[str, Any]]:
    """Parse VCF file content and extract pharmacogenomic variants."""
    variants = []
    
    try:
        text = content.decode("utf-8", errors="replace")
        lines = text.splitlines()
        
        header_cols = []
        for line in lines:
            if line.startswith("##"):
                continue
            elif line.startswith("#CHROM"):
                header_cols = line.lstrip("#").split("\t")
                continue
            
            if not line.strip():
                continue
            
            parts = line.split("\t")
            if len(parts) < 8:
                continue
            
            chrom = parts[0]
            pos = parts[1]
            variant_id = parts[2] if parts[2] != "." else f"chr{chrom}:{pos}"
            ref = parts[3]
            alt = parts[4]
            info_str = parts[7] if len(parts) > 7 else ""
            
            # Parse INFO field
            info = {}
            for field in info_str.split(";"):
                if "=" in field:
                    k, v = field.split("=", 1)
                    info[k] = v
                else:
                    info[field] = True
            
            gene = info.get("GENE", "")
            rsid = info.get("RSID", variant_id)
            star_allele = info.get("STAR", "")
            
            # Try to infer gene from variant ID or chrom position if not in INFO
            if not gene:
                gene = _infer_gene_from_rsid(rsid)
            
            if gene in TARGET_GENES:
                variants.append({
                    "chrom": chrom,
                    "pos": pos,
                    "id": rsid,
                    "ref": ref,
                    "alt": alt,
                    "gene": gene,
                    "star_allele": star_allele,
                    "info": info
                })
    
    except Exception as e:
        pass  # Return empty list on parse failure
    
    return variants


def _infer_gene_from_rsid(rsid: str) -> str:
    """Map known rsIDs to pharmacogenomic genes."""
    RSID_GENE_MAP = {
        "rs3892097": "CYP2D6",
        "rs1065852": "CYP2D6",
        "rs28371706": "CYP2D6",
        "rs16947": "CYP2D6",
        "rs28371725": "CYP2D6",
        "rs762551": "CYP2D6",
        "rs4986893": "CYP2C19",
        "rs4244285": "CYP2C19",
        "rs12248560": "CYP2C19",
        "rs28399504": "CYP2C19",
        "rs1799853": "CYP2C9",
        "rs1057910": "CYP2C9",
        "rs28371686": "CYP2C9",
        "rs4149056": "SLCO1B1",
        "rs2306283": "SLCO1B1",
        "rs1800460": "TPMT",
        "rs1142345": "TPMT",
        "rs1800584": "TPMT",
        "rs3918290": "DPYD",
        "rs55886062": "DPYD",
        "rs67376798": "DPYD",
        "rs75017182": "DPYD",
    }
    return RSID_GENE_MAP.get(rsid, "")


def is_valid_vcf(content: bytes) -> bool:
    """Basic VCF validation."""
    try:
        text = content.decode("utf-8", errors="replace")
        lines = [l for l in text.splitlines() if l.strip()]
        if not lines:
            return False
        # Should have at least one header line
        has_header = any(l.startswith("#") for l in lines[:20])
        return has_header
    except Exception:
        return False
