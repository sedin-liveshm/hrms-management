export type PayrollStatus = "Draft" | "Processing" | "Generated" | "Approved" | "Published" | "Locked";
export type PayslipStatus = "Paid" | "Pending" | "On Hold";
export type UpdateRequestStatus = "Pending" | "Approved" | "Rejected";

export interface PayrollRun {
  id: string;
  month: string;
  employees: number;
  total: number;
  status: PayrollStatus;
  date: string; 
  createdAt: string;
}

export interface Payslip {
  id: string;
  runId: string;
  uid: string;
  employeeId: string;
  month: string;
  grossPay: number;
  deduction: number;
  netPay: number;
  status: PayslipStatus;
  createdAt: string;
}

export interface SalaryStructure {
  uid: string;
  employeeId: string;
  department: string;
  designation: string;
  joiningDate: string;
  employmentType: "Full-Time" | "Part-Time" | "Contract";
  effectiveDate: string;
  ctc: number;
  basicPay: number;
  hra: number;
  specialAllowance: number;
  medicalAllowance: number;
  travelAllowance: number;
  otherAllowances: number;
  pfDeduction: number;
  esiDeduction: number;
  professionalTax: number;
  incomeTax: number;
  otherDeductions: number;
}

export interface BankDetails {
  uid: string;
  accountHolder: string;
  bankName: string;
  branch: string;
  ifsc: string;
  accountNumber: string; 
  upiId?: string;
  updateReason?: string;
  requestedAt?: string;
  status: UpdateRequestStatus;
}

export interface DocumentDetails {
  uid: string;
  panNumber: string;
  aadhaarNumber: string;
  panDocumentUrl?: string;
  aadhaarDocumentUrl?: string;
  verificationStatus: "Verified" | "Pending" | "Unverified";
  lastUpdated: string;
}

export interface TaxDetails {
  uid: string;
  regime: "Old" | "New";
  annualTaxableIncome: number;
  tdsDeducted: number;
  remainingTds: number;
  form16Url?: string;
}
