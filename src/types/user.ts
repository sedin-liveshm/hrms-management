import type { UserRole } from "./navigation";


export interface FirestoreUser {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
    displayName: string;
    department: string;
    designation: string;
    employeeId: string;
    isActive: boolean;
    photoURL: string | null;
    createdAt?: string;
    updatedAt?: string;
}
