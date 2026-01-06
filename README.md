# 🏃‍♂️ Sports Companion Web App
🔗 **Live Demo:** [https://sports-companion-app.vercel.app/](https://sports-companion-app.vercel.app/)
A modern, full-stack **Sports Companion Web Application** designed to help athletes and fitness enthusiasts **track health metrics, workouts,
goals, and performance analytics** — all powered by **Supabase** and built with a clean, aesthetic UI.



## 🚀 Overview
Sports Companion is a personalized fitness & sports tracking platform that allows users to:
* Manage their fitness profile
* Log workouts and body metrics
* Track BMI trends over time
* Set fitness goals and visualize progress
* Analyze weekly activity using interactive charts
The application is designed with **real-world usability**, **secure authentication**, and **scalable backend architecture** in mind.



## ✨ Key Features

### 🔐 Authentication & User Management
* Secure **Sign Up / Sign In**
* **Forgot Password** & email-based recovery
* Session handling via Supabase Auth
* User-specific data isolation using Row Level Security (RLS)

### 👤 Profile Management
* Store personal details (name, gender, DOB, height, sport type, experience)
* Used as a base for BMI & analytics calculations
* Editable and persistent across sessions

### ⚖️ BMI Tracker
* Log weight entries
* Automatic BMI calculation using height from profile
* BMI history with timestamps
* Visual BMI trend charts
* Input validation (no negative or invalid values)

### 🏋️ Workout Logging
* Log workout sessions with:
  * Sport type
  * Duration
  * Intensity
  * Calories burned
  * Distance covered
* Full validation (no negative values)
* Workout history per user
* Integrated with analytics

### 🎯 Goals & Progress Tracking
* Create fitness goals (e.g., weight loss, muscle gain)
* Track **real progress** using start, current, and target values
* Dynamic progress bar
* Auto-completion of goals when targets are achieved
* Active & completed goal sections

### 📊 Analytics Dashboard
* Weekly workout summary
* Calories burned & duration stats
* Sport type distribution (Pie Chart)
* BMI & weight trend visualization (Line Chart)
* Clean, color-coded charts for clarity



## 🧑‍💻 Tech Stack
### Frontend
* **Next.js (App Router)**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **shadcn/ui**
* **Recharts** (data visualization)
* **Lucide Icons**

### Backend & Database
* **Supabase**
  * Authentication
  * PostgreSQL database
  * Row Level Security (RLS)
  * Foreign keys & constraints
  * SQL policies for data protection

### Deployment
* **Vercel**
* Environment variables configured for production
* CI/CD via GitHub → Vercel integration



## 🔒 Backend Highlights (Supabase)
* Fully normalized PostgreSQL schema
* Tables:
  * `profiles`
  * `bmi_records`
  * `workout_sessions`
  * `goals`
* Row Level Security policies ensure:
  * Users only access their own data
  * Secure inserts, updates, deletes
* Server-side calculated metrics for reliability



## 🖼 UI & UX Highlights
* Clean, modern color palette
* Responsive design (mobile + desktop)
* Smooth transitions and animations
* Consistent spacing & layout
* Accessibility-friendly inputs and forms



## 📁 Project Structure (High Level)
```
app/
 ├─ auth/
 ├─ dashboard/
 │   ├─ profile/
 │   ├─ bmi/
 │   ├─ workouts/
 │   ├─ goals/
 │   └─ analytics/
 ├─ components/
 ├─ lib/
 │   └─ supabase/
 └─ globals.css
```

## 🧪 Validation & Reliability
* Frontend validation (no negative values, required fields enforced)
* Backend constraints & checks
* Safe calculations (no NaN / overflow issues)
* Error handling & fallback states



## 🔮 Future Roadmap

### 🎮 Sports Matchup Simulation (Planned)
* Animated sports simulations (e.g., **Badminton**, **Tennis**, **Table Tennis**)
* Two players enter:
  * Height
  * Weight
  * Age
  * Experience level
* BMI & physical metrics comparison

### 🤖 ML-Powered Compatibility Analysis
* Machine Learning model to:
  * Analyze physical stats
  * Predict fairness of matchup
  * Detect dominance probability
* Output:
  * Fair match / Unbalanced match
  * Strength & weakness insights

### 📈 Advanced Analytics
* Injury risk indicators
* Performance forecasting
* Personalized recommendations

### 🌐 Social Features
* Friend comparisons
* Leaderboards
* Match history tracking


## 🧠 Learning Outcomes
This project demonstrates:
* Real-world full-stack development
* Secure backend design
* Data-driven UI development
* Clean React & Next.js architecture
* Production deployment workflow


## 📌 Status
✅ **Actively Developed**
🚀 **Deployed & Functional**
🔧 **Scalable for future ML integrations**
