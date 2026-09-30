"""
SQLite Database Layer for Fruit Quality Classification.
Handles prediction persistence, history pagination, and dashboard metrics.
"""

import os
import json
import sqlite3
import datetime
from config import Config


class Database:
    def __init__(self, db_path=None):
        self.db_path = db_path or Config.DATABASE_PATH
        os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
        self.connected = False
        try:
            self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self.conn.row_factory = sqlite3.Row
            self.create_tables()
            self.connected = True
            print(f"[database] SQLite connected successfully: {self.db_path}")
        except Exception as e:
            print(f"[database] Failed to connect to SQLite: {e}")

    def create_tables(self):
        """Initializes predictions table with schema."""
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_filename TEXT NOT NULL,
                fruit_name TEXT DEFAULT 'Fruit',
                prediction TEXT NOT NULL,
                category TEXT NOT NULL,
                confidence REAL NOT NULL,
                confidence_level TEXT DEFAULT 'High',
                top_predictions TEXT,
                model_name TEXT,
                processing_time REAL,
                gradcam_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        self.conn.commit()

    def insert_prediction(self, data: dict):
        """Inserts a new fruit quality prediction record."""
        if not self.connected:
            return None

        cursor = self.conn.cursor()
        top_predictions_json = json.dumps(data.get('top_predictions', []))
        prediction_val = data.get('prediction') or data.get('category') or 'Unknown'
        category_val = data.get('category') or prediction_val

        cursor.execute('''
            INSERT INTO predictions (
                image_filename, fruit_name, prediction, category,
                confidence, confidence_level, top_predictions,
                model_name, processing_time, gradcam_path, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('image_filename'),
            data.get('fruit_name', 'Fruit'),
            prediction_val,
            category_val,
            float(data.get('confidence', 0.0)),
            data.get('confidence_level', 'High'),
            top_predictions_json,
            data.get('model_name', 'MobileNetV2'),
            float(data.get('processing_time', 0.0)),
            data.get('gradcam_path'),
            datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
        self.conn.commit()
        return str(cursor.lastrowid)

    def get_predictions(self, skip: int = 0, limit: int = 20):
        """Retrieves paginated prediction history records."""
        if not self.connected:
            return []

        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT * FROM predictions 
            ORDER BY id DESC 
            LIMIT ? OFFSET ?
        ''', (limit, skip))

        results = []
        for row in cursor.fetchall():
            doc = dict(row)
            doc['_id'] = str(doc['id'])
            doc['timestamp'] = doc.get('created_at', '')

            # Parse JSON top predictions safely
            if 'top_predictions' in doc and doc['top_predictions']:
                try:
                    doc['top_predictions'] = json.loads(doc['top_predictions'])
                except Exception:
                    doc['top_predictions'] = []
            else:
                doc['top_predictions'] = []

            results.append(doc)
        return results

    def get_total_count(self) -> int:
        """Returns total number of saved predictions."""
        if not self.connected:
            return 0
        cursor = self.conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM predictions')
        row = cursor.fetchone()
        return row[0] if row else 0

    def delete_prediction(self, prediction_id: int) -> bool:
        """Deletes a prediction record by its ID."""
        if not self.connected:
            return False
        cursor = self.conn.cursor()
        cursor.execute('DELETE FROM predictions WHERE id = ?', (prediction_id,))
        self.conn.commit()
        return cursor.rowcount > 0

    def get_dashboard_stats(self) -> dict:
        """
        Aggregates dashboard statistics:
        Total predictions, Fresh count/%, Rotten count/%, Average confidence,
        category distribution, and confidence level distribution.
        """
        if not self.connected:
            return {
                "total_predictions": 0,
                "fresh_count": 0,
                "rotten_count": 0,
                "fresh_percentage": 0.0,
                "rotten_percentage": 0.0,
                "average_confidence": 0.0,
                "category_distribution": {},
                "confidence_distribution": {},
                "recent_predictions": []
            }

        cursor = self.conn.cursor()

        # Total
        cursor.execute('SELECT COUNT(*) FROM predictions')
        total = cursor.fetchone()[0]

        # Category breakdown
        cursor.execute('SELECT category, COUNT(*) FROM predictions GROUP BY category')
        categories = {row[0]: row[1] for row in cursor.fetchall()}

        # Fresh & Rotten specific counts
        fresh_count = sum(count for cat, count in categories.items() if 'fresh' in cat.lower())
        rotten_count = sum(count for cat, count in categories.items() if 'rotten' in cat.lower())

        fresh_pct = round((fresh_count / total * 100), 1) if total > 0 else 0.0
        rotten_pct = round((rotten_count / total * 100), 1) if total > 0 else 0.0

        # Confidence levels
        cursor.execute('SELECT confidence_level, COUNT(*) FROM predictions GROUP BY confidence_level')
        confidence_levels = {row[0]: row[1] for row in cursor.fetchall()}

        # Average confidence
        cursor.execute('SELECT AVG(confidence) FROM predictions')
        avg_row = cursor.fetchone()
        avg_confidence = round(avg_row[0], 2) if avg_row and avg_row[0] is not None else 0.0

        # Recent 5 predictions
        recent = self.get_predictions(skip=0, limit=5)

        return {
            "total_predictions": total,
            "fresh_count": fresh_count,
            "rotten_count": rotten_count,
            "fresh_percentage": fresh_pct,
            "rotten_percentage": rotten_pct,
            "average_confidence": avg_confidence,
            "category_distribution": categories,
            "confidence_distribution": confidence_levels,
            "recent_predictions": recent
        }


# Singleton database instance
db = Database()
