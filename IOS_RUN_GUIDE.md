# 📱 How to Run SmartCampus AttendTrack on iOS (iPhone / iPad)

This document provides step-by-step instructions on how to run and test the **SmartCampus AttendTrack** app on iOS devices.

---

## Method 1: Instant Web PWA (No Xcode Required - Recommended)

Because the app is configured as a Progressive Web App (PWA) with iOS safe area meta tags:

1. **Host or Access the App URL**:
   - On your local Mac, run: `npm run dev -- --host`
   - Note your Mac's local IP address (e.g., `http://192.168.1.5:5173`) or use [ngrok](https://ngrok.com) / cloud deployment (Vercel/Netlify).

2. **Open Safari on iPhone/iPad**:
   - Open Safari and go to your app URL (e.g. `http://192.168.1.5:5173`).

3. **Add to Home Screen**:
   - Tap the **Share** button (the square with an arrow pointing up at the bottom of Safari).
   - Scroll down and select **"Add to Home Screen"**.
   - Tap **Add**.

4. **Launch Native iOS Experience**:
   - Tap the **AttendTrack** app icon on your iPhone home screen. It will launch as a full-screen, native-feeling iOS app without browser address bars!

---

## Method 2: Convert to Native iOS App (.ipa) via Capacitor & Xcode

If you want to create an official Xcode project and run on iPhone Simulator or physical iPhone:

1. **Install Capacitor in the project directory**:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios
   ```

2. **Initialize Capacitor**:
   ```bash
   npx cap init AttendTrack com.college.attendtrack
   ```

3. **Build the production web assets**:
   ```bash
   npm run build
   ```

4. **Add iOS platform**:
   ```bash
   npx cap add ios
   ```

5. **Open Xcode and launch on Simulator / iPhone**:
   ```bash
   npx cap open ios
   ```
   - In Xcode, select your target iPhone (e.g., iPhone 15 Pro Simulator or connected iPhone).
   - Press **Play (▶ Run)** to compile and launch the app!
