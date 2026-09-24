import os
from datetime import datetime
from pathlib import Path
import json
import logging
from typing import Dict, Optional, Tuple

logger = logging.getLogger("global_tax")

# =============================================
# TAX RULE DATABASE — VAT/GST by Country
# Source: Standard rates (2026)
# =============================================
TAX_RATES = {
    # 🇹🇭 Thailand
    "TH": {"rate": 0.07, "name": "VAT 7%", "reverse_charge": False, "digital_services_apply": True},
    # 🇦🇺 Australia
    "AU": {"rate": 0.10, "name": "GST 10%", "reverse_charge": False, "digital_services_apply": True},
    # 🇨🇦 Canada
    "CA": {"rate": 0.05, "name": "GST 5%", "reverse_charge": False, "digital_services_apply": True},
    # 🇨🇳 China
    "CN": {"rate": 0.06, "name": "VAT 6%", "reverse_charge": False, "digital_services_apply": True},
    # 🇪🇺 European Union — standard rates
    "AT": {"rate": 0.20, "name": "VAT 20%", "reverse_charge": True, "digital_services_apply": True},
    "BE": {"rate": 0.21, "name": "VAT 21%", "reverse_charge": True, "digital_services_apply": True},
    "DE": {"rate": 0.19, "name": "VAT 19%", "reverse_charge": True, "digital_services_apply": True},
    "DK": {"rate": 0.25, "name": "VAT 25%", "reverse_charge": True, "digital_services_apply": True},
    "ES": {"rate": 0.21, "name": "VAT 21%", "reverse_charge": True, "digital_services_apply": True},
    "FI": {"rate": 0.24, "name": "VAT 24%", "reverse_charge": True, "digital_services_apply": True},
    "FR": {"rate": 0.20, "name": "VAT 20%", "reverse_charge": True, "digital_services_apply": True},
    "GB": {"rate": 0.20, "name": "VAT 20%", "reverse_charge": False, "digital_services_apply": True},
    "GR": {"rate": 0.24, "name": "VAT 24%", "reverse_charge": True, "digital_services_apply": True},
    "IE": {"rate": 0.23, "name": "VAT 23%", "reverse_charge": True, "digital_services_apply": True},
    "IT": {"rate": 0.22, "name": "VAT 22%", "reverse_charge": True, "digital_services_apply": True},
    "NL": {"rate": 0.21, "name": "VAT 21%", "reverse_charge": True, "digital_services_apply": True},
    "SE": {"rate": 0.25, "name": "VAT 25%", "reverse_charge": True, "digital_services_apply": True},
    # 🇮🇳 India
    "IN": {"rate": 0.18, "name": "GST 18%", "reverse_charge": False, "digital_services_apply": True},
    # 🇯🇵 Japan
    "JP": {"rate": 0.10, "name": "Consumption Tax 10%", "reverse_charge": False, "digital_services_apply": True},
    # 🇰🇷 South Korea
    "KR": {"rate": 0.10, "name": "VAT 10%", "reverse_charge": False, "digital_services_apply": True},
    # 🇺🇸 USA — state-level sales tax handled separately
    "US": {"rate": 0.00, "name": "Sales Tax (State)", "reverse_charge": False, "digital_services_apply": False},
    # Default — no tax
    "DEFAULT": {"rate": 0.00, "name": "No Tax", "reverse_charge": False, "digital_services_apply": False},
}

# =============================================
# CURRENCY CONFIG
# =============================================
SUPPORTED_CURRENCIES = {
    "USD": {"symbol": "$", "decimals": 2, "position": "prefix"},
    "THB": {"symbol": "฿", "decimals": 2, "position": "prefix"},
    "EUR": {"symbol": "€", "decimals": 2, "position": "prefix"},
    "GBP": {"symbol": "£", "decimals": 2, "position": "prefix"},
    "JPY": {"symbol": "¥", "decimals": 0, "position": "prefix"},
    "CNY": {"symbol": "¥", "decimals": 2, "position": "prefix"},
    "INR": {"symbol": "₹", "decimals": 2, "position": "prefix"},
    "AUD": {"symbol": "A$", "decimals": 2, "position": "prefix"},
    "CAD": {"symbol": "C$", "decimals": 2, "position": "prefix"},
}

# Exchange rates — update periodically or integrate with API
EXCHANGE_RATES = {
    "USD": 1.00,
    "THB": 36.50,
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 145.00,
    "CNY": 7.20,
    "INR": 83.00,
    "AUD": 1.53,
    "CAD": 1.36,
}

class GlobalTaxManager:
    def __init__(self):
        self.data_dir = Path("./data/tax")
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def _get_domain_config_path(self, domain: str) -> Path:
        return self.data_dir / f"{domain}.json"

    # === CURRENCY FORMATTING ===
    def format_amount(self, amount: float, currency: str = "USD") -> str:
        """Format with symbol and proper decimal places"""
        cfg = SUPPORTED_CURRENCIES.get(currency.upper(), SUPPORTED_CURRENCIES["USD"])
        symbol = cfg["symbol"]
        decimals = cfg["decimals"]
        formatted = f"{amount:,.{decimals}f}"
        if cfg["position"] == "prefix":
            return f"{symbol}{formatted}"
        return f"{formatted} {symbol}"

    def convert_currency(self, amount_usd: float, target_currency: str) -> float:
        """Convert USD to target currency using current rates"""
        rate = EXCHANGE_RATES.get(target_currency.upper(), 1.0)
        return round(amount_usd * rate, 2)

    # === TAX CALCULATION ===
    def get_tax_rate(self, country_code: str, business_tax_id: str = "") -> Dict:
        """
        Determine applicable tax rate
        - Reverse charge if business customer has valid EU VAT ID
        - Returns rate, name, and whether tax is applied
        """
        country = country_code.upper()
        rule = TAX_RATES.get(country, TAX_RATES["DEFAULT"])

        # Reverse Charge: Business customer with valid tax ID in EU
        if business_tax_id and rule["reverse_charge"]:
            return {
                "rate": 0.00,
                "name": "Reverse Charge",
                "applied": False,
                "note": "Tax to be accounted for by recipient",
            }

        return {
            "rate": rule["rate"],
            "name": rule["name"],
            "applied": rule["rate"] > 0,
            "note": "",
        }

    def calculate_tax(
        self,
        amount: float,
        country_code: str,
        business_tax_id: str = "",
        currency: str = "USD",
    ) -> Dict:
        """Calculate subtotal → tax → total with regional rules"""
        tax_info = self.get_tax_rate(country_code, business_tax_id)
        tax_amount = round(amount * tax_info["rate"], 2)
        total = round(amount + tax_amount, 2)

        return {
            "subtotal": amount,
            "tax_rate": tax_info["rate"],
            "tax_amount": tax_amount,
            "tax_name": tax_info["name"],
            "total": total,
            "currency": currency.upper(),
            "tax_applied": tax_info["applied"],
            "note": tax_info["note"],
            "formatted_subtotal": self.format_amount(amount, currency),
            "formatted_tax": self.format_amount(tax_amount, currency),
            "formatted_total": self.format_amount(total, currency),
        }

    # === CUSTOMER PROFILE ===
    def set_customer_profile(
        self,
        domain: str,
        country_code: str,
        currency_preference: str = "USD",
        tax_id: str = "",
        company_address: str = "",
    ) -> Dict:
        """Store customer's tax/currency profile"""
        profile = {
            "domain": domain,
            "country_code": country_code.upper(),
            "currency_preference": currency_preference.upper(),
            "tax_id": tax_id.strip().upper(),
            "company_address": company_address,
            "updated_at": datetime.utcnow().isoformat(),
        }

        with self._get_domain_config_path(domain).open("w") as f:
            json.dump(profile, f, indent=2)

        logger.info(f"🌍 Profile updated: {domain} → {country_code} / {currency_preference}")
        return profile

    def get_customer_profile(self, domain: str) -> Optional[Dict]:
        path = self._get_domain_config_path(domain)
        if not path.exists():
            return None
        with open(path) as f:
            return json.load(f)

    def get_invoice_tax_breakdown(self, domain: str, amount_usd: float) -> Dict:
        """Full breakdown for invoices — auto-converts to preferred currency"""
        profile = self.get_customer_profile(domain) or {
            "country_code": os.getenv("DEFAULT_COUNTRY", "TH"),
            "currency_preference": os.getenv("DEFAULT_CURRENCY", "USD"),
            "tax_id": "",
        }

        # Convert to customer's preferred currency
        local_amount = self.convert_currency(amount_usd, profile["currency_preference"])

        # Calculate tax
        tax = self.calculate_tax(
            amount=local_amount,
            country_code=profile["country_code"],
            business_tax_id=profile.get("tax_id", ""),
            currency=profile["currency_preference"],
        )

        return {
            **tax,
            "domain": domain,
            "country_code": profile["country_code"],
            "tax_id": profile.get("tax_id", ""),
            "currency": profile["currency_preference"],
            "amount_usd": amount_usd,
        }

global_tax = GlobalTaxManager()
