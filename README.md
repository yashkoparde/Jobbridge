# JobBridge - Professional Full-Stack Job Portal Management System

**JobBridge** is a high-performance, light-themed full-stack job portal designed for streamlining employee recruitment. Built using **React + Vite** on the frontend, and a **Node.js + Express** server on the backend, it serves as a secure, fast bridge connecting Job Seekers, Employers, and System Administrators.

---

## 🎨 Visual Philosophy & Theme
- **Clean Contrast**: Built on strict white backgrounds paired with light gray details and deep charcoal text (`text-gray-900`/`text-gray-950`).
- **Professional Accents**: Elevated with modern blue highlights (`text-blue-600`/`bg-blue-600`) representing stability and focus.
- **Tensionless Layouts**: Avoids tech-slop, glassmorphism, or neon flashes, favoring spacious grids, beautiful card padding boundaries, and elegant typography pairing **Inter** (sans-serif text) with **JetBrains Mono** (status codes and numbers).

---

## 🏛️ Directory Structure
```text
/
├── server.ts                 # Core Express Node.js and static files hosting server
├── commands.sql              # Master SQL DB Schema dump (Tables, RLS, Storage Buckets)
├── package.json              # System configuration and dependency parameters
├── metadata.json             # Application framing and permissions metadata
├── .env.example              # Self-explanatory environment configurations
├── README.md                 # Setup walkthrough and operation guides
├── src/
│   ├── main.tsx              # React client entry point
│   ├── App.tsx               # Primary Client State Core and SPA view router
│   ├── index.css             # Stylesheet configuration with Tailwind v4 & font imports
│   ├── types.ts              # System-wide type-safe declarations
│   ├── components/           # Reusable interactive layout elements
│   │   ├── Navbar.tsx        # Responsive header with mobile rollouts
│   │   ├── Footer.tsx        # Footer anchor linkages
│   │   └── Notification.tsx  # Dynamic success/error slide toast banners
│   └── pages/                # Individual page views
│       ├── LandingPage.tsx   # Visual corporate introduction deck
│       ├── AboutPage.tsx     # Mission and milestones statements
│       ├── ContactPage.tsx   # Interactive inquiry support desk
│       ├── JobListingsPage.tsx # Advanced multi-filter search and pagination
│       ├── JobDetailsPage.tsx  # Job specifications & interactive PDF application desk
│       ├── LoginPage.tsx     # Session selector and validation controls
│       ├── RegisterPage.tsx  # Quick onboarding controls by context roles
│       ├── ProfilePage.tsx   # адаptive profile settings pane (Personal vs. Company)
│       ├── EmployerDashboard.tsx # Recruiter statistics, job launches, and pipeline decision pipelines
│       ├── EmployeeDashboard.tsx # Candidate tracking dashboard and saved opportunities
│       └── AdminDashboard.tsx # All-powerful admin security dashboard
```

---

## 🔒 User Roles & Feature Sets
1. **Candidate (Employee)**:
   - Onboard & login via dedicated role views.
   - Search and filter jobs using multi-tier parameters (Title search, Category choice, Salary tiers, Experience required, Office location).
   - Instant-save postings to saved opportunity panels.
   - Upload PDF resumes and write custom cover letters (with client-validated inputs).
   - Track application status real-time on personal metrics.
2. **Employer**:
   - Customize Company Profile catalogs (Company name, description, website, HQ location, logo graphic links).
   - Post, edit, close, or delete job postings instantly.
   - View active applicants with full cover letter details and downloadable PDF files.
   - Decide pipelines by clicking 'Accept' or 'Reject' links on applicants in real-time.
3. **Administrator (Command Panel)**:
   - Track live statistics (Users registry, global listings volume, database transmissions).
   - Audit all users. Toggle account statuses (Suspend or Reactivate) with high-security blocks avoiding self-suspension.
   - Audit and Moderate Job postings by deleting inappropriate vacancies.
   - Surveillance of all global application submissions.

---

## 🗄️ Database Schemas Configuration (Supabase PostgreSQL)
All definitions are saved inside the `/commands.sql` script. It represents five linked entities:
- **`users`**: Primary login records.
- **`companies`**: Details allocated to employers.
- **`jobs`**: Active and archived postings.
- **`applications`**: Bound Candidate-Position transmission records.
- **`saved_jobs`**: Bound candidate bookmark indicators.

---

## 🚀 Setting Up Supabase & Environments

### Step 1: SQL Setup
1. Log in to your [Supabase Dashboard](https://supabase.com).
2. Create a new project.
3. Open the **SQL Editor** from the left-hand sidebar.
4. Copy the entire contents of `commands.sql` (located in the project root) and paste it into the editor.
5. Click **Run** to generate the database structures.

### Step 2: Configure Environment Variables
Create a file named `.env` in the root of your project using the variables outlined in `.env.example`:
```env
# URL of your Supabase hosted instance
SUPABASE_URL="https://your-supabase-project.supabase.co"

# Public anon key
SUPABASE_ANON_KEY="your-supabase-anon-key"
```

---

## 🛠️ Local Execution

The portal features a **high-fidelity local in-memory database engine** that activates automatically if Supabase keys are not configured yet. This allows instant preview and testing of all registrations, logins, postings, applications, and admin panels.

### Initial Installation
To install core libraries:
```bash
npm install
```

### Dev Mode
Starts the high-speed Express and Vite middleware:
```bash
npm run dev
```
The application will boot up and run on port `3000`.

### Production Compilation
Transpiles both frontend assets and backend TS entry points into the `dist/` directory:
```bash
npm run build
```

### Run Production Build
Starts the bundled, high-performance static server wrapper:
```bash
npm run start
```
