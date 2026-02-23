const LARK_APP_ID = process.env.LARK_APP_ID!;
const LARK_APP_SECRET = process.env.LARK_APP_SECRET!;
const LARK_BASE_APP_TOKEN = process.env.LARK_BASE_APP_TOKEN!;
const LARK_API_BASE = "https://open.larksuite.com/open-apis";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

// ---------------------------------------------------------------------------
// Table ID helper
// ---------------------------------------------------------------------------

const TABLE_ENV_MAP: Record<string, string> = {
  employee: "LARK_TABLE_EMPLOYEE",
  manpower: "LARK_TABLE_MANPOWER",
  recruitment: "LARK_TABLE_RECRUITMENT",
  candidate: "LARK_TABLE_CANDIDATE",
  onboarding: "LARK_TABLE_ONBOARDING",
  offboarding: "LARK_TABLE_OFFBOARDING",
};

export type TableName =
  | "employee"
  | "manpower"
  | "recruitment"
  | "candidate"
  | "onboarding"
  | "offboarding";

export function getTableId(tableName: TableName): string {
  const envVar = TABLE_ENV_MAP[tableName];
  const value = process.env[envVar];
  if (!value) {
    throw new Error(`Missing env var ${envVar} for table "${tableName}"`);
  }
  return value;
}

/**
 * Backward-compat helper: resolves a table ID falling back to LARK_TABLE_ID
 * when no explicit tableId is passed.
 */
function resolveTableId(tableId?: string): string {
  if (tableId) return tableId;
  return (
    process.env.LARK_TABLE_EMPLOYEE ||
    process.env.LARK_TABLE_ID ||
    ""
  );
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function getTenantToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const res = await fetch(
    `${LARK_API_BASE}/auth/v3/tenant_access_token/internal`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: LARK_APP_ID,
        app_secret: LARK_APP_SECRET,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to get tenant token: ${res.status}`);
  }

  const data = await res.json();

  if (data.code !== 0) {
    throw new Error(`Lark auth error: ${data.msg}`);
  }

  cachedToken = data.tenant_access_token;
  // Cache for slightly less than the expire time (2h default)
  tokenExpiresAt = now + (data.expire - 300) * 1000;

  return cachedToken!;
}

// ---------------------------------------------------------------------------
// Field value helpers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeFieldValue(value: any): string {
  if (value === null || value === undefined) return "";

  // Plain string
  if (typeof value === "string") return value;

  // Plain number (could be a timestamp or just a number)
  if (typeof value === "number") return String(value);

  // Plain boolean
  if (typeof value === "boolean") return value ? "Yes" : "No";

  // Array — common for formula, lookup, linked records
  if (Array.isArray(value)) {
    // Formula / Lookup: [{ text, type }]
    if (value.length > 0 && value[0]?.text !== undefined) {
      return value.map((v) => v.text).join(", ");
    }
    // Linked records: [{ table_id, text_arr, type }]
    if (value.length > 0 && value[0]?.text_arr) {
      return value
        .flatMap((v: { text_arr?: string[] }) => v.text_arr || [])
        .join(", ");
    }
    // Simple string array
    return value.map((v) => (typeof v === "string" ? v : String(v))).join(", ");
  }

  // URL field: { link, text }
  if (typeof value === "object" && value.link) {
    return value.text || value.link;
  }

  // Person / user field: { name, id }
  if (typeof value === "object" && value.name) {
    return value.name;
  }

  // Fallback
  return JSON.stringify(value);
}

export function formatTimestamp(value: unknown): string {
  if (!value) return "";

  let ts: number;
  if (typeof value === "number") {
    ts = value;
  } else if (typeof value === "string" && !isNaN(Number(value))) {
    ts = Number(value);
  } else if (typeof value === "string") {
    return value;
  } else {
    return normalizeFieldValue(value);
  }

  // Lark timestamps can be in ms or seconds
  if (ts < 1e12) ts *= 1000;

  const date = new Date(ts);
  if (isNaN(date.getTime())) return String(value);

  return date.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Lark record types
// ---------------------------------------------------------------------------

interface LarkRecordsResponse {
  code: number;
  msg: string;
  data: {
    has_more: boolean;
    page_token?: string;
    total: number;
    items: LarkRecord[];
  };
}

export interface LarkRecord {
  record_id: string;
  fields: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// READ operations
// ---------------------------------------------------------------------------

export async function getRecords(
  tableId?: string,
  pageSize = 100,
  pageToken?: string
): Promise<LarkRecordsResponse> {
  const token = await getTenantToken();
  const tid = resolveTableId(tableId);

  const params = new URLSearchParams({ page_size: String(pageSize) });
  if (pageToken) params.set("page_token", pageToken);

  const url = `${LARK_API_BASE}/bitable/v1/apps/${LARK_BASE_APP_TOKEN}/tables/${tid}/records?${params}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch records: ${res.status}`);
  }

  return res.json();
}

export async function getAllRecords(tableId?: string): Promise<LarkRecord[]> {
  const tid = resolveTableId(tableId);
  const allRecords: LarkRecord[] = [];
  let pageToken: string | undefined;

  do {
    const response = await getRecords(tid, 100, pageToken);

    if (response.code !== 0) {
      throw new Error(`Lark API error: ${response.msg}`);
    }

    if (response.data.items) {
      allRecords.push(...response.data.items);
    }

    pageToken = response.data.has_more
      ? response.data.page_token
      : undefined;
  } while (pageToken);

  return allRecords;
}

export async function getRecord(
  tableIdOrRecordId: string,
  recordId?: string
): Promise<LarkRecord | null> {
  // Support both signatures:
  //   getRecord(recordId)          — backward compat (uses default table)
  //   getRecord(tableId, recordId) — new generic form
  let tid: string;
  let rid: string;

  if (recordId) {
    tid = tableIdOrRecordId;
    rid = recordId;
  } else {
    tid = resolveTableId();
    rid = tableIdOrRecordId;
  }

  const token = await getTenantToken();

  const url = `${LARK_API_BASE}/bitable/v1/apps/${LARK_BASE_APP_TOKEN}/tables/${tid}/records/${rid}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch record: ${res.status}`);
  }

  const data = await res.json();

  if (data.code !== 0) {
    throw new Error(`Lark API error: ${data.msg}`);
  }

  return data.data.record;
}

// ---------------------------------------------------------------------------
// CREATE / UPDATE / DELETE operations
// ---------------------------------------------------------------------------

export async function createRecord(
  tableId: string,
  fields: Record<string, unknown>
): Promise<string> {
  const token = await getTenantToken();

  const url = `${LARK_API_BASE}/bitable/v1/apps/${LARK_BASE_APP_TOKEN}/tables/${tableId}/records`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create record (${res.status}): ${text}`);
  }

  const data = await res.json();

  if (data.code !== 0) {
    throw new Error(`Lark API error: ${data.msg}`);
  }

  return data.data.record.record_id as string;
}

export async function updateRecord(
  tableId: string,
  recordId: string,
  fields: Record<string, unknown>
): Promise<void> {
  const token = await getTenantToken();

  const url = `${LARK_API_BASE}/bitable/v1/apps/${LARK_BASE_APP_TOKEN}/tables/${tableId}/records/${recordId}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update record (${res.status}): ${text}`);
  }

  const data = await res.json();

  if (data.code !== 0) {
    throw new Error(`Lark API error: ${data.msg}`);
  }
}

export async function deleteRecord(
  tableId: string,
  recordId: string
): Promise<void> {
  const token = await getTenantToken();

  const url = `${LARK_API_BASE}/bitable/v1/apps/${LARK_BASE_APP_TOKEN}/tables/${tableId}/records/${recordId}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete record (${res.status}): ${text}`);
  }

  const data = await res.json();

  if (data.code !== 0) {
    throw new Error(`Lark API error: ${data.msg}`);
  }
}

// ---------------------------------------------------------------------------
// Employee field mapping (backward compat — kept here for existing API)
// ---------------------------------------------------------------------------

const EMPLOYEE_FIELD_MAP: Record<string, string> = {
  UUID: "uuid",
  "Full Name": "full_name",
  "Nickname (WF)": "nickname",
  Company: "company",
  Gender: "gender",
  "Job Title": "job_title",
  "Primary Department": "primary_department",
  Status: "status",
  "Offboarding Status": "offboarding_status",
  "Date of Joining": "date_of_joining",
  "Work Email": "work_email",
  "Business Email": "business_email",
  "Phone Number": "phone_number",
  "Workforce Type": "workforce_type",
  Seats: "seats",
  Nationality: "nationality",
  City: "city",
};

const EMPLOYEE_DATE_FIELDS = new Set(["date_of_joining"]);

export function transformRecord(record: LarkRecord): Record<string, string> {
  const result: Record<string, string> = { record_id: record.record_id };

  for (const [larkField, ourField] of Object.entries(EMPLOYEE_FIELD_MAP)) {
    const rawValue = record.fields[larkField];

    if (EMPLOYEE_DATE_FIELDS.has(ourField)) {
      result[ourField] = formatTimestamp(rawValue);
    } else {
      result[ourField] = normalizeFieldValue(rawValue);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Generic record transformer
// ---------------------------------------------------------------------------

export interface FieldMapping {
  larkField: string;
  ourField: string;
  isDate?: boolean;
}

export function transformGenericRecord(
  record: LarkRecord,
  fieldMappings: FieldMapping[]
): Record<string, string> {
  const result: Record<string, string> = { record_id: record.record_id };

  for (const { larkField, ourField, isDate } of fieldMappings) {
    const rawValue = record.fields[larkField];
    result[ourField] = isDate
      ? formatTimestamp(rawValue)
      : normalizeFieldValue(rawValue);
  }

  return result;
}

/**
 * Reverse-transform: convert our clean keys back to Lark field names.
 * Only includes fields that are present in the input.
 */
export function reverseTransform(
  data: Record<string, unknown>,
  fieldMappings: FieldMapping[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const { larkField, ourField } of fieldMappings) {
    if (ourField in data) {
      result[larkField] = data[ourField];
    }
  }

  return result;
}
