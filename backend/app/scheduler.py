from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from core.scraper import MandiScraper

scheduler = BackgroundScheduler()


def refresh_mandi_data():
    scraper = MandiScraper()
    count = scraper.scrape_amis_prices()
    if not count:
        count = len(scraper.scrape_fallback_prices())
    print(f"[SCHEDULER] Refreshed {count} price records at {datetime.now()}")


# Run every 6 hours
scheduler.add_job(refresh_mandi_data, 'interval', hours=6)
