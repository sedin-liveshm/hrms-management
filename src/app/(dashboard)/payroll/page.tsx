import { redirect } from "next/navigation";

export default function PayrollRootPage() {
  // Redirect to the first tab by default
  redirect("/payroll/my-salary");
}
