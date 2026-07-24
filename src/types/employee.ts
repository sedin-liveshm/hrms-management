import type { UserRole } from "./navigation";

export enum EmployeeStatus {
  INVITED = "invited",
  ACTIVE = "active",
  INACTIVE = "inactive",
}

/**
 * Strong TypeScript definitions for Employee model
 */
export interface Employee {
  /** Unique user authentication identifier (null until activated) */
  uid: string | null;
  /** Custom organization employee ID (e.g. EMP-ENG-1024) */
  employeeId: string;
  /** Full name of the employee */
  name: string;
  /** Corporate email address */
  email: string;
  /** Personal contact number */
  phone: string;
  /** Employee gender: 'male' | 'female' | 'other' */
  gender: string;
  /** Birth date in YYYY-MM-DD format */
  dateOfBirth: string;
  /** Department name (e.g. Engineering, HR, Product) */
  department: string;
  /** Job designation (e.g. Senior Software Engineer) */
  designation: string;
  /** RBAC role in the system */
  role: UserRole;
  /** UID or name of direct line manager */
  manager?: string;
  managerId?: string | null;
  managerName?: string | null;
  /** Join date in YYYY-MM-DD format */
  joiningDate: string;
  /** Legacy annual or monthly salary in numerical form. Role-based payroll
   * structures are used for newly created employees. */
  salary?: number;
  /** Employment active status */
  status: "invited" | "active" | "inactive" | "on-leave";
  /** Indicates if the user account has been activated in Firebase Auth */
  authCreated: boolean;
  /** Timestamp when account was activated */
  activatedAt?: string;
  /** Optional profile photo URL */
  photoURL?: string | null;
  /** Profile creation timestamp */
  createdAt?: string;
  /** Profile last update timestamp */
  updatedAt?: string;
}
