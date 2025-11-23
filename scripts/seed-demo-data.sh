#!/bin/bash
# Seed demo site data into the database
# Usage: ./scripts/seed-demo-data.sh

set -e

echo "🌱 Seeding demo site data..."

docker exec -i aaca-postgres psql -U aaca -d aaca < scripts/seed-demo-data.sql

echo "✅ Demo data seeded successfully!"
echo ""
echo "Demo Site Details:"
echo "  URL: http://localhost:4400"
echo "  Site ID: 00000000-0000-0000-0000-000000000001"
echo "  Embed Key: demo-embed-key-12345"
echo ""
echo "Test the embed config API:"
echo "  curl -X GET \"http://localhost:8080/api/v1/sites/00000000-0000-0000-0000-000000000001/embed-config\" \\"
echo "    -H \"X-Embed-Key: demo-embed-key-12345\""
