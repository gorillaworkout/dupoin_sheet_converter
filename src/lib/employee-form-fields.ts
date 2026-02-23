import type { FieldDefinition } from "@/components/dashboard/form-dialog";

// Field options pulled from Lark Base field definitions (type 3 = single select)
export const EMPLOYEE_FORM_FIELDS: FieldDefinition[] = [
  { name: "full_name", label: "Full Name", type: "text", required: true },
  { name: "nickname", label: "Nickname", type: "text" },
  { name: "company", label: "Company", type: "select", options: ["DPI", "KBI", "KBA", "DPF", "DPM", "SCI", "WH", "FM", "DGB", "KVBI", "DPG"] },
  { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Prefer not to tell", "Other"] },
  { name: "marital_status", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed", "Separated"] },
  { name: "job_title", label: "Job Title", type: "text" },
  { name: "primary_department", label: "Primary Department", type: "text" },
  { name: "status", label: "Status", type: "select", options: ["Active", "Not joined", "Suspended"] },
  { name: "workforce_type", label: "Workforce Type", type: "select", options: ["Regular", "Contract", "Intern", "Part-time"] },
  { name: "contract_type", label: "Contract Type", type: "select", options: ["Probation", "Permanent"] },
  { name: "education_level", label: "Education Level", type: "select", options: ["No Formal Education", "Secondary School", "Highschool", "Associate Degree", "Bachelor Degree", "Master Degree", "Doctorate", "Other"] },
  { name: "business_email", label: "Business Email", type: "text" },
  { name: "phone_number", label: "Phone Number", type: "text" },
  { name: "city", label: "City", type: "text" },
  { name: "seats", label: "Seats", type: "text" },
];
