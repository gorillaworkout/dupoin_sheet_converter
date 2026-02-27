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
