# Healix App - AI-Powered Smart Healthcare Assistant 🏥✨

**Healix App** is a comprehensive, next-generation smart healthcare mobile application designed to simplify personal health management. Powered by **Groq / Grok AI**, Healix App provides real-time medical insights, medication safety tracking, report analysis, nutrition scanning, doctor discovery, and emergency assistance—all with full multilingual (Arabic & English) and theme customization support.

---

## 🌟 Key Features

### 💬 1. Helix AI Medical Assistant
- Intelligent medical chatbot powered by **Groq / Grok AI** providing instant guidance on health inquiries and symptoms.
- Context-aware responses with safety disclaimers and medical recommendations.
- Interactive and localized conversational interface.

### 📋 2. Medical Report & Prescription Scanner
- Scan or upload lab test results, radiology reports, or doctor prescriptions.
- Powered by **Groq AI Vision** to extract complex medical terms and provide easy-to-understand explanations.
- Highlights abnormal indicators and offers actionable health advice.

### 🥗 3. Meal & Nutrition AI Analyzer
- Take a photo of your meal or upload an image to receive detailed nutritional insights.
- Calculates estimated calories, macro distribution (carbs, proteins, fats).
- Tailored nutritional feedback based on individual health goals.

### 💊 4. Drug Conflict & Alternative Finder
- **Conflict Detection**: Verifies interactions between multiple medications to prevent adverse reactions.
- **Generic Alternatives**: Finds equivalent and cost-effective active-ingredient substitutes for prescribed drugs.
- Detailed dosage notes, side-effect warnings, and precautions.

### 👨‍⚕️ 5. Doctor Finder & Appointment Booking
- Browse healthcare specialists by category (Cardiology, Dermatology, Pediatrics, Neurology, etc.).
- Filter by doctor rating, location, and fees.
- Schedule and manage appointments directly within the app.

### ⏰ 6. Medication Reminders & Alarm Alerts
- Schedule daily or custom recurring medication reminders.
- Custom alarm overlay with audio notifications (`assets/sounds/alarm.wav`) ensuring dosages are never missed.
- Local notification triggers.

### 🚨 7. Emergency SOS
- Quick emergency trigger for immediate assistance.
- Pre-configured emergency contacts and one-tap emergency calling.
- Shares real-time GPS location during emergencies.

### 🌐 8. Multilingual & Theme Personalization
- Full **Arabic (العربية)** and **English** localization with Right-to-Left (RTL) layout adaptation (`lib/i18n.ts`).
- **Dark Mode & Light Mode** seamless context switching (`lib/ThemeContext.tsx`).

---

## 🏗️ Architecture & Tech Stack

```
Healix App
 ├── Frontend (Mobile App - React Native & Expo Router)
 └── Backend API (Node.js & Express - Groq / Grok AI API)
```

| Layer | Technology |
| :--- | :--- |
| **Mobile Frontend** | React Native, Expo (~54.0), TypeScript, Expo Router |
| **UI & Styling** | Custom Design System, React Native Reanimated, Expo Vector Icons |
| **Backend Framework** | Node.js, Express.js (ES Modules) |
| **AI Integration** | **Groq / Grok AI API** (`GROQ_API_KEY` - Llama & Vision Models) |
| **Database & Auth** | Firebase Authentication & Firestore (`lib/firebase.ts`) |
| **Localization & State** | `i18n-js`, React Context API (`ThemeContext`), AsyncStorage |

---

## 📁 Repository Structure

```
Healix App/
├── app/                        # Expo Router Pages & Navigation
│   ├── (tabs)/                 # Main Bottom Tab Screens (Home, Explore, Search, etc.)
│   ├── doctors/                # Doctor Listing & Detail Screens
│   ├── helix-chat.tsx          # Helix AI Chat Screen
│   ├── medical-report.tsx      # Medical Report Analysis Screen
│   ├── meal-analysis.tsx       # AI Nutrition Analyzer Screen
│   ├── drug-conflict.tsx       # Medication Conflict Detection Screen
│   ├── drug-alternative.tsx    # Generic Alternatives Screen
│   ├── add-reminder.tsx        # Medication Reminder Screen
│   ├── emergency-sos.tsx       # SOS Emergency Screen
│   ├── login.tsx / signup.tsx  # Authentication Screens
│   └── _layout.tsx             # Root Provider & Navigation Stack
├── backend/                    # Node.js Express REST API Backend
│   ├── server.js               # Express Server & Route Handlers
│   ├── ai-service.js           # Groq AI Service & Drug Alias Matching
│   ├── chat-service.js         # Groq Chatbot Engine Service
│   └── report-analysis-service.js # Groq Vision Medical Report Service
├── components/                 # Reusable Components (AlarmOverlay, Switchers, etc.)
├── constants/                  # Colors, Design Tokens & Doctor Specialties Data
├── lib/                        # Services, Storage, Theme & i18n Configuration
├── locales/                    # En & Ar Translation Dictionaries
├── assets/                     # Sound Effects, App Icons & Splashes
└── requirements.txt            # Project Dependencies & Version Specifications
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on your mobile device (or Android Studio / Xcode for emulators)

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   *The backend will run on `http://localhost:5000` (or host IP).*

---

### 2. Frontend Setup

1. From the project root directory, install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   ```

3. Start the Expo development server:
   ```bash
   npm run start
   ```
   *Or `npm run start:online` for Expo Go tunnel.*

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">Made with ❤️ for better health and smart healthcare management with Healix App.</p>
