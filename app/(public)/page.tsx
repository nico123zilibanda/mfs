import Container from "@/components/layout/Container";

export default function HomePage() {
  return (
    <main className="min-h-screen py-16">
      <Container>
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Ongea na DED Mlele
          </h1>

          <p className="mx-auto max-w-2xl text-slate-600">
            Mfumo wa kupokea maoni na taarifa kutoka kwa wananchi wa
            Halmashauri ya Wilaya ya Mlele.
          </p>
        </div>
      </Container>
    </main>
  );
}