# Product Requirements Document (PRD)

# AURA
### AI-Powered Beauty Decision Platform

**Version:** MVP v1.0  
**Author:** Product Team  
**Status:** Approved Draft  

---

# 1. Executive Summary

## Product Overview
AURA is an AI-powered beauty affiliate platform that helps users identify their skin undertone and personal color from a selfie and receive personalized makeup shade recommendations across multiple brands. By combining computer vision, explainable AI, and affiliate commerce, AURA enables users to shop confidently while helping affiliates deliver personalized product recommendations at scale.

---

## Problem Statement
Beauty shopping has become increasingly overwhelming. Consumers often rely on influencer reviews, social media recommendations, or best-selling products that are not personalized to their unique characteristics.

As a result:
- Users struggle to identify suitable makeup shades that match their skin undertone.
- Many consumers do not have access to offline beauty stores to test makeup shades before purchasing.
- Influencer recommendations are often subjective and not personalized.
- Affiliate creators repeatedly answer identical product questions.
- Choosing the wrong shade leads to wasted money and low shopping confidence.

Current beauty e-commerce platforms optimize for selling products—not helping customers choose the right products.

---

## Vision
To become the leading AI-powered beauty decision platform that enables consumers to shop confidently through personalized recommendations while empowering affiliates with intelligent commerce tools.

---

## Value Proposition

### For Consumers
- Find products that truly match their beauty profile.
- Reduce wrong shade purchases.
- Increase shopping confidence.

### For Affiliates
- Increase conversion rates.
- Reduce repetitive consultations.
- Deliver personalized recommendations at scale.

---

# 2. Background

## Industry Context
The beauty industry continues to experience significant digital transformation driven by:
- Growth of beauty e-commerce
- Social commerce
- Influencer marketing
- Affiliate commerce
- AI personalization

Consumers increasingly discover products through TikTok, Instagram, and YouTube before purchasing through online marketplaces like Shopee and TikTok Shop.

---

## Current Challenges

### Customer
- Too many product choices
- Conflicting influencer recommendations
- Fear of choosing the wrong shade
- Low confidence before checkout

### Affiliate
- Manual consultations
- Repetitive questions
- Limited scalability
- Low conversion

---

# 3. Goals & Success Metrics

## Business Goals
- Increase affiliate conversion rate.
- Build a scalable AI recommendation platform.
- Generate affiliate commission revenue.

---

## User Goals
Users should be able to:
- Discover suitable makeup quickly.
- Understand why products are recommended (Explainable AI).
- Purchase with confidence through affiliate links.

---

## KPIs
- **Primary:** Recommendation Acceptance Rate, Affiliate Conversion Rate, Click-to-Purchase Rate.
- **Secondary:** Session Completion Rate, Repeat User Rate, Average Recommendation Accuracy Rating.

---

## Success Metrics (MVP)
- 70% users complete AI analysis
- 60% recommendation acceptance
- <5 seconds recommendation generation
- Average satisfaction >4.3/5

---

# 4. Target Users

## Primary Persona: Beauty Shopper
- **Age:** 18+
- **Characteristics:** Active on TikTok/Instagram, shops through Shopee/TikTok Shop, interested in affordable & prestige makeup, seeks confidence before purchasing.
- **Pain Points:** Doesn't know which makeup shade matches undertone, afraid of buying wrong shade, overwhelmed by reviews.
- **Needs:** Personalized recommendations, easy shopping journey, clear explanations.

## Secondary Persona: Beauty Affiliate Creator
- **Characteristics:** Reviews beauty products, uses affiliate links, receives repetitive customer questions.
- **Pain Points:** Manual consultation, difficult to scale, lower conversion.
- **Needs:** Automated recommendation tool, higher conversion, better customer experience.

---

# 5. Functional Requirements

---

## Feature 1: AI Face Analysis
- **Description:** Analyze uploaded selfies to classify skin undertone (Warm, Cool, Neutral) and personal color profile with confidence score.
- **Output:** Undertone, Personal Color, Skin Tone, Face Shape, Best Color Palette, Confidence Score.
- **Priority:** MUST

---

## Feature 2: Beauty Preference Questionnaire
- **Description:** Collect user preferences including Budget range, Finish preference (Matte, Dewy, Natural), Occasion (Daily, Office, Event), and Preferred Brands.
- **Priority:** MUST

---

## Feature 3: Recommendation Engine
- **Description:** Generate personalized product rankings based on undertone, budget, finish preference, and category.
- **Output:** Top product matches tailored to user's profile.
- **Priority:** MUST

---

## Feature 4: Explainable Recommendation
- **Description:** Display clear reasoning for each recommendation (e.g., "✓ Cool Undertone", "✓ Natural Finish", "✓ Fits Budget").
- **Priority:** MUST

---

## Feature 5: Affiliate Checkout
- **Description:** Redirect users directly to marketplace affiliate links (Shopee, TikTok Shop, Tokopedia) to complete purchase.
- **Priority:** MUST

---

## Feature 6: Product Comparison & Wishlist
- **Description:** Compare up to 3 products side-by-side or save favorite recommendations.
- **Priority:** SHOULD

---

# 6. Non-functional Requirements
- **Performance:** <5 sec AI processing, <2 sec page loading.
- **Security:** HTTPS, secure data handling, no unauthorized photo distribution.
- **Accessibility:** Responsive layout, touch-friendly UI, WCAG AA compliance.

---

# 7. User Flow
1. Landing / Creator Bio Page →
2. Upload Selfie or Take Photo →
3. AI Face & Undertone Analysis →
4. Beauty Preference Questionnaire (Budget, Finish, Brands) →
5. Personal Color Report & Best Color Palette →
6. Curated Product Matches with Explainable AI Tags →
7. Direct Affiliate Redirect to Marketplace.

---

# 8. Out of Scope (Explicitly Excluded for MVP)
- Medical skin diagnosis / Dermatology advice
- AR Virtual Try-On rendering
- Marketplace checkout & payment processing on-site
- Brand Analytics Dashboard (B2B SaaS portal)
- Logistics & Inventory management

---

# 9. Appendix & Glossary
- **Beauty Profile:** Structured AI output combined with user preferences.
- **Match Score:** Confidence score percentage representing how well a product fits the user.
- **Explainable Recommendation:** Visual tags explaining the AI matching logic to build buyer trust.
