"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function FeedbackHero() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        mx-auto
        mb-10
        max-w-3xl
        text-center

        sm:mb-12
      "
    >
      {/* National Logo */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.75,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.6,
          delay: 0.1,
          type: "spring",
          stiffness: 220,
          damping: 18,
        }}
        className="
          relative
          mx-auto
          flex
          h-28
          w-28
          items-center
          justify-center
          rounded-full

          border
          border-purple-900/10

          bg-white

          shadow-xl
          shadow-purple-950/10

          ring-4
          ring-purple-100

          dark:border-purple-400/20
          dark:bg-slate-900
          dark:ring-purple-900/40
        "
      >
        <Image
          src="/images/tanzania-logo.png"
          alt="Nembo ya Taifa"
          width={78}
          height={78}
          sizes="20"
          priority
          className="
            object-contain
          "
        />

        {/* Subtle decorative ring */}
        <motion.div
          aria-hidden="true"
          initial={{
            opacity: 0,
            scale: 0.85,
          }}
          animate={{
            opacity: [0, 0.35, 0],
            scale: [0.85, 1.2, 1.3],
          }}
          transition={{
            duration: 2,
            delay: 0.7,
            ease: "easeOut",
          }}
          className="
            pointer-events-none
            absolute
            inset-0
            rounded-full
            ring-2
            ring-purple-400
          "
        />
      </motion.div>

      {/* Badge */}
      <motion.span
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          delay: 0.25,
        }}
        className="
          mt-3
          inline-flex
          items-center
          rounded-full

          border
          border-purple-200

          bg-purple-50

          px-4
          py-1.5

          text-sm
          font-semibold

          text-purple-700

          shadow-sm

          dark:border-purple-900/50
          dark:bg-purple-950/40
          dark:text-purple-300
        "
      >
        Wasilisha Taarifa
      </motion.span>

      {/* Title */}
      <motion.h2
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          delay: 0.35,
        }}
        className="
          mt-4

          text-3xl
          font-bold
          tracking-tight

          text-slate-950

          sm:text-4xl
          md:text-5xl

          dark:text-white
        "
      >
        Wasilisha Malalamiko Yako Hapa
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          delay: 0.45,
        }}
        className="
          mx-auto
          mt-2
          max-w-2xl

          text-sm
          leading-7

          text-slate-500

          sm:text-base

          dark:text-slate-400
        "
      >
        Baada ya kutuma
        taarifa yako, utapokea namba ya kumbukumbu kwa ajili
        ya ufuatiliaji.
      </motion.p>
    </motion.div>
  );
}