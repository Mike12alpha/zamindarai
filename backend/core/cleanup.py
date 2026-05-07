"""Cleanup utilities for old uploaded files and temp data."""

import os
import time
from datetime import datetime, timedelta

UPLOADS_DIR = "uploads"
MAX_AGE_DAYS = 7


def cleanup_old_uploads() -> int:
    """Delete uploaded files older than MAX_AGE_DAYS. Returns count of deleted files."""
    if not os.path.isdir(UPLOADS_DIR):
        return 0

    cutoff = time.time() - (MAX_AGE_DAYS * 86400)
    deleted = 0

    for filename in os.listdir(UPLOADS_DIR):
        filepath = os.path.join(UPLOADS_DIR, filename)
        if os.path.isfile(filepath):
            try:
                if os.path.getmtime(filepath) < cutoff:
                    os.remove(filepath)
                    deleted += 1
            except OSError:
                pass

    return deleted


def cleanup_all() -> dict:
    """Run all cleanup tasks. Returns summary."""
    uploads_deleted = cleanup_old_uploads()
    return {
        "uploads_deleted": uploads_deleted,
        "timestamp": datetime.utcnow().isoformat(),
    }
