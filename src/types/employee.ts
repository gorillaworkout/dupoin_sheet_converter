export interface Employee {
  record_id: string;
  uuid: string;
  full_name: string;
  nickname: string;
  company: string;
  gender: string;
  job_title: string;
  primary_department: string;
  status: string;
  offboarding_status: string;
  date_of_joining: string;
  work_email: string;
  business_email: string;
  phone_number: string;
  workforce_type: string;
  seats: string;
  nationality: string;
  city: string;
}

export interface EmployeesResponse {
  employees: Employee[];
  total: number;
  active_count: number;
}
