import Container from "@/components/layout/Container";


const stats = [
  {
    value: "24/7",
    label: "Mfumo Unapatikana",
  },
  {
    value: "100%",
    label: "Kidigitali",
  },
  {
    value: "1",
    label: "Namba ya Kumbukumbu kwa Kila Taarifa",
  },
  {
    value: "Salama",
    label: "Uhifadhi wa Taarifa",
  },
];


export default function PublicStats() {
  return (
    <section
      className="
        relative
        overflow-hidden

        bg-[#004b2a]

        py-18

        dark:bg-emerald-950

        sm:py-22
      "
    >

      {/* Tanzania gold accent */}

      <div
        className="
          absolute
          -right-20
          -top-20
          h-72
          w-72
          rounded-full
          bg-[#d4a017]/20
          blur-3xl
        "
      />



      <Container>

        <div
          className="
            relative
            mx-auto
            mb-14
            max-w-2xl
            text-center
          "
        >

          <h2
            className="
              text-3xl
              font-bold
              text-white
            "
          >
            Mfumo Unaofanya Kazi Kwa Uwazi
          </h2>


          <p
            className="
              mt-4
              text-emerald-50/80

              dark:text-emerald-100/70
            "
          >
            Mfumo umeundwa kurahisisha mawasiliano kati ya wananchi na
            Halmashauri ya Wilaya ya Mlele kupitia huduma za kidigitali.
          </p>


        </div>




        <div
          className="
            relative
            grid
            gap-8

            sm:grid-cols-2

            lg:grid-cols-4
          "
        >

          {stats.map((item) => (

            <div
              key={item.label}
              className="
                group
                rounded-2xl
                border
                border-white/15
                bg-white/10
                p-6
                text-center
                backdrop-blur

                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-[#d4a017]/50
                hover:bg-white/15


                dark:bg-white/5
              "
            >

              <div
                className="
                  text-4xl
                  font-bold
                  text-white

                  transition-colors
                  duration-300

                  group-hover:text-[#f5cc53]
                "
              >
                {item.value}
              </div>


              <p
                className="
                  mt-3
                  text-sm
                  text-emerald-50/80

                  dark:text-emerald-100/70
                "
              >
                {item.label}
              </p>


            </div>

          ))}


        </div>


      </Container>

    </section>
  );
}