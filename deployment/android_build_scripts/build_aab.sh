#!/bin/bash
# ==========================================================
# NyayaSetu Android AAB Build Script (Google Play Store Bundle)
# ==========================================================

set -e

echo "🚀 Starting NyayaSetu Android AAB (App Bundle) Build..."
cd "$(dirname "$0")/../../mobile"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null
then
    echo "📦 EAS CLI not found globally. Using npx eas-cli..."
    EAS_CMD="npx eas-cli"
else
    EAS_CMD="eas"
fi

echo "⚙️ Building production Android App Bundle .aab (production profile)..."
echo "Note: This generates a signed .aab bundle ready for Google Play Console submission."
$EAS_CMD build --platform android --profile production

echo "✅ AAB Build process initiated. Your Google Play bundle will be ready for download."
