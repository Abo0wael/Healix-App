# Healix App - AI-Powered Smart Healthcare Assistant 🏥✨

**Healix App** is a comprehensive, next-generation smart healthcare mobile application designed to simplify personal health management. Powered exclusively by **Groq AI**, Healix App provides real-time medical insights, medical report analysis, meal nutrition scanning, drug conflict detection, generic alternative finder, doctor discovery, medication reminders with audio alarms, family & caregiver portal with real-time push notifications, and emergency assistance—all with full multilingual (Arabic & English) and theme customization support.

---

## 🌟 Key Features

### 💬 1. Helix AI Medical Assistant
- Intelligent medical chatbot powered by **Groq AI** providing instant guidance on health inquiries and symptoms.
- Context-aware responses with safety disclaimers and localized medical recommendations.
- Interactive conversational interface with history tracking.

### 📋 2. Medical Report & Prescription Scanner
- Scan or upload lab test results, radiology reports, or doctor prescriptions.
- Powered by **Groq AI Vision** to extract complex medical terms and provide easy-to-understand explanations.
- Highlights abnormal indicators and offers actionable health advice.

### 👨‍👩‍👧 3. Caregiver & Family Portal
- Link patient profiles with family members and caregivers for remote health monitoring (`app/caregiver-portal.tsx`).
- Real-time **Push Notifications** (`lib/pushNotifications.ts`) notifying caregivers instantly when medication doses are marked as taken or missed, or when emergency alerts are triggered.

### 🥗 4. Meal & Nutrition AI Analyzer
- Take a photo of your meal or upload an image to receive detailed nutritional insights via **Groq AI Vision**.
- Calculates estimated calories, macro distribution (carbs, proteins, fats).
- Tailored nutritional feedback based on individual health goals.

### 💊 5. Drug Conflict & Alternative Finder
- **Conflict Detection**: Verifies interactions between multiple medications powered by **Groq AI** to prevent adverse reactions.
- **Generic Alternatives**: Finds equivalent and cost-effective active-ingredient substitutes for prescribed drugs.
- Detailed dosage notes, side-effect warnings, and precautions.

### 👨‍⚕️ 6. Doctor Finder & Appointment Booking
- Browse healthcare specialists by category (Cardiology, Dermatology, Pediatrics, Neurology, etc.).
- Filter by doctor rating, location, and fees (`app/doctors/list.tsx`, `app/doctors/[id].tsx`).
- Schedule and manage appointments directly within the app.

### ⏰ 7. Medication Reminders & Interactive Alarm Overlay
- Schedule daily or custom recurring medication reminders.
- **Custom Alarm Overlay** (`components/AlarmOverlay.tsx`) with sound effects (`assets/sounds/alarm.wav` / `alarm.ogg`) ensuring dosages are never missed.
- Automated caregiver status updates upon dose completion.

### 🚨 8. Emergency SOS
- Quick emergency trigger sending instant notifications to linked family caregivers.
- Direct dialer integration (`911` / local emergency service).

### 🌐 9. Multilingual & Theme Personalization
- Full **Arabic (العربية)** and **English** localization with Right-to-Left (RTL) layout adaptation (`lib/i18n.ts`, `components/LanguageSwitcher.tsx`).
- **Dark Mode & Light Mode** seamless context switching (`lib/ThemeContext.tsx`, `components/ThemeSwitcher.tsx`).

---

## 🏗️ Architecture & Tech Stack

```
Healix App
 ├── Frontend (Mobile App - React Native & Expo Router)
 └── Backend API (Node.js REST API - Groq AI API Engine)
```

| Layer | Technology |
| :--- | :--- |
| **Mobile Frontend** | React Native, Expo (~54.0), TypeScript, Expo Router |
| **UI & Styling** | Custom Design System, React Native Reanimated, Expo Vector Icons |
| **Backend Framework** | Node.js, Express.js (ES Modules) |
| **AI Integration** | **Groq AI API Engine** (`GROQ_API_KEY` - Llama-3.3 & Vision Models) |
| **Database & Auth** | Firebase Authentication & Firestore (`lib/firebase.ts`) |
| **Push Notifications** | Expo Push Notification Service (`lib/pushNotifications.ts`) |
| **Localization & State** | `i18n-js`, React Context API (`ThemeContext`), AsyncStorage |

---

## 📦 Dependencies & Requirements

Detailed package versions and specifications are listed in [requirements.txt](./requirements.txt) and [backend/requirements.txt](./backend/requirements.txt).

### 📱 Frontend Dependencies (Expo / React Native)

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `expo` | `~54.0.32` | Core Expo Mobile App Framework |
| `react` | `19.1.0` | React UI Library |
| `react-native` | `0.81.5` | Mobile Application Engine |
| `expo-router` | `~6.0.22` | File-based Routing & Screen Navigation |
| `firebase` | `^12.8.0` | User Authentication & Cloud Firestore Database |
| `i18n-js` | `^4.5.1` | Multilingual Support (Arabic & English RTL) |
| `@react-native-async-storage/async-storage` | `2.2.0` | Local Persistent Data Storage |
| `expo-notifications` | `~0.32.16` | Remote & Local Push Notifications for Medication & Caregivers |
| `expo-av` | `~16.0.8` | Audio Sound Player for Alarm Overlay |
| `expo-image-picker` | `~17.0.10` | Meal & Report Image Upload Scanner |
| `react-native-reanimated` | `~4.1.1` | Fluid UI Animations & Transitions |

### ⚙️ Backend Dependencies (Node.js REST API)

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `express` | `^4.22.1` | Backend REST API Web Server |
| `cors` | `^2.8.6` | Cross-Origin Middleware |
| `dotenv` | `^16.6.1` | Environment Variable Management |
| `Groq AI API` | Cloud API Engine | Llama-3.3 & Vision Models for Chatbot, Meal Analysis, Drug Conflicts & Report OCR |

---

## 📁 Repository Structure

```
Healix App/
├── app/                        # Expo Router Pages & Navigation
│   ├── (tabs)/                 # Main Bottom Tab Screens (Home, Explore, Search, Services)
│   ├── caregiver-portal.tsx    # Family & Caregivers Link Screen
│   ├── doctors/                # Doctor Listing & Detail Screens (`list.tsx`, `[id].tsx`)
│   ├── helix-chat.tsx          # Helix AI Chat Screen
│   ├── medical-report.tsx      # Medical Report & Prescription Scanner Screen
│   ├── meal-analysis.tsx       # AI Nutrition Analyzer Screen
│   ├── drug-conflict.tsx       # Medication Conflict Detection Screen
│   ├── drug-alternative.tsx    # Generic Alternatives Screen
│   ├── add-reminder.tsx        # Medication Reminder Screen
│   ├── emergency-sos.tsx       # SOS Emergency Screen
│   ├── login.tsx / signup.tsx  # Authentication Screens
│   └── _layout.tsx             # Root Provider & Navigation Stack
├── backend/                    # Node.js Express REST API Backend
│   ├── server.js               # Express Server & Route Handlers
│   ├── ai-service.js           # Groq AI Service & Drug Interaction Matching
│   ├── chat-service.js         # Groq Chatbot Engine Service
│   └── report-analysis-service.js # Groq Vision Medical Report Service
├── components/                 # Reusable Components (AlarmOverlay, LanguageSwitcher, ThemeSwitcher)
├── constants/                  # Colors, Design Tokens & Doctor Specialties Data
├── lib/                        # Services, Storage, Push Notifications, Theme & i18n
├── locales/                    # En & Ar Translation Dictionaries (`en.ts`, `ar.ts`)
├── assets/                     # Audio Sounds (`alarm.wav`, `alarm.ogg`), Icons & Splashes
├── eas.json                    # Expo Application Services Build Config
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
   PORT=3000
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   *The backend will run on `http://localhost:3000` (or host IP).*

---

### 2. Frontend Setup

1. From the project root directory, install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:3000
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
