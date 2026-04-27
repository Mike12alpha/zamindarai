from agents.crop_doctor import CropDoctorAgent
from agents.price_oracle import PriceOracleAgent
from agents.soil_advisor import SoilAdvisorAgent
from agents.deal_guardian import DealGuardianAgent

# Lazy registry — agents instantiated on first use to avoid heavy
# import-time side effects (model downloads, etc.)
_AGENTS = {}


def get_agent(name: str):
    if name not in _AGENTS:
        registry = {
            "crop_doctor": CropDoctorAgent,
            "price_oracle": PriceOracleAgent,
            "soil_advisor": SoilAdvisorAgent,
            "deal_guardian": DealGuardianAgent,
        }
        cls = registry.get(name)
        if cls:
            _AGENTS[name] = cls()
    return _AGENTS.get(name)
