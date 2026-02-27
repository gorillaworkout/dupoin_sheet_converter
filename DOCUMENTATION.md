# Dupoin Dashboard — Technical Documentation

## 📋 Overview

**Dupoin Dashboard** is an internal HR management + financial reporting tool for Dupoin Group. It connects to **Lark Base** (HR data) and **Xero** (financial reports) and presents them in a unified dark-themed dashboard.

**Live URL:** https://hr-app.gorillaworkout.id  
**Repository:** https://github.com/gorillaworkout/dupoin_sheet_converter  
**Tech Stack:** Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui + Prisma 5 + PostgreSQL 16

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER (User)                     │
│              hr-app.gorillaworkout.id                 │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS (443)
                       ▼
┌──────────────────────────────────────────────────────┐
│              NGINX (Reverse Proxy)                    │
│         /etc/nginx/sites-available/hr-app             │
│         SSL via Let's Encrypt (Certbot)               │
└──────────────────────┬───────────────────────────────┘
                       │ proxy_pass :3001
                       ▼
┌──────────────────────────────────────────────────────┐
│        Docker: dupoin-dashboard (:3001→:3000)         │
│        Node 22 Alpine + Next.js 16                    │
│                                                       │
│  ┌─── Frontend (Dashboard Pages) ──────────────────┐ │
│  │  /dashboard           → Overview + Stats         │ │
│  │  /dashboard/employees → Employee list + CRUD     │ │
│  │  /dashboard/manpower  → Manpower requests        │ │
│  │  /dashboard/recruitment → Recruitment tracking   │ │
│  │  /dashboard/candidates → Candidate management    │ │
│  │  /dashboard/onboarding → Onboarding checklist    │ │
│  │  /dashboard/offboarding → Offboarding process    │ │
│  │  /dashboard/hr        → HR Pipeline overview     │ │
│  │  /dashboard/xero      → Financial reports        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─── API Routes (Backend) ────────────────────────┐ │
│  │  /api/employees      → Lark Base CRUD           │ │
│  │  /api/manpower       → Lark Base CRUD           │ │
│  │  /api/recruitment    → Lark Base CRUD           │ │
│  │  /api/candidates     → Lark Base CRUD           │ │
│  │  /api/onboarding     → Lark Base CRUD           │ │
│  │  /api/offboarding    → Lark Base CRUD           │ │
│  │  /api/pipeline       → Aggregated HR stats      │ │
│  │  /api/xero/*         → Xero OAuth + reports     │ │
│  └──────────────────────────────────────────────────┘ │
└──────────┬───────────────────────┬───────────────────┘
           │                       │
           ▼                       ▼
┌─────────────────┐    ┌────────────────────┐
│  Lark Base API   │    │  Docker: postgres   │
│  (jp.larksuite)  │    │  Port 5432 internal │
│  6 tables, CRUD  │    │  Network: dupoin-net│
└─────────────────┘    └────────────────────┘
                               │
                       ┌───────┴────────┐
                       │  Xero OAuth2   │
                       │  (api.xero.com)│
                       └────────────────┘
```

---

## 📁 Project Structure

```
dupoin_sheet_converter/
├── prisma/
│   └── schema.prisma            # Database schema (6 Xero tables)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (dark theme, Inter font)
│   │   ├── page.tsx             # Landing/redirect to dashboard
│   │   ├── api/
│   │   │   ├── employees/       # GET, POST, PUT, DELETE → Lark Base
│   │   │   ├── manpower/        # GET, POST, PUT, DELETE → Lark Base
│   │   │   ├── recruitment/     # GET, POST, PUT, DELETE → Lark Base
│   │   │   ├── candidates/      # GET, POST, PUT, DELETE → Lark Base
│   │   │   ├── onboarding/      # GET, POST, PUT, DELETE → Lark Base
│   │   │   ├── offboarding/     # GET, POST, PUT, DELETE → Lark Base
│   │   │   ├── pipeline/        # GET → Aggregated stats from all tables
│   │   │   └── xero/
│   │   │       ├── init/        # POST → Start Xero OAuth flow
│   │   │       ├── callback/    # GET → Handle OAuth callback, save tokens
│   │   │       ├── status/      # GET → Check Xero connection status
│   │   │       ├── balance-sheet/ # GET → Fetch Balance Sheet report
│   │   │       ├── profit-loss/ # GET → Fetch P&L report
│   │   │       └── sync/        # POST → Sync Xero data to PostgreSQL
│   │   └── dashboard/
│   │       ├── layout.tsx       # Dashboard shell (sidebar + header)
│   │       ├── page.tsx         # Overview with stats cards
│   │       ├── employees/       # Employee table + detail + CRUD
│   │       ├── manpower/        # Manpower requests + detail
│   │       ├── recruitment/     # Recruitment tracking + detail
│   │       ├── candidates/      # Candidate management + detail
│   │       ├── onboarding/      # Onboarding checklist + detail
│   │       ├── offboarding/     # Offboarding process + detail
│   │       ├── hr/              # HR Pipeline overview (all tables)
│   │       └── xero/            # Xero financial dashboard
│   ├── components/
│   │   ├── dashboard/           # Shared dashboard components
│   │   │   ├── sidebar.tsx      # Navigation sidebar
│   │   │   ├── header.tsx       # Top header bar
│   │   │   ├── stats-cards.tsx  # Stats counter cards
│   │   │   ├── form-dialog.tsx  # Reusable CRUD form modal
│   │   │   └── delete-dialog.tsx # Delete confirmation modal
│   │   ├── sheets/              # Original Excel/CSV features
│   │   │   ├── file-upload.tsx  # File upload component
│   │   │   ├── sheet-editor.tsx # Spreadsheet editor
│   │   │   ├── chart-grid.tsx   # Chart layout
│   │   │   └── row-chart.tsx    # Row-level chart
│   │   ├── providers/
│   │   │   └── theme-provider.tsx # Dark/light theme toggle
│   │   └── ui/                  # shadcn/ui components (17 components)
│   ├── lib/
│   │   ├── lark.ts              # Lark Base API client (auth, CRUD, pagination)
│   │   ├── xero.ts              # Xero OAuth2 + report fetching
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── field-mappings.ts    # Lark field → app field mappings (all 6 tables)
│   │   ├── employee-form-fields.ts # Employee form dropdown definitions
│   │   └── utils.ts             # Utility functions (cn, etc.)
│   └── types/
│       ├── employee.ts          # Employee type definitions
│       ├── hr.ts                # HR pipeline type definitions
│       └── sheets.ts            # Sheet/Excel type definitions
├── Dockerfile                   # Node 22 Alpine + Prisma + Next.js
├── package.json
└── tsconfig.json
```

---

## 🔌 Data Sources

### 1. Lark Base (HR Data)

All HR data lives in **Lark Base** (Lark's spreadsheet/database product). The app connects via Lark Open API.

**Lark App:** `cli_a91100da02b8de1a` (on `jp.larksuite.com`)  
**Base Token:** `Dg3WbbHcPa5kmJseHoHjCGWMpC5`

| Table | Table ID | Records | Description |
|-------|----------|---------|-------------|
| Employee | `tblCjXA8BJsLq6uG` | ~483 | All employees (active/inactive) |
| Manpower | `tbl7xBEUnERcmVrg` | — | Manpower/headcount requests |
| Recruitment | `tblXuYd2kC3RvSaB` | — | Recruitment progress tracking |
| Candidate | `tblU5lxajR8BeN05` | — | Candidate profiles & evaluations |
| Onboarding | `tbl0FrUUTLbd0iiz` | — | New hire onboarding checklist |
| Offboarding | `tblX7yHGGie6annA` | — | Employee exit process |

**How Lark API works (`src/lib/lark.ts`):**
1. Get tenant access token via `app_id` + `app_secret`
2. Token cached in memory with TTL (auto-refresh)
3. CRUD operations via Lark Bitable API v1
4. Field mapping: Lark field names → clean camelCase fields (defined in `field-mappings.ts`)
5. Pagination supported (default 100 records per page)

**Important:** The Lark app needs `bitable:app` scope AND must be added as an editor to the Base.

### 2. Xero (Financial Data)

Financial reports come from **Xero** accounting software via OAuth2.

**Client ID:** `F9A22DD438D941709BFEBE1D42FC60D6`  
**Tenant ID:** `9e41a542-b9cb-4523-b383-41871100f0b8`  
**Redirect URI:** `https://hr-app.gorillaworkout.id/api/xero/callback`

**Available Reports:**
- **Balance Sheet** — Assets, liabilities, equity at a point in time
- **Profit & Loss** — Revenue, expenses, net profit over a date range

**Xero Auth Flow:**
```
1. User clicks "Connect Xero" → POST /api/xero/init
2. Redirect to Xero login page
3. User authorizes → Xero redirects to /api/xero/callback
4. Callback exchanges code for tokens → saves to PostgreSQL (xero_tokens table)
5. Access token used for API calls (auto-refresh via refresh token)
```

**⚠️ Critical:** Xero refresh tokens are **SINGLE-USE**. Each refresh gives a new refresh token. The callback route saves tokens to DB automatically.

### 3. PostgreSQL (Persistent Storage)

Used for Xero token storage and synced financial data.

**Container:** `postgres` (PostgreSQL 16 Alpine)  
**Network:** `dupoin-net` (Docker internal)  
**Credentials:** user `dupoin`, db `dupoin_hr`  
**Access:** Port 5432 NOT public — SSH tunnel only

**Tables:**
| Table | Purpose |
|-------|---------|
| `xero_tokens` | OAuth2 tokens (access + refresh) |
| `xero_balance_sheet_reports` | Synced Balance Sheet snapshots |
| `xero_balance_sheet_rows` | Individual BS line items |
| `xero_profit_loss_reports` | Synced P&L snapshots |
| `xero_profit_loss_rows` | Individual P&L line items |
| `xero_transactions` | Transaction records (schema ready) |
| `xero_accounts` | Chart of accounts (schema ready) |

---

## 🔄 API Routes Reference

### HR (Lark Base)

All HR routes follow the same pattern: API route → `lark.ts` → Lark Base API.

| Route | Method | Description |
|-------|--------|-------------|
| `/api/employees` | `GET` | List employees (paginated) |
| `/api/employees` | `POST` | Create new employee |
| `/api/employees/[id]` | `GET` | Get single employee |
| `/api/employees/[id]` | `PUT` | Update employee |
| `/api/employees/[id]` | `DELETE` | Delete employee |
| `/api/manpower` | `GET/POST` | List/create manpower requests |
| `/api/manpower/[id]` | `GET/PUT/DELETE` | Single manpower CRUD |
| `/api/recruitment` | `GET/POST` | List/create recruitment records |
| `/api/recruitment/[id]` | `GET/PUT/DELETE` | Single recruitment CRUD |
| `/api/candidates` | `GET/POST` | List/create candidates |
| `/api/candidates/[id]` | `GET/PUT/DELETE` | Single candidate CRUD |
| `/api/onboarding` | `GET/POST` | List/create onboarding records |
| `/api/onboarding/[id]` | `GET/PUT/DELETE` | Single onboarding CRUD |
| `/api/offboarding` | `GET/POST` | List/create offboarding records |
| `/api/offboarding/[id]` | `GET/PUT/DELETE` | Single offboarding CRUD |
| `/api/pipeline` | `GET` | Aggregated stats from all 6 tables |

### Xero (Financial)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/xero/init` | `POST` | Generate Xero auth URL, start OAuth |
| `/api/xero/callback` | `GET` | Handle OAuth callback, save tokens to DB |
| `/api/xero/status` | `GET` | Check if Xero is connected |
| `/api/xero/balance-sheet` | `GET` | Fetch Balance Sheet (optional `?date=YYYY-MM-DD`) |
| `/api/xero/profit-loss` | `GET` | Fetch P&L (optional `?from=&to=`) |
| `/api/xero/sync` | `POST` | Sync current reports to PostgreSQL |

---

## 🎨 Dashboard Pages

| Page | URL | Features |
|------|-----|----------|
| Overview | `/dashboard` | Stats cards (employee count, active, etc.) |
| Employees | `/dashboard/employees` | Table view, search, add/edit/delete, detail view |
| Manpower | `/dashboard/manpower` | Manpower request list + detail |
| Recruitment | `/dashboard/recruitment` | Recruitment tracking + detail |
| Candidates | `/dashboard/candidates` | Candidate profiles + detail |
| Onboarding | `/dashboard/onboarding` | New hire checklist + detail |
| Offboarding | `/dashboard/offboarding` | Exit process + detail |
| HR Pipeline | `/dashboard/hr` | All-in-one view of the entire HR pipeline |
| Xero Finance | `/dashboard/xero` | Balance Sheet + P&L, date picker, Rupiah formatting, Sync to DB |

---

## 🔍 How The Code Works — Step by Step

This section explains how each part of the codebase works, from Lark API authentication to data rendering on each page.

### 1. Lark API Authentication (`src/lib/lark.ts`)

Every request to Lark Base needs a **Tenant Access Token**. Here's how it works:

```
Your App (Server)                          Lark API
      │                                       │
      │  POST /auth/v3/tenant_access_token    │
      │  Body: { app_id, app_secret }         │
      │──────────────────────────────────────→ │
      │                                       │
      │  Response: { tenant_access_token,     │
      │              expire: 7200 }           │
      │←────────────────────────────────────── │
      │                                       │
      │  (Token cached in memory for ~2 hrs)  │
```

**Key function:** `getTenantToken()`
- Sends `app_id` + `app_secret` to Lark → gets back a token valid for ~2 hours
- Token is **cached in memory** — subsequent calls reuse it until it expires
- Auto-refreshes when expired (no manual intervention needed)

### 2. How Table Data is Fetched

Every table (Employee, Manpower, etc.) follows the same pattern:

```
Dashboard Page (Server Component)
      │
      │ 1. getTableId("employee")
      │    → reads LARK_TABLE_EMPLOYEE from .env
      │    → returns "tblCjXA8BJsLq6uG"
      │
      │ 2. getAllRecords(tableId)
      │    → calls Lark API: GET /bitable/v1/apps/{base}/tables/{table}/records
      │    → automatically paginates (100 records per page)
      │    → returns raw Lark records: [{ record_id, fields: { "Full Name": [...], ... } }]
      │
      │ 3. transformRecord(record) or transformGenericRecord(record, FIELD_MAPPINGS)
      │    → maps Lark field names to clean keys
      │    → e.g. "Full Name" → "full_name", "Date of Joining" → formatted date
      │    → handles complex Lark field types (formula, lookup, linked records)
      │
      │ 4. Passes clean data to Client Component (Table)
      │    → renders in browser with search, sort, pagination
```

### 3. Field Mapping System (`src/lib/field-mappings.ts`)

Lark stores fields with human-readable names like `"Full Name"`, `"Date of Joining"`. The app maps these to clean camelCase keys:

```typescript
// Example: Employee field mapping
{ larkField: "Full Name",        ourField: "full_name" }
{ larkField: "Date of Joining",  ourField: "date_of_joining", isDate: true }
{ larkField: "Primary Department", ourField: "primary_department" }
```

**Each table has its own field mapping array:**

| Table | Mapping Array | File |
|-------|--------------|------|
| Employee | `EMPLOYEE_FIELDS` | `field-mappings.ts` |
| Manpower | `MANPOWER_FIELDS` | `field-mappings.ts` |
| Recruitment | `RECRUITMENT_FIELDS` | `field-mappings.ts` |
| Candidate | `CANDIDATE_FIELDS` | `field-mappings.ts` |
| Onboarding | `ONBOARDING_FIELDS` | `field-mappings.ts` |
| Offboarding | `OFFBOARDING_FIELDS` | `field-mappings.ts` |

**How to add a new field:**
1. Check the field name in Lark Base (exact spelling matters!)
2. Add a new entry to the mapping array:
   ```typescript
   { larkField: "Exact Lark Field Name", ourField: "your_clean_key" }
   // For date fields:
   { larkField: "Start Date", ourField: "startDate", isDate: true }
   ```

### 4. Lark Field Value Types

Lark returns different data structures depending on the field type. The `normalizeFieldValue()` function handles all of them:

| Lark Field Type | Raw Value Example | Normalized Output |
|----------------|-------------------|-------------------|
| Text | `"John Doe"` | `"John Doe"` |
| Number | `42` | `"42"` |
| Checkbox | `true` | `"Yes"` |
| Date/Timestamp | `1700000000` | `"2023-11-14"` (via `formatTimestamp`) |
| Formula/Lookup | `[{ text: "Result", type: 0 }]` | `"Result"` |
| Linked Record | `[{ text_arr: ["HR", "Finance"] }]` | `"HR, Finance"` |
| URL | `{ link: "https://...", text: "Click" }` | `"Click"` |
| Person/User | `{ name: "Admin", id: "123" }` | `"Admin"` |

### 5. CRUD Operations (Create, Read, Update, Delete)

All 6 tables support full CRUD via API routes:

```
CREATE (POST /api/employees)
  1. Frontend sends: { full_name: "John", company: "Dupoin", ... }
  2. API route calls reverseTransform(body, EMPLOYEE_FIELDS)
     → converts { full_name: "John" } back to { "Full Name": "John" }
  3. Calls createRecord(tableId, larkFields)
     → POST to Lark API → creates record in Lark Base
  4. Returns { record_id: "recXXXX" }

READ (GET /api/employees)
  1. Calls getAllRecords(tableId) → fetches all records from Lark
  2. Maps each record through transformRecord() → clean data
  3. Returns { employees: [...], total: 483, active_count: 400 }

UPDATE (PUT /api/employees/[id])
  1. Frontend sends: { full_name: "John Updated", ... }
  2. reverseTransform → converts back to Lark field names
  3. updateRecord(tableId, recordId, fields) → PUT to Lark API

DELETE (DELETE /api/employees/[id])
  1. deleteRecord(tableId, recordId) → DELETE to Lark API
```

### 6. Each Dashboard Page Explained

#### `/dashboard` — Overview (Spreadsheet Upload)
- **Type:** Client Component (`"use client"`)
- **What it does:** Upload `.xlsx`/`.csv` files, edit data in browser, save back
- **Components:** `FileUpload` → parses file → `SheetEditor` → editable spreadsheet grid
- **Data source:** Local file (no Lark API)

#### `/dashboard/employees` — Employee Management
- **Type:** Server Component (data fetched on server)
- **What it does:** Shows all 483 employees from Lark Base
- **Data flow:**
  1. `page.tsx`: calls `getAllRecords()` → `transformRecord()` on server
  2. Passes `employees[]` to `EmployeeTable` (client component)
  3. Table supports: search, column sorting, pagination, add/edit/delete
- **Detail page:** `/dashboard/employees/[id]` → fetches single record by `record_id`

#### `/dashboard/manpower` — Manpower Requests
- **Type:** Server Component
- **What it does:** Shows manpower/headcount requests (new hires needed)
- **Data flow:**
  1. `getTableId("manpower")` → `tbl7xBEUnERcmVrg`
  2. `getAllRecords(tableId)` → `transformGenericRecord(record, MANPOWER_FIELDS)`
  3. Renders in `ManpowerTable` with fields: Request No, Status, Department, Position, etc.

#### `/dashboard/recruitment` — Recruitment Tracking
- **Type:** Server Component
- **What it does:** Tracks recruitment progress per position
- **Key fields:** Recruitment ID, Status, Candidate Name, Hiring Manager, Head Count
- **Data source:** `LARK_TABLE_RECRUITMENT` → `tblXuYd2kC3RvSaB`

#### `/dashboard/candidates` — Candidate Management
- **Type:** Server Component
- **What it does:** Manages candidate profiles and evaluations
- **Key fields:** Candidate ID, Name, Position Applied, Interview Progress, Resume Evaluation, Status
- **Data source:** `LARK_TABLE_CANDIDATE` → `tblU5lxajR8BeN05`

#### `/dashboard/onboarding` — New Hire Onboarding
- **Type:** Server Component
- **What it does:** Checklist for new hire onboarding process
- **Key fields:** Full Name, Commencement Date, Offer Letter, Pre-employment, Lark Account, Email Creation, Probation dates
- **Data source:** `LARK_TABLE_ONBOARDING` → `tbl0FrUUTLbd0iiz`

#### `/dashboard/offboarding` — Employee Exit Process
- **Type:** Server Component
- **What it does:** Tracks employee exit/offboarding process
- **Key fields:** Full Name, Last Working Day, Exit Interview, Handover Form, Asset Return
- **Data source:** `LARK_TABLE_OFFBOARDING` → `tblX7yHGGie6annA`

#### `/dashboard/hr` — HR Pipeline Overview
- **Type:** Server Component
- **What it does:** Aggregated view of the entire HR pipeline across all 6 tables
- **Data flow:**
  1. Fetches ALL 6 tables in **parallel** using `Promise.all()`
  2. Counts records by status (active, pending, completed, etc.)
  3. Shows summary cards: total employees, active, pending manpower, etc.
- **This is the same logic as `/api/pipeline`**

#### `/dashboard/xero` — Financial Reports
- **Type:** Client Component
- **What it does:** Shows Xero Balance Sheet + Profit & Loss reports
- **Data flow:**
  1. Checks Xero connection status → `GET /api/xero/status`
  2. If not connected → shows "Connect Xero" button → OAuth flow
  3. If connected → fetches reports with date range picker
  4. Balance Sheet: `GET /api/xero/balance-sheet?date=2025-03-31`
  5. Profit & Loss: `GET /api/xero/profit-loss?from=2025-02-01&to=2025-03-31`
  6. "Sync to DB" button → `POST /api/xero/sync` → saves to PostgreSQL

### 7. Xero OAuth Flow Explained

```
User clicks "Connect Xero"
      │
      ▼
POST /api/xero/init
      │ → generates auth URL with client_id + scopes
      │ → redirects user to Xero login page
      ▼
User logs in at login.xero.com
      │ → authorizes the app
      │ → Xero redirects to:
      ▼
GET /api/xero/callback?code=XXXX
      │ → exchanges code for access_token + refresh_token
      │ → saves tokens to PostgreSQL (xero_tokens table)
      │ → fetches tenant_id from Xero connections
      │ → redirects to /dashboard/xero
      ▼
Dashboard shows financial data
      │ → uses access_token for API calls
      │ → auto-refreshes when token expires (every 30 min)
      │ → ⚠️ refresh tokens are SINGLE-USE (each refresh gives new one)
```

### 8. How to Add a New Lark Table

If you need to add a new table (e.g. "Training"):

**Step 1:** Create the table in Lark Base, note the Table ID from URL

**Step 2:** Add env var:
```bash
LARK_TABLE_TRAINING=tblNewTableId
```

**Step 3:** Add to `TABLE_ENV_MAP` in `src/lib/lark.ts`:
```typescript
const TABLE_ENV_MAP: Record<string, string> = {
  // ... existing tables
  training: "LARK_TABLE_TRAINING",
};
```

**Step 4:** Add field mappings in `src/lib/field-mappings.ts`:
```typescript
export const TRAINING_FIELDS: FieldMapping[] = [
  { larkField: "Training ID", ourField: "trainingId" },
  { larkField: "Training Name", ourField: "trainingName" },
  { larkField: "Date", ourField: "date", isDate: true },
  // ... add all fields you need
];
```

**Step 5:** Create API route `src/app/api/training/route.ts` (copy from manpower)

**Step 6:** Create dashboard page `src/app/dashboard/training/page.tsx` (copy from manpower)

**Step 7:** Add to sidebar navigation in `src/components/dashboard/sidebar.tsx`

---

## 🐳 Deployment

### Docker Setup

The app runs in a Docker container on the VPS, connected to PostgreSQL via Docker network.

```
Docker Network: dupoin-net
├── dupoin-dashboard  (port 3001 → 3000 internal)
└── postgres          (port 5432 internal only)
```

### Deploy Commands

```bash
# SSH into VPS
ssh ubuntu@168.110.216.240

# Navigate to project
cd ~/apps/dupoin_sheet_converter

# Pull latest code
git pull origin main

# Rebuild and restart container
docker stop dupoin-dashboard && docker rm dupoin-dashboard
docker build -t dupoin-dashboard .
docker run -d \
  --name dupoin-dashboard \
  --network dupoin-net \
  -p 3001:3000 \
  --restart unless-stopped \
  -e LARK_APP_ID=cli_a91100da02b8de1a \
  -e LARK_APP_SECRET=LlGH7UgI5GR0fbwJY1N9SgRzrBsBdToF \
  -e LARK_BASE_APP_TOKEN=Dg3WbbHcPa5kmJseHoHjCGWMpC5 \
  -e LARK_TABLE_ID=tblCjXA8BJsLq6uG \
  -e LARK_TABLE_EMPLOYEE=tblCjXA8BJsLq6uG \
  -e LARK_TABLE_MANPOWER=tbl7xBEUnERcmVrg \
  -e LARK_TABLE_RECRUITMENT=tblXuYd2kC3RvSaB \
  -e LARK_TABLE_CANDIDATE=tblU5lxajR8BeN05 \
  -e LARK_TABLE_ONBOARDING=tbl0FrUUTLbd0iiz \
  -e LARK_TABLE_OFFBOARDING=tblX7yHGGie6annA \
  -e NEXT_PUBLIC_BASE_URL=https://hr-app.gorillaworkout.id \
  -e XERO_CLIENT_ID=F9A22DD438D941709BFEBE1D42FC60D6 \
  -e XERO_CLIENT_SECRET=-vKQdOeLbRszH7nugt2rrUaAVvGViVwfHtapPv7borK0CV80 \
  -e XERO_REDIRECT_URI=https://hr-app.gorillaworkout.id/api/xero/callback \
  -e DATABASE_URL=postgresql://dupoin:dupoin2026secure@postgres:5432/dupoin_hr \
  dupoin-dashboard

# Verify
docker ps | grep dupoin
curl -s -o /dev/null -w "%{http_code}" https://hr-app.gorillaworkout.id
```

### Quick Health Check

```bash
# Check all containers
docker ps

# Check logs
docker logs dupoin-dashboard --tail 20

# Check PostgreSQL
docker exec postgres psql -U dupoin -d dupoin_hr -c "SELECT count(*) FROM xero_tokens;"

# Check Nginx
sudo nginx -t && sudo systemctl status nginx
```

---

## 📖 Setup Guide — How to Get All Credentials

### A. Lark App ID & App Secret

1. Open **https://open.larksuite.com** and login with your admin account
2. Click **"Create Custom App"** (or open an existing app)
3. Fill in the app details:
   - **App Name:** e.g. `Dupoin HR Dashboard`
   - **Description:** e.g. `Internal HR management tool`
4. After creating, you'll see:
   - **App ID** → copy this (e.g. `cli_a91100da02b8de1a`)
   - **App Secret** → click "Show" to reveal, then copy

> 💡 **Feishu users:** use https://open.feishu.cn instead

### B. Lark App Permissions

Still in the same app on Lark Developer Console:

1. Go to **"Permissions & Scopes"** in the left sidebar
2. Search and enable these permissions:
   - `bitable:app` — Read and write Base data
   - `bitable:app:readonly` — Read Base data
3. Click **"Save"**
4. Go to **"Version Management"** → click **"Create Version"** → **"Publish"**
5. Wait for admin approval (or self-approve if you're admin)

> ⚠️ **Important:** After publishing, you must also **add the app as an editor** to your Lark Base:
> 1. Open your Lark Base document
> 2. Click **"Share"** (top right)
> 3. Search for your app name (e.g. `Dupoin HR Dashboard`)
> 4. Set permission to **"Can Edit"**
> 5. Click **"Confirm"**

### C. Lark Base App Token

1. Open your **Lark Base** document in the browser
2. Look at the URL in the address bar:
   ```
   https://your-company.larksuite.com/base/Dg3WbbHcPa5kmJseHoHjCGWMpC5
                                            └──────────── This is your App Token ────────────┘
   ```
3. Copy the string after `/base/` — that's your `LARK_BASE_APP_TOKEN`

### D. Lark Table IDs

Each tab/table in your Lark Base has its own ID:

1. Open your Lark Base document
2. Click on a **table tab** (e.g. "Employee")
3. Look at the URL — it will now include a `table` parameter:
   ```
   https://your-company.larksuite.com/base/Dg3WbbHcPa5km...?table=tblCjXA8BJsLq6uG
                                                                   └── Table ID ──┘
   ```
4. Copy the `table=tblXXXX` value — that's the Table ID
5. **Repeat for each table:**

| Tab Name | ENV Variable | Example Table ID |
|----------|-------------|-----------------|
| Employee | `LARK_TABLE_EMPLOYEE` | `tblCjXA8BJsLq6uG` |
| Manpower | `LARK_TABLE_MANPOWER` | `tbl7xBEUnERcmVrg` |
| Recruitment | `LARK_TABLE_RECRUITMENT` | `tblXuYd2kC3RvSaB` |
| Candidate | `LARK_TABLE_CANDIDATE` | `tblU5lxajR8BeN05` |
| Onboarding | `LARK_TABLE_ONBOARDING` | `tbl0FrUUTLbd0iiz` |
| Offboarding | `LARK_TABLE_OFFBOARDING` | `tblX7yHGGie6annA` |

> 💡 **Quick shortcut:** Right-click a table tab → **"Copy link"** → paste somewhere → extract the `table=tblXXX` value from the URL.

### E. Xero Client ID & Client Secret

1. Go to **https://developer.xero.com/app/manage**
2. Login with your Xero account
3. Click **"New app"** (or open existing app):
   - **App name:** e.g. `Dupoin Dashboard`
   - **Integration type:** Web app
   - **Company or application URL:** `https://hr-app.gorillaworkout.id`
   - **Redirect URI:** `https://hr-app.gorillaworkout.id/api/xero/callback`
4. After creating, you'll see:
   - **Client ID** → copy this
   - **Client Secret** → click "Generate a secret", then copy immediately (shown only once!)

> ⚠️ **Critical:** The **Redirect URI** must exactly match `XERO_REDIRECT_URI` in your `.env` file, including the protocol (`https://`) and path (`/api/xero/callback`). Any mismatch will cause OAuth to fail.

### F. Setting Up `.env.local` for Local Development

Create a `.env.local` file in the project root:

```bash
# Lark Configuration
LARK_APP_ID=cli_a91100da02b8de1a
LARK_APP_SECRET=your_app_secret_here
LARK_BASE_APP_TOKEN=Dg3WbbHcPa5kmJseHoHjCGWMpC5
LARK_TABLE_EMPLOYEE=tblCjXA8BJsLq6uG
LARK_TABLE_MANPOWER=tbl7xBEUnERcmVrg
LARK_TABLE_RECRUITMENT=tblXuYd2kC3RvSaB
LARK_TABLE_CANDIDATE=tblU5lxajR8BeN05
LARK_TABLE_ONBOARDING=tbl0FrUUTLbd0iiz
LARK_TABLE_OFFBOARDING=tblX7yHGGie6annA

# Xero Configuration
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret
XERO_REDIRECT_URI=http://localhost:3000/api/xero/callback
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database (optional for local — only needed for Xero token storage)
DATABASE_URL=postgresql://dupoin:dupoin2026secure@localhost:5432/dupoin_hr
```

> 📝 **Note:** For local dev, change `XERO_REDIRECT_URI` and `NEXT_PUBLIC_BASE_URL` to `http://localhost:3000`. Update them back to the production domain when deploying.

### G. Quick Start (After Getting All Credentials)

```bash
# 1. Clone the repo
git clone https://github.com/gorillaworkout/dupoin_sheet_converter.git
cd dupoin_sheet_converter

# 2. Create .env.local with your credentials (see section F above)

# 3. Install dependencies
npm install

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000 in your browser
```

---

## 🔧 Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `LARK_APP_ID` | `cli_a91100da02b8de1a` | Lark app credentials |
| `LARK_APP_SECRET` | `LlGH7UgI...` | Lark app secret |
| `LARK_BASE_APP_TOKEN` | `Dg3WbbHcPa5km...` | Lark Base identifier |
| `LARK_TABLE_EMPLOYEE` | `tblCjXA8BJsLq6uG` | Employee table ID |
| `LARK_TABLE_MANPOWER` | `tbl7xBEUnERcmVrg` | Manpower table ID |
| `LARK_TABLE_RECRUITMENT` | `tblXuYd2kC3RvSaB` | Recruitment table ID |
| `LARK_TABLE_CANDIDATE` | `tblU5lxajR8BeN05` | Candidate table ID |
| `LARK_TABLE_ONBOARDING` | `tbl0FrUUTLbd0iiz` | Onboarding table ID |
| `LARK_TABLE_OFFBOARDING` | `tblX7yHGGie6annA` | Offboarding table ID |
| `NEXT_PUBLIC_BASE_URL` | `https://hr-app.gorillaworkout.id` | Public URL (for Xero callback) |
| `XERO_CLIENT_ID` | `F9A22DD4...` | Xero OAuth client ID |
| `XERO_CLIENT_SECRET` | `-vKQdOeL...` | Xero OAuth client secret |
| `XERO_REDIRECT_URI` | `https://hr-app.../api/xero/callback` | Xero OAuth redirect |
| `DATABASE_URL` | `postgresql://dupoin:...@postgres:5432/dupoin_hr` | PostgreSQL connection (Docker internal) |

---

## 🗄️ Database Access (DBeaver)

PostgreSQL is NOT publicly exposed. Connect via SSH tunnel:

1. **DBeaver → New Connection → PostgreSQL**
2. **Main tab:**
   - Host: `localhost`
   - Port: `5432`
   - Database: `dupoin_hr`
   - Username: `dupoin`
   - Password: `dupoin2026secure`
3. **SSH tab:**
   - Use SSH Tunnel: ✅
   - Host: `168.110.216.240`
   - Port: `22`
   - Username: `ubuntu`
   - Auth: Private key (your SSH key)
4. **Test Connection → Connect**

---

## 🔑 Key Design Decisions

| Decision | Reasoning |
|----------|-----------|
| **Lark Base as primary DB** | Dupoin uses Lark for HR; no need to duplicate data |
| **API routes as backend** | Next.js API routes → Lark API; frontend fetches from API routes |
| **Employee form excludes read-only fields** | Lark field types like `formula`, `lookup`, `created_by` are read-only and cause 403 errors |
| **Shared form field definitions** | `employee-form-fields.ts` used by both table and detail components |
| **PostgreSQL for Xero only** | Xero tokens need persistence across container restarts; reports synced on-demand |
| **Prisma 5 (NOT v7)** | Prisma 7 has breaking changes: removed `url` from schema, different client init |
| **Docker network `dupoin-net`** | Containers communicate by name (`postgres:5432`) instead of IP |
| **OpenSSL in Alpine Docker** | Prisma engine requires OpenSSL; `apk add --no-cache openssl` |
| **Manual sync (no cron)** | Learning project — user prefers button-based sync over automated jobs |
| **Xero callback uses hardcoded BASE_URL** | `req.url` inside Docker resolves to `localhost:3000`; must use public domain |
| **Rupiah formatting** | `formatRupiah()` converts numbers to `Rp 1.234.567` format |

---

## ⚠️ Known Issues & Gotchas

1. **Xero tokens expire every 30 minutes** — auto-refresh on API call, but if refresh fails, user must re-authorize via "Connect Xero" button
2. **Lark tenant token has a TTL** — cached in memory, auto-refreshes, but container restart clears cache (first request after restart may be slower)
3. **Employee edit form** — only writable fields are shown. Read-only Lark fields (formula, lookup, created_by, etc.) are excluded to prevent `LinkFieldConvFail` and 403 errors
4. **Lark Base `.limit(100)`** — default page size is 100 records. Employee table has 483 records, so pagination is handled
5. **Container restart loses Lark token cache** — not stored in DB (unlike Xero). First API call after restart fetches a new token

---

## 🚨 Troubleshooting

### "Xero not connected"
```bash
# Check token in DB
docker exec postgres psql -U dupoin -d dupoin_hr \
  -c "SELECT id, expires_at, updated_at FROM xero_tokens;"

# If expired/missing, re-authorize:
# Go to https://hr-app.gorillaworkout.id/dashboard/xero → Click "Connect Xero"
```

### "Employee list empty / 403 error"
```bash
# Check Lark token
curl -s https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal \
  -H "Content-Type: application/json" \
  -d '{"app_id":"cli_a91100da02b8de1a","app_secret":"LlGH7UgI5GR0fbwJY1N9SgRzrBsBdToF"}'

# If 403: Lark app needs bitable:app scope + must be editor on the Base
```

### "Container won't start"
```bash
docker logs dupoin-dashboard --tail 50
# Common issues:
# - PostgreSQL not running: docker start postgres
# - Port 3001 in use: docker ps -a | grep 3001
# - Build error: docker build -t dupoin-dashboard . 2>&1 | tail -20
```

### "Database connection failed"
```bash
# Check postgres container
docker ps | grep postgres
# If not running:
docker start postgres
# Then restart dashboard:
docker restart dupoin-dashboard
```

---

## 📊 Tech Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16 |
| UI | React | 19 |
| Styling | Tailwind CSS | 4 |
| Components | shadcn/ui | latest |
| ORM | Prisma | 5.22.0 |
| Database | PostgreSQL | 16 (Alpine) |
| HR API | Lark Base API | v1 |
| Finance API | Xero OAuth2 | v2 |
| Container | Docker | Node 22 Alpine |
| Reverse Proxy | Nginx | with SSL (Certbot) |
| VPS | Oracle Cloud | ARM64, Ubuntu |

---

*Last updated: February 2026*
