import type { User } from "./auth";

/**
 * Strong TypeScript definitions for Profile Management.
 * Reuses the core User interface.
 */
export interface UserProfile extends User {
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  manager?: string;
  joiningDate?: string;
  salary?: number;

  createdAt?: string;
  updatedAt?: string;
}
