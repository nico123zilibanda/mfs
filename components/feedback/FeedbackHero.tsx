import { FilePenLine } from "lucide-react";

export default function FeedbackHero() {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-900/10 text-[#006b3c]">
        <FilePenLine className="h-7 w-7" />
      </div>
      <span className="mt-6 inline-flex rounded-full bg-emerald-900/10 px-4 py-1.5 text-sm font-semibold text-[#006b3c]">
        Wasilisha Taarifa
      </span>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
        Tuma maoni au malalamiko yako
      </h2>
      <p className="mt-4 leading-7 text-slate-600">
        Jaza fomu ifuatayo. Baada ya kuituma, utapokea namba ya kumbukumbu kwa ajili ya ufuatiliaji.
      </p>
    </div>
  );
}
