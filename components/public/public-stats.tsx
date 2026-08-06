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
    <section className="bg-[#004b2a] py-18 text-white sm:py-22">
      <Container>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold">
            Mfumo Unaofanya Kazi Kwa Uwazi
          </h2>

          <p className="mt-4 text-emerald-50/80">
            Mfumo umeundwa kurahisisha mawasiliano kati ya wananchi na
            Halmashauri ya Wilaya ya Mlele kupitia huduma za kidigitali.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/15 bg-white/8 p-6 text-center backdrop-blur sm:p-8"
            >
              <div className="text-4xl font-bold">
                {item.value}
              </div>

              <p className="mt-3 text-sm text-emerald-50/80">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
