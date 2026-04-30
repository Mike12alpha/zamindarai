from agents.crop_doctor import CropDoctorAgent
from agents.price_oracle import PriceOracleAgent
from agents.soil_advisor import SoilAdvisorAgent
from agents.deal_guardian import DealGuardianAgent

_agent_registry = {
    "crop_doctor": CropDoctorAgent,
    "price_oracle": PriceOracleAgent,
    "soil_advisor": SoilAdvisorAgent,
    "deal_guardian": DealGuardianAgent,
}

_agent_instances = {}


def get_agent(name: str):
    if name not in _agent_instances:
        cls = _agent_registry.get(name)
        if not cls:
            raise ValueError(f"Unknown agent: {name}")
        _agent_instances[name] = cls()
    return _agent_instances[name]
