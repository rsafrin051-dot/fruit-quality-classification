"""
Backend Integration & Unit Tests for Fruit Quality Classification.
Tests Flask endpoints, image validation, MobileNetV2 inference, and SQLite operations.
"""

import os
import sys
import io
import unittest
from PIL import Image

# Ensure backend directory is in path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
sys.path.insert(0, BACKEND_DIR)
sys.path.insert(0, PROJECT_ROOT)

from app import create_app
from database.db import db
from config import Config


class BackendIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n" + "=" * 60)
        print("  STARTING FLASK BACKEND INTEGRATION TESTS")
        print("=" * 60)
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def test_01_health_endpoint(self):
        """Test GET /api/health returns 200 and system readiness."""
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get('status'), 'healthy')
        self.assertTrue(data.get('database_connected'), "Database should be connected")
        self.assertTrue(data.get('model_loaded'), "Model should be loaded")
        self.assertIn('Fresh', data.get('classes', []))
        print(" [PASS] test_01_health_endpoint: Health check status OK, model & DB online.")

    def test_02_predict_missing_image(self):
        """Test POST /api/predict without image file returns 400."""
        response = self.client.post('/api/predict', data={})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertFalse(data.get('success'))
        self.assertIn('No image', data.get('error', ''))
        print(" [PASS] test_02_predict_missing_image: Missing file caught.")

    def test_03_predict_invalid_extension(self):
        """Test POST /api/predict with unsupported extension returns 400."""
        data = {
            'image': (io.BytesIO(b"fake text data"), 'test.txt')
        }
        response = self.client.post('/api/predict', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 400)
        res_json = response.get_json()
        self.assertFalse(res_json.get('success'))
        self.assertIn('Invalid file type', res_json.get('error', ''))
        print(" [PASS] test_03_predict_invalid_extension: Non-image rejection OK.")

    def test_04_predict_valid_image(self):
        """Test POST /api/predict with valid fruit image returns 200 and quality verdict."""
        # Create a small valid test fruit image in memory
        img = Image.new('RGB', (224, 224), color=(220, 38, 38))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)

        data = {
            'image': (img_bytes, 'test_fresh_apple.jpg')
        }
        response = self.client.post('/api/predict', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 200)
        res_json = response.get_json()
        self.assertTrue(res_json.get('success'))
        self.assertIn(res_json.get('prediction'), ['Fresh', 'Rotten'])
        self.assertGreater(res_json.get('confidence'), 0.0)
        self.assertIsNotNone(res_json.get('image_url'))
        self.assertIsNotNone(res_json.get('quality_info'))
        print(f" [PASS] test_04_predict_valid_image: Verdict '{res_json['prediction']}' ({res_json['confidence']}%)")

    def test_05_prediction_history(self):
        """Test GET /api/predictions returns paginated records from SQLite."""
        response = self.client.get('/api/predictions?page=1&limit=5')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data.get('success'))
        self.assertGreaterEqual(data.get('total'), 1)
        self.assertIsInstance(data.get('data'), list)
        print(f" [PASS] test_05_prediction_history: Retrieved {len(data['data'])} records, total = {data['total']}.")

    def test_06_dashboard_stats(self):
        """Test GET /api/dashboard/stats computes correct statistics."""
        response = self.client.get('/api/dashboard/stats')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data.get('success'))
        self.assertIn('total_predictions', data)
        self.assertIn('fresh_count', data)
        self.assertIn('rotten_count', data)
        self.assertIn('average_confidence', data)
        print(f" [PASS] test_06_dashboard_stats: Stats total = {data['total_predictions']}, avg conf = {data['average_confidence']}%.")


if __name__ == '__main__':
    unittest.main()
