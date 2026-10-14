import { Suspense } from "react";
import StripeSuccess from "../Components/StripeSuccess";

async function Content({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  return <StripeSuccess sessionId={session_id ?? ""} />;
}

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  return (
    <Suspense fallback={<main className="min-h-[60vh]" />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}