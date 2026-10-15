import Link from "next/link";
import type { InfoPageData } from "../data/pages";

export default function InfoPage({ page }: { page: InfoPageData }) {
  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-6 sm:py-10">
      <nav className="mb-4 text-[13px] text-gray-500 sm:text-base">
        <Link href="/" className="hover:text-red-600">Home</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-900">{page.title}</span>
      </nav>

      <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">{page.title}</h1>
      <p className="mt-3 text-base text-gray-600 sm:text-lg">{page.intro}</p>

      <div className="mt-8 space-y-8">
        {page.sections.map((s, i) => (
          <section key={i}>
            {s.heading && (
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">{s.heading}</h2>
            )}
            <div className="mt-2 space-y-2 leading-7 text-gray-600 sm:text-lg sm:leading-8">
              {s.body.map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}