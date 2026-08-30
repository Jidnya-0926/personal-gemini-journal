<div align="center">

# 🧠 Personal Gemini Journal

### Your Private AI Space for Reflection, Insight & Personal Growth

**Write. • Reflect. • Understand. • Grow.**

<br>

<a href="https://personal-journal-491827.ai.studio">
<img src="https://img.shields.io/badge/🚀_OPEN_LIVE_APP-0A84FF?style=for-the-badge&labelColor=111111" />
</a>
&nbsp;
<a href="https://github.com/Jidnya-0926/personal-gemini-journal">
<img src="https://img.shields.io/badge/💻_SOURCE_CODE-24292F?style=for-the-badge&logo=github&logoColor=white" />
</a>

<br><br>

<img width="850" src="./img/thumbnail.png" alt="Personal Gemini Journal" />

</div>

---

## 📖 Overview

**Personal Gemini Journal** is a secure, AI-powered journaling and reflection application built with **Google Gemini, Firebase Authentication, Cloud Firestore, Express, React, and Google Cloud Run**.

Instead of simply storing journal entries, Gemini helps users:

* 💭 Explore their thoughts
* 🧠 Understand their reflections
* 🔍 Identify recurring themes
* 💡 Discover meaningful insights
* 🎯 Turn reflections into actionable steps
* 📈 Recognize personal growth signals
* 💬 Continue contextual multi-turn conversations

### Core Experience

**✍️ Write → 🧠 Reflect → 💡 Understand → 🎯 Act**

---

## 🎯 Problem

Traditional journaling apps mainly store what users write but provide limited help in understanding it.

Users may struggle to:

* Understand complicated thoughts
* Recognize recurring patterns
* Turn reflections into actions
* Track personal growth
* Ask meaningful follow-up questions
* Keep personal reflections private

> **Journaling stores the thought. AI helps the user understand it.**

---

## 💡 Solution

Personal Gemini Journal combines a **private journal with an AI reflection companion**.

Users can create a reflection session, have a contextual conversation with Gemini, save the session, and generate structured insights from the complete reflection.

---

## ✨ Key Features

### 🔐 Secure Authentication

* Firebase Authentication
* Google Sign-In
* User-specific Firebase UID
* Private user data isolation

### 💬 Multi-Turn Gemini Conversations

Users can continue contextual conversations with Gemini throughout a reflection session.

### 💾 Persistent Journal Sessions

Sessions are stored in Cloud Firestore and can be:

* Created
* Reopened
* Continued
* Accessed after refresh
* Accessed after signing back in

### 🧠 Reflection Insights

Gemini generates:

* 💡 **Key Insight** — central realization or lesson
* 💭 **Emotional Pattern** — strictly non-clinical observation
* 🔁 **Recurring Theme**
* 🎯 **Action for Tomorrow**
* 🌱 **Growth Signal**

### ✨ Session Synthesis

Provides a higher-level view of the complete session:

* Focus Title
* Key Themes
* Core Insight
* Perspective
* Actionable Takeaways

### 🔎 Reflection Search

Search previous reflections by keywords such as projects, learning, work, or stress.

### 🏷️ Mood Filtering

Organize reflections using categories such as:
**Reflective, Grateful, Calm, Energized, Creative, Challenged, Anxious, Accomplished.**

### 📋 Action Copy

Copy the generated **Action for Tomorrow** with one click.

### 📤 Journal Export

Export personal journal data as a JSON archive.

---

## 🏗️ Architecture

<div align="center">
<img width="850" src="./img/Architecture.jpg" alt="Personal Gemini Journal Architecture" />
</div>

```text
                    USER
                     │
                     ▼
              React + TypeScript
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   Firebase Auth          Cloud Firestore
   Google Sign-In         User Sessions
          │               Interactions
          │                Insights
          ▼                     │
      Express Backend ◄─────────┘
          │
          ▼
     Google Gemini
   ┌─────────────────┐
   │ Multi-Turn Chat │
   │ Insights        │
   │ Synthesis       │
   └─────────────────┘
          │
          ▼
     Google Cloud Run
```

---

## 🔄 Workflow

<div align="center">
<img width="850" src="./img/workflow.jpg" alt="Personal Gemini Journal Workflow" />
</div>

```text
1. Google Authentication
          ↓
2. Private Dashboard
          ↓
3. Create Reflection Session
          ↓
4. Write Reflection
          ↓
5. Gemini Conversation
          ↓
6. Save Session to Firestore
          ↓
7. Generate Insights + Synthesis
          ↓
8. Actionable Takeaways
          ↓
9. Journal Remains Available
```

---

## 🔐 Security

The application uses multiple security boundaries:

* **Firebase Authentication** for identity
* **Firebase UID-based data isolation**
* **Firestore owner-bound security rules**
* **Gemini API key stored server-side**
* **Environment variables for secrets**
* **`.gitignore` protection**
* **Request and JSON validation**
* **Input length limits**
* **Server-side sanitization**
* **AI fallback handling**

Firestore data follows the user-specific structure:

```text
/users/{uid}/sessions
/users/{uid}/interactions
/users/{uid}/insights
```

The Gemini API key is never exposed in frontend source code.

---

## 🧠 Technology Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Frontend       | React 19                |
| Language       | TypeScript              |
| Styling        | Tailwind CSS            |
| Build Tool     | Vite                    |
| Backend        | Node.js + Express       |
| AI             | Google Gemini           |
| Gemini SDK     | `@google/genai`         |
| Authentication | Firebase Authentication |
| Database       | Cloud Firestore         |
| Deployment     | Google Cloud Run        |
| Bundler        | esbuild                 |

---

## 📁 Project Structure

```text
personal-gemini-journal/
├── src/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── img/
│   ├── thumbnail.png
│   ├── Architecture.jpg
│   └── workflow.jpg
├── server.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### Prerequisites

* Node.js 20+
* npm
* Firebase / Google Cloud project
* Firebase Authentication with Google Sign-In
* Cloud Firestore
* Gemini API access

### 1. Clone

```bash
git clone https://github.com/Jidnya-0926/personal-gemini-journal.git
cd personal-gemini-journal
```

### 2. Install

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local` using `.env.example`.

```env
GEMINI_API_KEY="your-gemini-api-key"

PORT=3000
NODE_ENV="development"

VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

**Never commit real credentials or service-account files to GitHub.**

### 4. Run

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## ☁️ Deployment

The application is designed for **Google Cloud Run**.

```bash
gcloud run deploy personal-gemini-journal \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --port 3000
```

---

## 🌐 Live Application

🚀 **Live App:**
https://personal-journal-491827.ai.studio

💻 **Source Code:**
https://github.com/Jidnya-0926/personal-gemini-journal

---

## 🏆 Challenge Alignment

Built for the **Google Cloud Run AI Challenge**.

The project demonstrates:

* 🧠 Google Gemini integration
* 🔐 Firebase Authentication
* 🔑 Google Sign-In
* 🗄️ Cloud Firestore
* 👤 User data isolation
* 🔒 Secure API-key handling
* 💬 Multi-turn AI interaction
* ✨ Structured AI insights
* 📊 Session synthesis
* ☁️ Cloud Run deployment

---

## 🚀 Future Improvements

* 📊 Personal growth analytics
* 📈 Mood and reflection trends
* 🧠 Long-term pattern detection
* 🔍 Semantic journal search
* 📱 Improved mobile experience
* 🔔 External notifications
* 📅 Daily reflection reminders
* 🤖 More personalized recommendations

---

<div align="center">

## 🧠 Personal Gemini Journal

### Write. Reflect. Understand. Grow.

**Built with ❤️ using Google Gemini · React · Firebase · Express · Cloud Run**

⭐ If you like the project, consider giving it a star! ⭐

</div>
