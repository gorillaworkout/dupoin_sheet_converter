// ---------------------------------------------------------------------------
// HR Pipeline Types
// ---------------------------------------------------------------------------

export interface ManpowerRequest {
  id: string;
  record_id: string;
  // Core Lark fields
  requestNo: string;
  candidateName: string;
  status: string;
  approvalProcess: string;
  submittedAt: string;
  completedAt: string;
  department: string;
  position: string;
  rank: string;
  requiredStartDate: string;
  reasonOfRecruitment: string;
  newHeadcountNeeded: string;
  jobDescription: string;
  employmentType: string;
  reasonToRecruit: string;
  jobRequirements: string;
  // UI-aliased fields (snake_case used by dashboard components)
  request_no: string;
  required_start_date: string;
  number_of_positions: string;
  employment_type: string;
  company: string;
  budget: string;
  justification: string;
  notes: string;
  requester: string;
  // Allow additional dynamic fields
  [key: string]: string;
}

export interface RecruitmentProgress {
  id: string;
  record_id: string;
  // Core Lark fields
  recruitmentId: string;
  status: string;
  candidateName: string;
  requestor: string;
  hiringManager: string;
  hiringPosition: string;
  headCount: string;
  recruitmentStartDate: string;
  commencementDate: string;
  // UI-aliased fields (snake_case used by dashboard components)
  position: string;
  candidate_name: string;
  hiring_manager: string;
  department: string;
  start_date: string;
  interview_stage: string;
  source_channel: string;
  salary_offered: string;
  notes: string;
  // Allow additional dynamic fields
  [key: string]: string;
}

export interface Candidate {
  id: string;
  record_id: string;
  candidateId: string;
  candidateName: string;
  positionApplied: string;
  submissionChannel: string;
  interviewProgress: string;
  resumeEvaluation: string;
  status: string;
  commencementDate: string;
  hiringManager: string;
  salaryOffered: string;
  // Allow additional dynamic fields
  [key: string]: string;
}

export interface OnboardingRecord {
  id: string;
  record_id: string;
  onboardingId: string;
  fullName: string;
  incomingStatus: string;
  commencementDate: string;
  department: string;
  position: string;
  offerLetter: string;
  preEmployment: string;
  rankChart: string;
  orgChart: string;
  pFile: string;
  hrConfirmation: string;
  larkAccount: string;
  emailCreation: string;
  accessAssignment: string;
  assetAssignment: string;
  adminConfirmation: string;
  managerConfirmation: string;
  probationPass: string;
  completed: string;
  // Allow additional dynamic fields
  [key: string]: string;
}

export interface OffboardingRecord {
  id: string;
  record_id: string;
  offboardingId: string;
  fullName: string;
  company: string;
  lastWorkingDay: string;
  rankChart: string;
  orgChart: string;
  pFile: string;
  exitInterview: string;
  handoverForm: string;
  hrConfirmation: string;
  accessAssignment: string;
  assetAssignment: string;
  larkAccount: string;
  adminConfirmation: string;
  financeConfirmation: string;
  managerConfirmation: string;
  offboardReason: string;
  offboarded: string;
  // Allow additional dynamic fields
  [key: string]: string;
}

// ---------------------------------------------------------------------------
// Pipeline summary (camelCase — used by pipeline API internally)
// ---------------------------------------------------------------------------

export interface PipelineSummary {
  manpower: {
    total: number;
    pending: number;
    approved: number;
  };
  recruitment: {
    total: number;
    active: number;
    closed: number;
  };
  candidates: {
    total: number;
    shortlisted: number;
    rejected: number;
    offered: number;
  };
  onboarding: {
    total: number;
    inProgress: number;
    completed: number;
  };
  employees: {
    total: number;
    active: number;
  };
  offboarding: {
    total: number;
    inProgress: number;
    completed: number;
  };
}

/**
 * PipelineStats — used by the HR overview client component.
 * Uses snake_case for some fields to match the existing UI expectations.
 */
export interface PipelineStats {
  manpower: {
    total: number;
    pending: number;
    approved: number;
  };
  recruitment: {
    total: number;
    in_progress: number;
    completed: number;
  };
  candidates: {
    total: number;
    shortlisted: number;
    offered: number;
  };
  onboarding: {
    total: number;
    in_progress: number;
    completed: number;
  };
  employees: {
    total: number;
    active: number;
  };
  offboarding: {
    total: number;
    in_progress: number;
    completed: number;
  };
}
