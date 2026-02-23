import type { FieldMapping } from "@/lib/lark";

// ---------------------------------------------------------------------------
// Manpower Request Form — tbl7xBEUnERcmVrg
// ---------------------------------------------------------------------------

export const MANPOWER_FIELDS: FieldMapping[] = [
  { larkField: "Request No", ourField: "requestNo" },
  { larkField: "Candidate Name", ourField: "candidateName" },
  { larkField: "Status", ourField: "status" },
  { larkField: "Approval Process", ourField: "approvalProcess" },
  { larkField: "Submitted at", ourField: "submittedAt", isDate: true },
  { larkField: "Completed at", ourField: "completedAt", isDate: true },
  { larkField: "Title", ourField: "title" },
  { larkField: "Department", ourField: "department" },
  { larkField: "Position / Title", ourField: "position" },
  { larkField: "Rank", ourField: "rank" },
  { larkField: "Required Start Date", ourField: "requiredStartDate", isDate: true },
  { larkField: "Reason of Recruitment", ourField: "reasonOfRecruitment" },
  { larkField: "New Headcount Needed", ourField: "newHeadcountNeeded" },
  { larkField: "Job Description", ourField: "jobDescription" },
  { larkField: "Employment Type", ourField: "employmentType" },
  { larkField: "Reason to Recruit", ourField: "reasonToRecruit" },
  { larkField: "Existing Position Headcount", ourField: "existingPositionHeadcount" },
  { larkField: "Job Requirements", ourField: "jobRequirements" },
  { larkField: "Initiator Department", ourField: "initiatorDepartment" },
];

// ---------------------------------------------------------------------------
// Recruitment Progress — tblXuYd2kC3RvSaB
// ---------------------------------------------------------------------------

export const RECRUITMENT_FIELDS: FieldMapping[] = [
  { larkField: "Recruitment", ourField: "recruitmentId" },
  { larkField: "Status", ourField: "status" },
  { larkField: "Candidate Name", ourField: "candidateName" },
  { larkField: "Requestor", ourField: "requestor" },
  { larkField: "Hiring Manager", ourField: "hiringManager" },
  { larkField: "Hiring Position", ourField: "hiringPosition" },
  { larkField: "Head Count", ourField: "headCount" },
  { larkField: "Recruitment Start Date", ourField: "recruitmentStartDate", isDate: true },
  { larkField: "Commencement Date", ourField: "commencementDate", isDate: true },
  { larkField: "Candidate Info", ourField: "candidateInfo" },
];

// ---------------------------------------------------------------------------
// Candidate Management — tblU5lxajR8BeN05
// ---------------------------------------------------------------------------

export const CANDIDATE_FIELDS: FieldMapping[] = [
  { larkField: "Candidate ID", ourField: "candidateId" },
  { larkField: "Candidate Name", ourField: "candidateName" },
  { larkField: "Position Applied", ourField: "positionApplied" },
  { larkField: "Submission Channel", ourField: "submissionChannel" },
  { larkField: "Interview Progress", ourField: "interviewProgress" },
  { larkField: "Resume Evaluation", ourField: "resumeEvaluation" },
  { larkField: "Status", ourField: "status" },
  { larkField: "Commencement Date", ourField: "commencementDate", isDate: true },
  { larkField: "Hiring Manager", ourField: "hiringManager" },
  { larkField: "Salary Offered (RM)", ourField: "salaryOffered" },
  { larkField: "Recruitment Progress", ourField: "recruitmentProgress" },
];

// ---------------------------------------------------------------------------
// Onboarding — tbl0FrUUTLbd0iiz
// ---------------------------------------------------------------------------

export const ONBOARDING_FIELDS: FieldMapping[] = [
  { larkField: "OnboardingID", ourField: "onboardingId" },
  { larkField: "Full Name", ourField: "fullName" },
  { larkField: "Incoming Status", ourField: "incomingStatus" },
  { larkField: "Commencement Date", ourField: "commencementDate", isDate: true },
  { larkField: "Department", ourField: "department" },
  { larkField: "Position", ourField: "position" },
  { larkField: "Offer Letter", ourField: "offerLetter" },
  { larkField: "Pre-employment", ourField: "preEmployment" },
  { larkField: "Rank Chart", ourField: "rankChart" },
  { larkField: "Org Chart", ourField: "orgChart" },
  { larkField: "P-file", ourField: "pFile" },
  { larkField: "HR Confirmation", ourField: "hrConfirmation" },
  { larkField: "Lark and InfoTech Acc", ourField: "larkAccount" },
  { larkField: "Email Creation", ourField: "emailCreation" },
  { larkField: "Access Assignment", ourField: "accessAssignment" },
  { larkField: "Asset Assignment", ourField: "assetAssignment" },
  { larkField: "Admin Confirmation", ourField: "adminConfirmation" },
  { larkField: "Manager Confirmation", ourField: "managerConfirmation" },
  { larkField: "Probation Pass", ourField: "probationPass" },
  { larkField: "Completed", ourField: "completed" },
  { larkField: "Company Email", ourField: "companyEmail" },
  { larkField: "Probation Start Date", ourField: "probationStartDate", isDate: true },
  { larkField: "Probation End Date", ourField: "probationEndDate" },
];

// ---------------------------------------------------------------------------
// Offboarding — tblX7yHGGie6annA
// ---------------------------------------------------------------------------

export const OFFBOARDING_FIELDS: FieldMapping[] = [
  { larkField: "OffboardingID", ourField: "offboardingId" },
  { larkField: "Full Name (Nick name)", ourField: "fullName" },
  { larkField: "Company", ourField: "company" },
  { larkField: "Last Working Day", ourField: "lastWorkingDay", isDate: true },
  { larkField: "Rank Chart", ourField: "rankChart" },
  { larkField: "Org Chart", ourField: "orgChart" },
  { larkField: "P-File", ourField: "pFile" },
  { larkField: "Exit Interview", ourField: "exitInterview" },
  { larkField: "Handover Form", ourField: "handoverForm" },
  { larkField: "HR Confirmation", ourField: "hrConfirmation" },
  { larkField: "Name Card", ourField: "nameCard" },
  { larkField: "Access Assignment", ourField: "accessAssignment" },
  { larkField: "Asset Assignment", ourField: "assetAssignment" },
  { larkField: "Lark and InfoTech Acc", ourField: "larkAccount" },
  { larkField: "Admin Confirmation", ourField: "adminConfirmation" },
  { larkField: "Finance Confirmation", ourField: "financeConfirmation" },
  { larkField: "Manager Confirmation", ourField: "managerConfirmation" },
  { larkField: "Offboard Reason", ourField: "offboardReason" },
  { larkField: "Offboarded", ourField: "offboarded" },
  { larkField: "Email (personal)", ourField: "personalEmail" },
];

// ---------------------------------------------------------------------------
// Employee — tblCjXA8BJsLq6uG (for the reverse transform in POST/PUT)
// ---------------------------------------------------------------------------

export const EMPLOYEE_FIELDS: FieldMapping[] = [
  { larkField: "UUID", ourField: "uuid" },
  { larkField: "Full Name", ourField: "full_name" },
  { larkField: "Nickname (WF)", ourField: "nickname" },
  { larkField: "Company", ourField: "company" },
  { larkField: "Gender", ourField: "gender" },
  { larkField: "Job Title", ourField: "job_title" },
  { larkField: "Primary Department", ourField: "primary_department" },
  { larkField: "Status", ourField: "status" },
  { larkField: "Offboarding Status", ourField: "offboarding_status" },
  { larkField: "Date of Joining", ourField: "date_of_joining", isDate: true },
  { larkField: "Work Email", ourField: "work_email" },
  { larkField: "Business Email", ourField: "business_email" },
  { larkField: "Phone Number", ourField: "phone_number" },
  { larkField: "Workforce Type", ourField: "workforce_type" },
  { larkField: "Seats", ourField: "seats" },
  { larkField: "Nationality", ourField: "nationality" },
  { larkField: "City", ourField: "city" },
  { larkField: "Marital Status", ourField: "marital_status" },
  { larkField: "Contract Type", ourField: "contract_type" },
  { larkField: "Education Level", ourField: "education_level" },
];
