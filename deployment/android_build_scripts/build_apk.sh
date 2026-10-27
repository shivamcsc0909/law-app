#!/bin/bash
# ==========================================================
# NyayaSetu Android APK Build Script (Direct Phone Install)
# ==========================================================

set -e

echo "🚀 Starting NyayaSetu Android APK Build..."
cd "$(dirname "$0")/../../mobile"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null
then
    echo "📦 EAS CLI not found globally. Using npx eas-cli..."
    EAS_CMD="npx eas-cli"
else
    EAS_CMD="eas"
fi

echo "⚙️ Building standalone Android APK (preview profile)..."
echo "Note: This generates a standard installable .apk file for direct testing on any Android phone."
$EAS_CMD build --platform android --profile preview

echo "✅ APK Build process initiated. Your download link will be provided in the terminal output."
