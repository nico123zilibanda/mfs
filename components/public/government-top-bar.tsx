import Image from "next/image";

export default function GovernmentTopBar() {
  return (
    <header
      className="
        relative
        w-full
        overflow-hidden
        border-b
        border-slate-900/20
        bg-slate-950
        shadow-sm
      "
      aria-label="Government of Tanzania"
    >
      <div
        className="
          relative
          w-full
          bg-slate-950
        "
      >
        <Image
          src="/images/Malalamiko_Portal_banner_2.png"
          alt="Malalamiko Portal — President's Office, Public Service Recruitment Secretariat"
          width={2048}
          height={134}
          priority
          sizes="100vw"
          className="
            block
            h-auto
            w-full
            max-w-none
            select-none
          "
          draggable={false}
        />

        {/* Premium subtle overlay */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-linear-to-b
            from-white/3
            via-transparent
            to-black/8
          "
        />

        {/* Bottom highlight */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-px
            bg-white/20
          "
        />
      </div>
    </header>
  );
}