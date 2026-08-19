import { FilePenLine } from "lucide-react";

export default function FeedbackHero() {
  return (
    <div
      className="
        mx-auto
        mb-10
        max-w-2xl
        text-center

        sm:mb-12
      "
    >
      {/* Icon */}

      <div
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl

          bg-emerald-600/10
          text-emerald-700

          transition-colors
          duration-300


          dark:bg-emerald-400/10
          dark:text-emerald-400
        "
      >
        <FilePenLine className="h-7 w-7" />
      </div>

      {/* Badge */}

      <span
        className="
          mt-6
          inline-flex
          rounded-full

          bg-emerald-600/10

          px-4
          py-1.5

          text-sm
          font-semibold

          text-emerald-700


          dark:bg-emerald-400/10
          dark:text-emerald-400
        "
      >
        Wasilisha Taarifa
      </span>

      {/* Title */}

      <h2
        className="
          mt-4
          text-3xl
          font-bold
          tracking-tight

          text-slate-950


          dark:text-white


          md:text-4xl
        "
      >
        Tuma maoni au malalamiko yako
      </h2>

      {/* Description */}

      <p
        className="
          mt-4
          leading-7

          text-slate-600


          dark:text-slate-400
        "
      >
        Jaza fomu ifuatayo. Baada ya kuituma, utapokea namba ya kumbukumbu kwa
        ajili ya ufuatiliaji.
      </p>
    </div>
  );
}
