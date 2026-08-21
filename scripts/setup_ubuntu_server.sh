#!/usr/bin/env bash
# ============================================================
# SmartPol AI – Ubuntu VPS Quick Setup & Permissions Fix Script
# Run this script on your Ubuntu server to fix 500 errors.
# ============================================================

set -e

PROJECT_DIR="$(pwd)"
if [ ! -f "manage.py" ]; then
    echo "❌ Error: Please run this script from the smartpol_AI/backend directory."
    exit 1
fi

echo "📦 1. Installing / Upgrading Python Dependencies..."
if [ -d "venv" ]; then
    source venv/bin/activate
fi
pip install -r requirements.txt

echo "🗄️ 2. Running Database Migrations & Seeding Data..."
python manage.py migrate
python manage.py seed_data

echo "📁 3. Collecting Static Files..."
python manage.py collectstatic --noinput

echo "🔒 4. Fixing File Permissions for db.sqlite3 & media/..."
sudo chown -R www-data:www-data db.sqlite3 db.sqlite3-wal db.sqlite3-shm media/ staticfiles/ 2>/dev/null || true
sudo chmod 664 db.sqlite3 2>/dev/null || true
sudo chmod -R 775 media/ staticfiles/ 2>/dev/null || true

echo "🔄 5. Restarting Gunicorn / Nginx Service..."
sudo systemctl restart gunicorn 2>/dev/null || true
sudo systemctl restart nginx

echo "✅ Ubuntu Setup & Permissions Fix Complete! Check status with:"
echo "   sudo systemctl status gunicorn"
echo "   sudo journalctl -u gunicorn -n 30 --no-pager"
