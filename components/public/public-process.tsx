import {
  FileText,
  Search,
  MessageCircleMore,
} from "lucide-react";

import Container from "@/components/layout/Container";


const steps = [
  {
    number: "01",
    title: "Jaza Taarifa",
    description:
      "Weka taarifa zako na maelezo ya malalamiko au maoni kupitia fomu ya mfumo.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Pokea Namba ya Kumbukumbu",
    description:
      "Baada ya kutuma taarifa utapatiwa namba ya kumbukumbu kwa ajili ya ufuatiliaji.",
    icon: Search,
  },
  {
    number: "03",
    title: "Fuatilia Maendeleo",
    description:
      "Tumia namba hiyo kufuatilia maendeleo ya uchakataji wa taarifa yako wakati wowote.",
    icon: MessageCircleMore,
  },
];


export default function PublicProcess() {
  return (
    <section
      className="
        bg-slate-50
        py-18

        dark:bg-slate-950

        sm:py-24
      "
    >

      <Container>


        {/* Heading */}

        <div
          className="
            mx-auto
            max-w-3xl
            text-center
          "
        >

          <span
            className="
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
            Jinsi Mfumo Unavyofanya Kazi
          </span>



          <h2
            className="
              mt-5
              text-3xl
              font-bold
              tracking-tight
              text-slate-950

              dark:text-white

              md:text-4xl
            "
          >
            Hatua 3 Rahisi za Kuwasilisha Taarifa
          </h2>



          <p
            className="
              mt-4
              text-muted-foreground

              dark:text-slate-400
            "
          >
            Mchakato umeboreshwa ili uwe rahisi kwa kila mwananchi.
          </p>


        </div>




        {/* Steps */}

        <div
          className="
            mt-12
            grid
            gap-5

            sm:mt-16

            lg:grid-cols-3
          "
        >

          {steps.map((step) => {

            const Icon = step.icon;


            return (

              <div
                key={step.number}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-7
                  shadow-sm

                  transition-all
                  duration-300

                  hover:-translate-y-1
                  hover:border-emerald-600/40
                  hover:shadow-lg


                  dark:border-slate-800
                  dark:bg-slate-900

                  dark:hover:border-emerald-500/40
                "
              >


                {/* Step Number */}

                <span
                  className="
                    absolute
                    right-6
                    top-6

                    text-5xl
                    font-bold

                    text-emerald-600/10

                    transition-colors
                    duration-300

                    group-hover:text-[#d4a017]/20

                    dark:text-emerald-400/10
                  "
                >
                  {step.number}
                </span>



                {/* Icon */}

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-xl

                    bg-emerald-600/10
                    text-emerald-700


                    transition-all
                    duration-300


                    group-hover:bg-emerald-600
                    group-hover:text-white


                    dark:bg-emerald-400/10
                    dark:text-emerald-400


                    dark:group-hover:bg-emerald-600
                    dark:group-hover:text-white
                  "
                >

                  <Icon className="h-7 w-7" />

                </div>




                <h3
                  className="
                    mt-6
                    text-xl
                    font-semibold

                    text-slate-950

                    dark:text-white
                  "
                >
                  {step.title}
                </h3>




                <p
                  className="
                    mt-4
                    leading-7

                    text-muted-foreground

                    dark:text-slate-400
                  "
                >
                  {step.description}
                </p>



              </div>

            );

          })}


        </div>


      </Container>

    </section>
  );
}