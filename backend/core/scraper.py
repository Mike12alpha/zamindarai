import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Dict, Optional
from core.vector_store import get_kb
from langchain_core.documents import Document
import re
import time


class MandiScraper:
    """Real-time scraper for Pakistan agricultural market prices."""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        self._cache: Dict[str, tuple] = {}
        self._cache_ttl = 3600  # 1 hour

    def _get_cached(self, key: str) -> Optional[List[Dict]]:
        if key in self._cache:
            data, timestamp = self._cache[key]
            if time.time() - timestamp < self._cache_ttl:
                return data
            del self._cache[key]
        return None

    def _set_cached(self, key: str, data: List[Dict]) -> None:
        self._cache[key] = (data, time.time())

    def scrape_amis_prices(self) -> List[Dict]:
        """Scrape prices from amis.pk with retry."""
        prices = []
        url = "https://www.amis.pk/home/price_reporter"

        for attempt in range(3):
            try:
                resp = self.session.get(url, timeout=15)
                resp.raise_for_status()
                break
            except requests.RequestException as e:
                if attempt < 2:
                    time.sleep(2 ** attempt)  # exponential backoff: 1s, 2s
                    continue
                print(f"AMIS scrape failed after 3 attempts: {e}")
                return prices
        else:
            return prices

        try:
            soup = BeautifulSoup(resp.text, "html.parser")

            tables = soup.find_all("table")
            for table in tables:
                rows = table.find_all("tr")
                for row in rows[1:]:
                    cells = row.find_all(["td", "th"])
                    if len(cells) >= 4:
                        crop = cells[0].get_text(strip=True)
                        market = cells[1].get_text(strip=True)
                        price_text = cells[2].get_text(strip=True)
                        unit = cells[3].get_text(strip=True) if len(cells) > 3 else "40kg"

                        price_match = re.search(r'[\d,]+', price_text)
                        if price_match and crop and market:
                            price_str = price_match.group().replace(',', '')
                            try:
                                price = float(price_str)
                                prices.append({
                                    "crop": crop,
                                    "market": market,
                                    "price": price,
                                    "unit": unit,
                                    "date": datetime.now().strftime("%Y-%m-%d"),
                                    "source": "amis.pk"
                                })
                            except ValueError:
                                continue
        except Exception as e:
            print(f"AMIS scrape error: {e}")
        return prices

    def scrape_fallback_prices(self) -> List[Dict]:
        """Fallback to estimated market data if scraping fails"""
        today = datetime.now().strftime("%Y-%m-%d")
        # These are realistic baseline prices that get updated by generative AI
        base_prices = [
            {"crop": "Wheat", "market": "Lahore", "min": 2400, "max": 2600, "unit": "40kg"},
            {"crop": "Wheat", "market": "Faisalabad", "min": 2350, "max": 2550, "unit": "40kg"},
            {"crop": "Wheat", "market": "Multan", "min": 2380, "max": 2580, "unit": "40kg"},
            {"crop": "Rice", "market": "Lahore", "min": 3200, "max": 3500, "unit": "40kg"},
            {"crop": "Rice", "market": "Sheikhupura", "min": 3100, "max": 3400, "unit": "40kg"},
            {"crop": "Cotton", "market": "Multan", "min": 4800, "max": 5200, "unit": "40kg"},
            {"crop": "Cotton", "market": "Bahawalpur", "min": 4700, "max": 5100, "unit": "40kg"},
            {"crop": "Sugarcane", "market": "Faisalabad", "min": 300, "max": 350, "unit": "40kg"},
            {"crop": "Tomato", "market": "Lahore", "min": 40, "max": 65, "unit": "kg"},
            {"crop": "Potato", "market": "Gujranwala", "min": 35, "max": 55, "unit": "kg"},
            {"crop": "Onion", "market": "Lahore", "min": 50, "max": 80, "unit": "kg"},
            {"crop": "Maize", "market": "Sahiwal", "min": 1600, "max": 1850, "unit": "40kg"},
        ]
        prices = []
        for item in base_prices:
            avg = (item["min"] + item["max"]) / 2
            prices.append({
                "crop": item["crop"],
                "market": item["market"],
                "price": avg,
                "min_price": item["min"],
                "max_price": item["max"],
                "unit": item["unit"],
                "date": today,
                "source": "baseline_estimate"
            })
        return prices

    def get_live_prices(self, crop: str = None, location: str = None) -> List[Dict]:
        """Get real-time prices with smart fallback and caching."""
        cache_key = f"{crop or 'all'}_{location or 'all'}"
        cached = self._get_cached(cache_key)
        if cached is not None:
            return cached

        scraped = self.scrape_amis_prices()
        if not scraped:
            scraped = self.scrape_fallback_prices()

        if crop:
            scraped = [p for p in scraped if crop.lower() in p["crop"].lower()]
        if location:
            scraped = [p for p in scraped if location.lower() in p["market"].lower()]

        self._set_cached(cache_key, scraped)
        return scraped

    def ingest_to_kb(self) -> int:
        """Scrape and ingest latest prices into vector store"""
        prices = self.scrape_amis_prices()
        if not prices:
            prices = self.scrape_fallback_prices()

        docs = []
        for p in prices:
            content = (
                f"Crop: {p['crop']}. Market: {p['market']}. Date: {p['date']}. "
                f"Price: PKR {p['price']}/{p['unit']}."
            )
            if "min_price" in p:
                content += f" Range: PKR {p['min_price']}-{p['max_price']}/{p['unit']}."
            docs.append(Document(
                page_content=content,
                metadata={"crop": p["crop"], "mandi": p["market"], "date": p["date"], "source": p.get("source", "")}
            ))

        try:
            kb = get_kb()
            kb.ingest(docs, "mandi_prices")
            return len(docs)
        except Exception as e:
            print(f"KB ingestion error: {e}")
            return 0
