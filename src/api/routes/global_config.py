from fastapi import APIRouter, Depends
from pydantic import BaseModel

from services.global_tax import global_tax, SUPPORTED_CURRENCIES, TAX_RATES
from middleware.admin_auth import admin_only

router = APIRouter(prefix="/api/v1/global", tags=["Global & Tax"])

class UpdateProfileRequest(BaseModel):
    domain: str
    country_code: str
    currency_preference: str
    tax_id: str = ""
    company_address: str = ""

# --- Public / Client ---
@router.get("/config-options")
def get_options():
    """Countries, currencies for signup form"""
    return {
        "currencies": list(SUPPORTED_CURRENCIES.keys()),
        "currency_details": SUPPORTED_CURRENCIES,
        "default_country": os.getenv("DEFAULT_COUNTRY", "TH"),
        "default_currency": os.getenv("DEFAULT_CURRENCY", "USD"),
    }

@router.get("/profile/{domain}")
def get_profile(domain: str):
    profile = global_tax.get_customer_profile(domain)
    if not profile:
        return {
            "domain": domain,
            "country_code": os.getenv("DEFAULT_COUNTRY", "TH"),
            "currency_preference": os.getenv("DEFAULT_CURRENCY", "USD"),
            "tax_id": "",
        }
    return profile

@router.post("/profile/update")
def update_profile(req: UpdateProfileRequest):
    return global_tax.set_customer_profile(
        domain=req.domain,
        country_code=req.country_code,
        currency_preference=req.currency_preference,
        tax_id=req.tax_id,
        company_address=req.company_address,
    )

@router.get("/tax-preview/{domain}/{amount_usd}")
def tax_preview(domain: str, amount_usd: float):
    """Show estimated tax breakdown before purchase"""
    return global_tax.get_invoice_tax_breakdown(domain, amount_usd)

# --- Admin ---
@router.get("/tax/all-profiles", dependencies=[Depends(admin_only)])
def list_all_profiles():
    from pathlib import Path
    profiles = []
    for f in Path("./data/tax").glob("*.json"):
        with open(f) as fp:
            profiles.append(json.load(fp))
    return {"profiles": profiles}
