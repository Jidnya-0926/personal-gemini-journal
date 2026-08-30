# Personal Gemini Journal

A secure, production-ready AI journaling and personal reflection application built with **Google Gemini**, **Firebase Authentication (Google Sign-In)**, **Cloud Firestore (Strict User Isolation)**, **Express**, and **React**.

---

## 1. Project Overview & Architecture

Personal Gemini Journal provides a private, focused space for self-reflection, thought untangling, creative brainstorming, and personal growth. Every interaction is securely analyzed by Gemini to provide empathetic reflections and automated structured session summaries (identifying core themes, emotional tone, breakthrough insights, and actionable self-care items).

### Architectural Boundaries

```
┌────────────────────────────────────────────────────────┐
│                   Client Browser                       │
│  - React 19 + Tailwind CSS + Lucide Icons              │
│  - Firebase Auth (Google Sign-In Popup)                │
│  - Direct Owner-Bound Cloud Firestore Access           │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
 (Firestore Rules Enforced)         (Encrypted API)
               │                          │
               ▼                          ▼
┌───────────────────────────┐  ┌──────────────────────────┐
│      Cloud Firestore      │  │     Express Backend      │
│  /users/{uid}/sessions/*  │  │  - /api/chat             │
│  /users/{uid}/            │  │  - /api/summarize        │
│    interactions/*         │  │  - /api/insights         │
│  /users/{uid}/insights    │  │  - Model Fallback Engine │
└───────────────────────────┘  └──────────┬───────────────┘
                                          │ (Server Secrets Only)
                                          ▼
                               ┌──────────────────────────┐
                               │     Google Gemini API    │
                               │  - Multi-Turn Reflection │
                               │  - Structured Synthesis  │
                               └──────────────────────────┘
```

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, React Markdown.
- **Backend / API**: Node.js, Express, tsx, esbuild.
- **AI / LLM Engine**: `@google/genai` with automatic fallback sequence (`gemini-2.5-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`).
- **Identity & Authentication**: Firebase Authentication (Google OAuth).
- **Database & Persistence**: Google Cloud Firestore with owner-isolated security partitions (`/users/{uid}/*`).
- **Hosting / Deployment Target**: Google Cloud Run.

---

## 3. Threat Model & Security Architecture

| Risk Zone | Attack Vector | Enforced Mitigation |
| :--- | :--- | :--- |
| **Input Surfaces** | Malicious injection, oversized payloads | Server-side request sanitization, length caps (4,000 chars/turn), and strict JSON payload validation. |
| **Authentication** | Spoofed identity or unauthenticated access | Authenticated Firebase Google Sign-In with validated UID context. |
| **Database Isolation** | Cross-user data harvesting | Firestore Security Rules strictly enforcing `request.auth.uid == userId` on `/users/{userId}/*`. |
| **Secret Management** | Gemini API key exposure | API keys are kept strictly on the trusted Express server (`process.env.GEMINI_API_KEY`) and never bundled in client JavaScript. |
| **AI Resilience** | Rate limits or 429/500 outages | Reusable `generateContentWithFallback` function dynamically cascading through alternative models. |

---

## 4. Firestore Security Rules

Deploy the following owner-bound rules in your Firebase project:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // User profile and private subcollections
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User journal sessions
      match /sessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // User interactions & reflection turns
      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 5. Local Setup & Configuration

### Prerequisites
- Node.js 20+
- npm or bun
- A Google Cloud / Firebase project with Firestore and Google Sign-In enabled.

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` or `.env.local` (see `.env.example`):
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   NODE_ENV="development"
   
   # Optional: Client-side Firebase credentials for standalone deployments
   VITE_FIREBASE_API_KEY="your-firebase-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

3. If running locally with `firebase-applet-config.json`, ensure it is present in the root directory (note: this file is automatically excluded from git by `.gitignore`).

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 6. Google Cloud Run Deployment

### Secret Manager Setup
Create and grant access to the Gemini API Key secret in Google Cloud Secret Manager:

```bash
# 1. Create Secret
gcloud secrets create GEMINI_API_KEY --data-file=- <<< "your-gemini-api-key"

# 2. Grant Secret Accessor permission to the default compute service account
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### Cloud Run Deployment Command

```bash
# Build & Deploy to Cloud Run
gcloud run deploy personal-gemini-journal \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --port 3000

# Attach challenge campaign tracking label (if participating)
gcloud run services update personal-gemini-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region us-central1
```

---

## 7. Testing & Verification Checklist

1. **Landing Page**: Verify clean typography, responsive layout, feature pillars, and Google sign-in button.
2. **Google Sign-In**: Click "Continue with Google", complete authentication, and verify seamless redirect to the dashboard.
3. **Private Dashboard**: Verify user display name, avatar, and security badge in the navigation bar.
4. **Multi-Turn Gemini Dialogue**: Submit a reflection prompt (e.g., "Help me reflect on today's decisions"). Verify empathetic AI response rendering with Markdown.
5. **Firestore Persistence**: Verify the interaction is saved under `/users/{uid}/interactions` with a real-time "Isolated & Saved" status indicator.
6. **Session Synthesis & Reflection Insights**:
   - Click "Synthesis" to generate high-level session takeaways.
   - Click "Reflection Insights" to generate 5 deep analysis points: **Key Insight**, **Emotional Pattern** (strictly non-clinical observation), **Recurring Theme**, **Action for Tomorrow** (with 1-click clipboard copy), and **Growth Signal**.
7. **Insight Persistence & Regeneration**: Verify insights are saved under `/users/{uid}/sessions/{sessionId}` and can be regenerated or reviewed upon reloading.
8. **Reload Persistence**: Refresh the browser page. Confirm all sessions, insights, and previous interactions reload intact.
9. **Sign Out & Sign Back In**: Sign out, sign in with the same account, and verify all past data remains accessible.
10. **Data Export**: Click "Export Personal Journal" and verify the full JSON archive downloads with all sessions and interactions.
