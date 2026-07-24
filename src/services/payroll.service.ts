import { db } from "@/firebase/firestore";
import { isFirebaseConfigured } from "@/firebase/config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { employeeService } from "@/services/employee.service";
import type { 
  PayrollRun, 
  Payslip, 
  SalaryStructure, 
  BankDetails, 
} from "@/types/payroll";
import { leaveService } from "@/services/leave.service";
import type { LeaveType } from "@/types/leave";

export const ROLE_SALARIES: Record<string, SalaryStructure> = {
  employee: {
    uid: "",
    employeeId: "",
    department: "Engineering",
    designation: "Software Engineer",
    joiningDate: "2024-01-15",
    employmentType: "Full-Time",
    effectiveDate: "2026-04-01",
    ctc: 576000,
    basicPay: 25000,
    hra: 10000,
    specialAllowance: 7000,
    medicalAllowance: 2000,
    travelAllowance: 1500,
    otherAllowances: 2500,
    pfDeduction: 1800,
    esiDeduction: 0,
    professionalTax: 200,
    incomeTax: 1000,
    otherDeductions: 0,
  },
  hr: {
    uid: "",
    employeeId: "",
    department: "Human Resources",
    designation: "HR Manager",
    joiningDate: "2023-06-10",
    employmentType: "Full-Time",
    effectiveDate: "2026-04-01",
    ctc: 780000,
    basicPay: 35000,
    hra: 14000,
    specialAllowance: 9000,
    medicalAllowance: 2500,
    travelAllowance: 2500,
    otherAllowances: 2000,
    pfDeduction: 2500,
    esiDeduction: 0,
    professionalTax: 200,
    incomeTax: 2300,
    otherDeductions: 0,
  },
  admin: {
    uid: "",
    employeeId: "",
    department: "Operations",
    designation: "System Administrator",
    joiningDate: "2022-11-01",
    employmentType: "Full-Time",
    effectiveDate: "2026-04-01",
    ctc: 996000,
    basicPay: 45000,
    hra: 18000,
    specialAllowance: 13000,
    medicalAllowance: 2500,
    travelAllowance: 2500,
    otherAllowances: 2000,
    pfDeduction: 2800,
    esiDeduction: 0,
    professionalTax: 200,
    incomeTax: 6000,
    otherDeductions: 0,
  },
  manager: {
    uid: "",
    employeeId: "",
    department: "Management",
    designation: "General Manager",
    joiningDate: "2021-03-20",
    employmentType: "Full-Time",
    effectiveDate: "2026-04-01",
    ctc: 1320000,
    basicPay: 60000,
    hra: 24000,
    specialAllowance: 18000,
    medicalAllowance: 3000,
    travelAllowance: 3000,
    otherAllowances: 2000,
    pfDeduction: 3000,
    esiDeduction: 0,
    professionalTax: 200,
    incomeTax: 11800,
    otherDeductions: 0,
  }
};

class PayrollService {
  private isFirebaseEnabled(): boolean {
    return isFirebaseConfigured && db !== null;
  }

  // -----------------------------------------
  // SALARY STRUCTURE
  // -----------------------------------------

  public async getSalaryStructure(uid: string, role: string): Promise<SalaryStructure> {
    const baseStructure = ROLE_SALARIES[role] || ROLE_SALARIES["employee"];
    
    // We dynamically calculate LOP deduction based on current leave balances
    // For V1, we calculate LOP amount based on (Gross / 30) * extra leaves taken
    const gross = baseStructure.basicPay + baseStructure.hra + baseStructure.specialAllowance + 
                  baseStructure.medicalAllowance + baseStructure.travelAllowance + baseStructure.otherAllowances;
    
    const perDaySalary = gross / 30;
    
    let lopDays = 0;
    try {
      const balances = await leaveService.getLeaveBalances(uid);
      // Extra leaves taken beyond allocation or explicit LOP leaves
      Object.keys(balances).forEach((key) => {
        const type = key as LeaveType;
        if (type === "lop") {
          lopDays += balances[type].used;
        } else {
          // If used > allocated, the excess is LOP
          if (balances[type].used > balances[type].allocated) {
            lopDays += (balances[type].used - balances[type].allocated);
          }
        }
      });
    } catch (error) {
      console.warn("Could not fetch leave balances for LOP calculation", error);
    }

    const lopDeduction = Math.round(lopDays * perDaySalary);
    
    return {
      ...baseStructure,
      uid,
      employeeId: `EMP-${uid.substring(0,4).toUpperCase()}`,
      otherDeductions: lopDeduction, // Assign LOP to other deductions
    };
  }

  // -----------------------------------------
  // RUNS & PAYSLIPS
  // -----------------------------------------

  public async generatePayslips(month: string): Promise<number> {
    const employees = await employeeService.getAllEmployees();
    const eligibleEmployees = employees.filter(
      (employee) => employee.uid && employee.status !== "inactive"
    );
    const monthKey = month.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const createdAt = new Date().toISOString();

    const payslips = await Promise.all(
      eligibleEmployees.map(async (employee) => {
        const structure = await this.getSalaryStructure(employee.uid!, employee.role);
        const grossPay = structure.basicPay + structure.hra + structure.specialAllowance
          + structure.medicalAllowance + structure.travelAllowance + structure.otherAllowances;
        const deduction = structure.pfDeduction + structure.esiDeduction
          + structure.professionalTax + structure.incomeTax + structure.otherDeductions;

        return {
          id: `ps-${employee.uid}-${monthKey}`,
          runId: `run-${monthKey}`,
          uid: employee.uid!,
          employeeId: employee.employeeId,
          month,
          grossPay,
          deduction,
          netPay: grossPay - deduction,
          status: "Paid" as const,
          createdAt,
        } satisfies Payslip;
      })
    );

    try {
      if (this.isFirebaseEnabled()) {
        await Promise.all(
          payslips.map((payslip) => setDoc(doc(db!, "payslips", payslip.id), payslip))
        );
      } else if (typeof window !== "undefined") {
        payslips.forEach((payslip) => {
          localStorage.setItem(`hrms_payslip_${payslip.id}`, JSON.stringify(payslip));
        });
      }
    } catch (error) {
      console.error("Firestore payroll generation failed:", error);
      const code = (error as { code?: string }).code;
      if (code === "permission-denied") {
        throw new Error("Firestore does not permit payroll generation. Add the payslip rule in the Firebase Console.");
      }
      throw new Error("Unable to generate payslips. Please try again.");
    }

    return payslips.length;
  }

  public async getEmployeePayslips(uid: string, role: string): Promise<Payslip[]> {
    let generatedPayslips: Payslip[] = [];

    try {
      if (this.isFirebaseEnabled()) {
        const q = query(collection(db!, "payslips"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        generatedPayslips = querySnapshot.docs.map((snapshot) => snapshot.data() as Payslip);
      } else if (typeof window !== "undefined") {
        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index);
          if (key?.startsWith("hrms_payslip_")) {
            const stored = localStorage.getItem(key);
            if (stored) {
              const payslip = JSON.parse(stored) as Payslip;
              if (payslip.uid === uid) generatedPayslips.push(payslip);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to load generated payslips:", error);
    }

    if (generatedPayslips.length > 0) {
      return generatedPayslips.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Generate 6 months of historical mock payslips based on role
    const structure = await this.getSalaryStructure(uid, role);
    
    const gross = structure.basicPay + structure.hra + structure.specialAllowance + 
                  structure.medicalAllowance + structure.travelAllowance + structure.otherAllowances;
    const baseDeductions = structure.pfDeduction + structure.esiDeduction + 
                           structure.professionalTax + structure.incomeTax;
    
    const payslips: Payslip[] = [];
    const months = ["Jun 2026", "May 2026", "Apr 2026", "Mar 2026", "Feb 2026", "Jan 2026"];
    
    months.forEach((month, idx) => {
      // Apply LOP only to the most recent month for demonstration, otherwise 0
      const deductions = (idx === 0) ? baseDeductions + structure.otherDeductions : baseDeductions;
      
      payslips.push({
        id: `ps-${uid}-${idx}`,
        runId: `run-${idx}`,
        uid,
        employeeId: structure.employeeId,
        month,
        grossPay: gross,
        deduction: deductions,
        netPay: gross - deductions,
        status: "Paid",
        createdAt: new Date(2026, 5 - idx, 28).toISOString(),
      });
    });

    return payslips;
  }

  // -----------------------------------------
  // BANK DETAILS
  // -----------------------------------------

  public async getBankDetails(uid: string): Promise<BankDetails> {
    if (this.isFirebaseEnabled()) {
      try {
        const docRef = doc(db!, "employee_bank_details", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as BankDetails;
        }
      } catch (error) {
        console.error("Firestore getBankDetails failed:", error);
      }
    } else {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(`hrms_bank_${uid}`);
        if (stored) return JSON.parse(stored) as BankDetails;
      }
    }

    // Default mock bank details if none exist
    return {
      uid,
      accountHolder: "Default User",
      bankName: "HDFC Bank",
      branch: "Chennai",
      ifsc: "HDFC0001234",
      accountNumber: "XXXXXX4587",
      status: "Approved",
    };
  }

  public async requestBankUpdate(
    uid: string,
    details: Partial<BankDetails>,
    updateReason: string
  ): Promise<void> {
    const existing = await this.getBankDetails(uid);
    const merged = {
      ...existing,
      ...details,
      uid,
      status: "Pending",
      updateReason,
      requestedAt: new Date().toISOString(),
    } as BankDetails;
    
    if (this.isFirebaseEnabled()) {
      try {
        await setDoc(doc(db!, "employee_bank_details", uid), merged, { merge: true });
      } catch (error) {
        console.error("Firestore bank update request failed:", error);
        const code = (error as { code?: string }).code;
        if (code === "permission-denied") {
          throw new Error(
            "Bank requests are not yet permitted by Firestore. Add the bank-details rule in the Firebase Console, then try again."
          );
        }
        throw new Error("Unable to submit the bank update request. Please try again.");
      }
    } else {
      localStorage.setItem(`hrms_bank_${uid}`, JSON.stringify(merged));
    }
  }

  // -----------------------------------------
  // ADMIN FUNCTIONS
  // -----------------------------------------

  public async getPendingBankRequests(): Promise<BankDetails[]> {
    let list: BankDetails[] = [];
    if (this.isFirebaseEnabled()) {
      try {
        const q = query(collection(db!, "employee_bank_details"), where("status", "==", "Pending"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((d) => list.push(d.data() as BankDetails));
      } catch (error) {
        console.error("Firestore getPendingBankRequests failed:", error);
        // Fallback to local storage if firestore fails (e.g. permission error)
        if (typeof window !== "undefined") {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("hrms_bank_")) {
              const stored = localStorage.getItem(key);
              if (stored) {
                const parsed = JSON.parse(stored) as BankDetails;
                if (parsed.status === "Pending") list.push(parsed);
              }
            }
          }
        }
      }
    } else {
      if (typeof window === "undefined") return [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("hrms_bank_")) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored) as BankDetails;
            if (parsed.status === "Pending") list.push(parsed);
          }
        }
      }
    }
    return list;
  }

  public async approveBankRequest(uid: string): Promise<void> {
    const existing = await this.getBankDetails(uid);
    const merged = { ...existing, status: "Approved" } as BankDetails;
    if (this.isFirebaseEnabled()) {
      await setDoc(doc(db!, "employee_bank_details", uid), merged, { merge: true });
    } else {
      localStorage.setItem(`hrms_bank_${uid}`, JSON.stringify(merged));
    }
  }

  public async rejectBankRequest(uid: string): Promise<void> {
    const existing = await this.getBankDetails(uid);
    const merged = { ...existing, status: "Rejected" } as BankDetails;
    if (this.isFirebaseEnabled()) {
      await setDoc(doc(db!, "employee_bank_details", uid), merged, { merge: true });
    } else {
      localStorage.setItem(`hrms_bank_${uid}`, JSON.stringify(merged));
    }
  }
}

export const payrollService = new PayrollService();
export default payrollService;
