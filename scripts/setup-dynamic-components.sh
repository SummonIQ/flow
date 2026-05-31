#!/bin/bash

# Dynamic Components Setup Script
# This script sets up the database and seeds initial component data

set -e

echo "🚀 Setting up Dynamic Components System..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found!"
    echo "Creating from template..."
    cp ../../packages/config/templates/.env.template .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Please add your OPENAI_API_KEY to .env.local"
    echo ""
fi

# Check for DATABASE_URL
if ! grep -q "DATABASE_URL" .env.local; then
    echo "⚠️  DATABASE_URL not found in .env.local"
    echo "Please add: DATABASE_URL=\"postgresql://user:password@localhost:5432/applab\""
    exit 1
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    bun install
fi

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
bun run db:generate

# Push schema to database
echo ""
echo "📊 Pushing schema to database..."
bun run db:push

# Seed components
echo ""
echo "🌱 Seeding component data..."
bun run prisma db seed -- --seed seed-components.ts

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Add your OPENAI_API_KEY to .env.local"
echo "  2. Run: bun run dev"
echo "  3. Visit: http://localhost:30140/components"
echo ""
echo "📚 Documentation:"
echo "  - Setup Guide: ../../DYNAMIC_COMPONENTS_SETUP.md"
echo "  - AI Integration: ../components/components/README.md"
echo ""

