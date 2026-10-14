import { Suspense } from "react";
import ResetPasswordForm from "@/app/Components/ResetPasswordForm";

async function ResetContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token ?? ""} />;
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <Suspense fallback={<main className="min-h-[70vh]" />}>
      <ResetContent searchParams={searchParams} />
    </Suspense>
  );
}