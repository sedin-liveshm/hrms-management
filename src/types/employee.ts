import type { UserRole } from "./navigation";

export interface Employee {
  /** Unique user authentication identifier */
  uid: string;
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
  /** Join date in YYYY-MM-DD format */
  joiningDate: string;
  /** Annual or monthly salary in numerical form */
  salary: number;
  /** Employment active status */
  status: "active" | "inactive" | "on-leave";
  /** Optional profile photo URL */
  photoURL?: string | null;
  /** Profile creation timestamp */
  createdAt?: string;
  /** Profile last update timestamp */
  updatedAt?: string;
}
