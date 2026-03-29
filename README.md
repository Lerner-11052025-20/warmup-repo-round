# 🚀 SmartFlow Reimburse AI (V2.0)

**SmartFlow Reimburse AI** is a premium, enterprise-grade reimbursement management SaaS designed for modern corporate hierarchies. Built with the **MERN** stack and enhanced by **V2.0 Intelligence**, the platform delivers high-performance analytics, automated multi-stage approval workflows, and an integrated AI Career & Financial Assistant.

---

## ✨ Key Features (V2.0 Evolution)

### 🤖 SmartFlow Intelligence Layer
-   **OpenRouter Integration**: Native connection to the world's most capable LLMs (GPT-4o mini, Gemini).
-   **Role-Aware AI**: The assistant dynamically adapts its responses based on whether you are an **Admin**, **Manager**, or **Employee**.
-   **Platform Context**: AI can answer questions about your specific expenses, pending approvals, and company policies in real-time.

### 🧪 Approval Rules Engine V2.0
-   **Multi-Stage Orchestration**: Configure complex, multi-level approval sequences (e.g., *Direct Manager* → *Finance* → *CFO*).
-   **Sequential vs. Parallel Logic**: Toggle between strict serial flows or parallel consensus models.
-   **VIP Bypass & Thresholds**: Set approval percentages (e.g., 60% agreement) and assign VIP auto-approvers to accelerate high-priority expenses.

### 📊 Enterprise Analytics & Visualization
-   **Standard Normal Aesthetic**: A premium "high-gloss" design system using Glassmorphism and Neon accents.
-   **Financial Telemetry**: High-fidelity charts (Line, Bar, Pie, Stacked) visualizing spending trends, category distributions, and approval status ratios.
-   **Global Data Sync**: Real-time updates via Socket.IO for live expenditure tracking.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion, Lucide Icons, Recharts |
| **Backend** | Node.js, Express, MongoDB Atlas, JWT Authentication, Multer |
| **AI Engine** | OpenRouter API (GPT-4o mini / Gemini), Axios Proxy |
| **Assets** | Cloudinary (Image Hosting), Favicon V2.0 |
| **Real-time** | Socket.IO |

---

## 🚀 Local Installation & Setup

### 📦 Prerequisites
-   Node.js (v18+)
-   MongoDB Atlas Cluster
-   OpenRouter API Key

### 🛠️ 1. Backend Configuration
1.  Navigate to `/backend`:
    ```bash
    cd backend
    npm install
    ```
2.  Create a `.env` file and configure the variables:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    OPENROUTER_API_KEY=your_openrouter_key
    CLOUDINARY_CLOUD_NAME=dom61gprg
    CLOUDINARY_API_KEY=727277664599364
    CLOUDINARY_API_SECRET=eVR2sBn9Id0CfTZRNvRa1Ot8u98
    ```
3.  Start the server:
    ```bash
    npm run dev  # (or nodemon server.js)
    ```

### 🎨 2. Frontend Configuration
1.  Navigate to `/frontend`:
    ```bash
    cd frontend
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  The app will be available at `http://localhost:5173`.

---

## 📂 Project Structure

```bash
├── backend/
│   ├── controllers/      # Business logic (AI, Approvals, Expenses)
│   ├── models/           # Mongoose schemas (ApprovalRule V2.0, User, Expense)
│   ├── routes/           # API Endpoints
│   ├── middleware/       # JWT Auth & Error Handling
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # UI Components (AdminApprovalRules V2.0, ChatAssistant)
│   │   ├── services/     # API Axios instances
│   │   ├── pages/        # Main route views
│   │   └── index.css     # Global "Standard Normal" styling
│   └── index.html        # Entry point with Favicon V2.0
└── README.md
```

---

## 🛡️ Security & Performance
-   **Backend AI Proxy**: The OpenRouter API key is never exposed to the frontend; all AI traffic is proxied through a secure backend controller.
-   **JWT Protection**: Every API endpoint (including AI chat) is protected by multi-level role-based authorization.
-   **Lazy Loading**: Analytics charts and complex UI components are lazy-loaded to ensure sub-second initial page load times.

---

**Developed for the VIT Pune Reimbursement Innovation Challenge.** 🚀💎
