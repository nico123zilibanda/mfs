import Link from "next/link";

import {
  ArrowRight,
  FileText,
  Search,
} from "lucide-react";

import Container from "@/components/layout/Container";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";


const services = [
  {
    title: "Toa Taarifa",
    description:
      "Wasilisha maoni, malalamiko au taarifa kwa Halmashauri ya Wilaya ya Mlele kupitia mfumo huu wa kidigitali.",
    href: "#feedback-form",
    icon: FileText,
    button: "Wasilisha",
  },
  {
    title: "Fuatilia Taarifa",
    description:
      "Tumia namba yako ya kumbukumbu kufuatilia hatua zilizofikiwa katika kushughulikia taarifa yako.",
    href: "/public/tracking",
    icon: Search,
    button: "Fuatilia",
  },
];


export default function PublicServices() {
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
            mb-12
            max-w-3xl
            text-center

            sm:mb-14
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
            Huduma kwa Wananchi
          </span>


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
            Huduma Zinazopatikana
          </h2>


          <p
            className="
              mt-4
              text-muted-foreground

              dark:text-slate-400
            "
          >
            Mfumo huu unakuwezesha kuwasilisha taarifa mpya au
            kufuatilia maendeleo ya taarifa uliyokwisha kuwasilisha.
          </p>


        </div>



        {/* Cards */}

        <div className="grid gap-6 lg:grid-cols-2">

          {services.map((service) => {

            const Icon = service.icon;


            return (

              <Card
                key={service.title}
                className="
                  group
                  overflow-hidden
                  border
                  border-slate-200
                  bg-white
                  shadow-sm
                  transition-all
                  duration-300

                  hover:-translate-y-1
                  hover:border-emerald-600/40
                  hover:shadow-xl

                  dark:border-slate-800
                  dark:bg-slate-900
                "
              >

                <CardContent
                  className="
                    flex
                    h-full
                    flex-col
                    p-8
                  "
                >


                  {/* Icon */}

                  <div
                    className="
                      mb-6
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
                      text-2xl
                      font-semibold
                      text-slate-950

                      dark:text-white
                    "
                  >
                    {service.title}
                  </h3>



                  <p
                    className="
                      mt-4
                      flex-1
                      leading-7
                      text-muted-foreground

                      dark:text-slate-400
                    "
                  >
                    {service.description}
                  </p>



                  <Button
                    asChild
                    className="
                      mt-8
                      w-fit
                      bg-emerald-600
                      text-white
                      hover:bg-emerald-700

                      dark:hover:bg-emerald-500
                    "
                  >

                    <Link href={service.href}>

                      {service.button}

                      <ArrowRight
                        className="
                          ml-2
                          h-4
                          w-4
                        "
                      />

                    </Link>

                  </Button>


                </CardContent>

              </Card>

            );

          })}


        </div>


      </Container>

    </section>
  );
}