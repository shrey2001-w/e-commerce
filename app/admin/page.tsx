import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "../lib/adminAuth";
import AdminDashboard from "../Components/AdminDashboard";

export const metadata = { title: "Admin Dashboard", robots: { index: false, follow: false } };

async function Gate() {
  if (!(await isAdmin())) redirect("/");
  return <AdminDashboard />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading…</div>}>
      <Gate />
    </Suspense>
  );
}