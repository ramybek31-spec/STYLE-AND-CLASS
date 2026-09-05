# STYLE AND CLASS | London Second-Hand Fashion

Official storefront for **STYLE AND CLASS**, an authenticated London second-hand & archival fashion boutique featuring singular 1-of-1 physical pieces, real-time inventory locking, delivery address QR generation, and store manager portal.

---

## 🚀 How to Export to GitHub

In **Google AI Studio**:
1. Click the **Export / Settings** icon in the top header menu.
2. Select **"Export to GitHub"** (or click **"Download ZIP"**).
3. Connect your GitHub account and choose your target repository name.
4. AI Studio will automatically commit and push the entire codebase to your GitHub account.

---

## ▲ Deploying to Vercel

Once exported to GitHub:
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New Project"** -> **"Project"** and import your newly created GitHub repository.
3. Vercel will automatically detect the Vite framework and use `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add any environment variables (from `.env.example`) in **Project Settings -> Environment Variables**:
   - `ADMIN_PASSWORD` (e.g., `StyleAndClassLondon2026!`)
   - `MANAGER_WHATSAPP_PHONE` (e.g., `+447591878215`)
   - `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` (if using live PayPal)
5. Click **Deploy**.

---

## ☁️ Deploying to Cloud Run (Direct from AI Studio)

You can also deploy directly from Google AI Studio with **1 Click**:
- Click **"Deploy"** in the top navigation bar to host the full-stack container on Google Cloud Run with zero extra setup.
