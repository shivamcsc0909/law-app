#!/bin/bash
# ==========================================================
# NyayaSetu Local Android Studio / Gradle Build (APK & AAB)
# ==========================================================

set -e

echo "🚀 Generating Native Android Studio Project via Expo Prebuild..."
cd "$(dirname "$0")/../../mobile"

# 1. Run Prebuild to generate native android/ directory
npx expo prebuild --platform android --clean

# 2. Build via Gradle
cd android

echo "🔨 Compiling Release APK locally..."
./gradlew assembleRelease

echo "🔨 Compiling Release AAB locally..."
./gradlew bundleRelease

echo "✅ Local Android builds completed successfully!"
echo "📁 Output APK location: mobile/android/app/build/outputs/apk/release/app-release.apk"
echo "📁 Output AAB location: mobile/android/app/build/outputs/bundle/release/app-release.aab"
