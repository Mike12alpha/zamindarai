from agents.crop_doctor import CropDoctorAgent
from agents.price_oracle import PriceOracleAgent
from agents.soil_advisor import SoilAdvisorAgent
from agents.deal_guardian import DealGuardianAgent

# Registry pattern — easy to add new agents
AGENT_REGISTRY = {
    "crop_doctor": CropDoctorAgent(),
    "price_oracle": PriceOracleAgent(),
    "soil_advisor": SoilAdvisorAgent(),
    "deal_guardian": DealGuardianAgent(),
}


def get_agent(name: str):
    return AGENT_REGISTRY.get(name)
