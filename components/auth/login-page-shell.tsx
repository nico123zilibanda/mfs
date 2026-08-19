"use client";

import LoginCard from "./login-card";
import LoginImageSlider from "./login-image-slider";

export default function LoginPageShell() {
  return (
    <main
      className="
        min-h-screen

        bg-linear-to-br
        from-slate-50
        via-white
        to-emerald-50

        dark:from-slate-950
        dark:via-slate-900
        dark:to-emerald-950

        transition-colors
        duration-500
      "
    >

      <div
        className="
          grid
          min-h-screen

          lg:grid-cols-5
        "
      >


        {/* Left Side */}
        <div
          className="
            hidden

            lg:col-span-3
            lg:block

            p-4
            lg:p-6
          "
        >

          <LoginImageSlider />

        </div>




        {/* Right Side */}
        <div
          className="
            relative

            flex
            items-center
            justify-center

            overflow-hidden

            px-6
            py-10

            sm:px-10

            lg:col-span-2
          "
        >


          {/* Background Decorations */}
          <div
            className="
              absolute
              inset-0
              overflow-hidden
            "
          >

            {/* Emerald Glow */}
            <div
              className="
                absolute
                left-0
                top-0

                h-72
                w-72

                rounded-full

                bg-emerald-100/70

                blur-3xl


                dark:bg-emerald-500/10
              "
            />


            {/* Gold Glow */}
            <div
              className="
                absolute
                bottom-0
                right-0

                h-80
                w-80

                rounded-full

                bg-yellow-100/70

                blur-3xl


                dark:bg-yellow-500/10
              "
            />


            {/* Extra Dark Depth */}
            <div
              className="
                absolute
                inset-0

                bg-white/20

                dark:bg-black/10
              "
            />


          </div>




          {/* Login Content */}
          <div
            className="
              relative
              z-10

              w-full

              max-w-xl
            "
          >

            <LoginCard />

          </div>


        </div>


      </div>

    </main>
  );
}