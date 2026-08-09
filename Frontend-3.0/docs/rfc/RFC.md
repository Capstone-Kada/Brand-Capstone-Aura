# Request for Comments (RFC)

# RFC-001: AURA AI Beauty Recommendation Platform - Technical Architecture

**Status:** Draft  
**Authors:** Engineering Team  
**Related Document:** Product Requirements Document (PRD)  

---

# 1. Overview

## Objective
This RFC describes the technical architecture and implementation plan for **AURA**, an AI-powered beauty decision platform. The system analyzes user selfies to estimate skin undertone, skin tone, and personal color palette, combining these results with user preferences to recommend suitable makeup products from affiliate marketplaces.

---

# 2. Goals
The MVP enables users to:
- Upload a selfie or capture a photo.
- Detect skin undertone and personal color palette accurately.
- Complete a beauty preference questionnaire (Budget, Finish, Brands).
- Receive Top product recommendations with Explainable AI badges.
- Compare products side-by-side.
- Redirect to affiliate marketplaces with tracking links.

---

# 3. Non-Goals (Out of Scope)
- AR Virtual Try-On
- Medical skin / dermatology analysis
- On-site payment & checkout processing
- B2B Brand Analytics Dashboard

---

# 4. System Architecture

```
+-----------------------------------------------------------+
|                   Client Application                      |
|           React 18 + Vite + Tailwind CSS + Motion         |
+-----------------------------+-----------------------------+
                              |
                       REST API / HTTPS
                              |
+-----------------------------v-----------------------------+
|                     Express Backend                       |
|           Node.js + Google Gemini AI (@google/genai)      |
+-----------------------------+-----------------------------+
                              |
             +----------------+----------------+
             |                                 |
+------------v------------+       +------------v------------+
|   AI Vision Service     |       |    Affiliate Services   |
|   Gemini Multimodal /   |       |    Shopee / TikTok Shop |
|   Undertone Classifier  |       |    Affiliate Links      |
+-------------------------+       +-------------------------+
```

---

# 5. Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion (`motion/react`)
- **Backend API:** Express.js, Node.js
- **AI Processing:** Google Gemini Multimodal Vision API (`@google/genai`)
- **Data & Mock Engine:** TypeScript Data Layer (`src/types/index.ts`, `src/services/mockData.ts`)

---

# 6. Core Data Schema

### `SkinAnalysisResult`
- `detectedSkinTone`: 'Fair' | 'Light' | 'Medium' | 'Tan' | 'Deep'
- `detectedUndertone`: 'Cool' | 'Warm' | 'Neutral'
- `personalColor`: 'Winter' | 'Summer' | 'Spring' | 'Autumn'
- `confidence`: number (0-100)
- `bestColorPalette`: Array of `{ name: string, colorHex: string }`
- `faceShape`: 'Oval' | 'Round' | 'Square' | 'Heart' | 'Diamond'

### `UserBeautyPreferences`
- `budget`: 'Under Rp150K' | 'Rp150K - Rp300K' | 'Above Rp300K'
- `finish`: 'Matte' | 'Dewy' | 'Natural' | 'Velvet'
- `occasion`: 'Daily' | 'Office & Professional' | 'Special Event'
- `preferredBrands`: string[]

---

# 7. UI Standards & Explainable AI
1. **Best Color Palette:** Displayed using single solid color indicator circles (`w-3.5 h-3.5` with hex codes like `#701a75`, `#1e3a8a`, `#065f46`, `#94a3b8`) without duplicate emoji icons.
2. **Explainable AI Badges:** Each product card must feature clear match reasons (e.g. `✓ Cool Undertone`, `✓ Natural Finish`, `✓ Daily Fit`).
3. **Affiliate Redirects:** One-click CTA buttons directing directly to affiliate landing pages.
