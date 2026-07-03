import Link from "next/link";
import { readGetAllRecords } from "@/lib/genlayer/client";

export default async function Home() {
  const records = await readGetAllRecords();
  const examples = records.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
        <p className="font-mono-detail text-xs uppercase tracking-[0.3em] text-faded-umber">
          A GenLayer-powered archive
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-medium leading-tight text-ink-charcoal sm:text-5xl">
          History should not be overwritten.{" "}
          <span className="italic text-oxide-red">It should be layered.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-shadow-brown/80">
          Odage lets communities add new interpretations over old events while keeping earlier
          meanings visible beneath the surface.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/create"
            className="rounded-sm bg-ink-charcoal px-6 py-3 font-mono-detail text-xs uppercase tracking-wider text-soft-linen transition hover:bg-oxide-red"
          >
            Begin a record
          </Link>
          <Link
            href="/explore"
            className="rounded-sm border border-ink-charcoal/70 px-6 py-3 font-mono-detail text-xs uppercase tracking-wider text-ink-charcoal transition hover:border-oxide-red hover:text-oxide-red"
          >
            Explore the archive
          </Link>
        </div>
      </section>

      <div className="torn-divider" />

      {/* What is a memory palimpsest */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="font-display text-2xl text-ink-charcoal">What is a layered memory?</h2>
        <p className="mt-4 max-w-2xl text-shadow-brown/85 leading-relaxed">
          A palimpsest is a manuscript where older writing stays faintly visible beneath newer
          writing. Odage treats every record the same way: the original event sits at the
          bottom, earlier readings remain visible, and newer interpretations are placed above —
          never erasing what came before.
        </p>
      </section>

      {/* How layers work */}
      <section className="border-y border-old-parchment bg-archive-bone/50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-display text-2xl text-ink-charcoal">How layers work</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "A record is created",
                body: "Someone inscribes the base event, object, or testimony — the original surface.",
              },
              {
                step: "02",
                title: "A layer is submitted",
                body: "Another voice adds an interpretation: context, contest, repair, or mourning.",
              },
              {
                step: "03",
                title: "Consensus places it",
                body: "GenLayer validators classify how the layer relates to what's beneath it.",
              },
            ].map((s) => (
              <div key={s.step} className="rounded-sm border border-old-parchment bg-soft-linen p-6">
                <span className="font-mono-detail text-xs text-dust-grey">{s.step}</span>
                <h3 className="mt-2 font-display text-lg text-ink-charcoal">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-shadow-brown/80">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why GenLayer */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="font-display text-2xl text-ink-charcoal">Why this needs GenLayer</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-shadow-brown/85">
          GenLayer validators do not choose one final truth. They interpret how a new layer
          relates to previous layers, then reach consensus on how those meanings should remain
          visible together — preserving disagreement instead of collapsing it into a single
          winner.
        </p>
      </section>

      {/* Example records */}
      <section className="border-t border-old-parchment bg-archive-bone/40 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl text-ink-charcoal">From the archive</h2>
            <Link href="/explore" className="font-mono-detail text-xs uppercase tracking-wider text-consensus-blue hover:text-oxide-red">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {examples.map((r) => (
              <Link
                key={r.record_id}
                href={`/record/${r.record_id}`}
                className="group rounded-sm border border-old-parchment bg-soft-linen p-6 transition hover:border-faded-umber hover:shadow-md"
              >
                <p className="font-mono-detail text-[11px] uppercase tracking-widest text-faded-umber">
                  {r.event_timeframe}
                </p>
                <h3 className="mt-2 font-display text-lg text-ink-charcoal group-hover:text-oxide-red">
                  {r.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-shadow-brown/80">{r.base_event_summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="font-display text-2xl text-ink-charcoal">Ready to add a layer of meaning?</h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/create"
            className="rounded-sm bg-ink-charcoal px-6 py-3 font-mono-detail text-xs uppercase tracking-wider text-soft-linen transition hover:bg-oxide-red"
          >
            Create a record
          </Link>
          <Link
            href="/explore"
            className="rounded-sm border border-ink-charcoal/70 px-6 py-3 font-mono-detail text-xs uppercase tracking-wider text-ink-charcoal transition hover:border-oxide-red hover:text-oxide-red"
          >
            Explore the archive
          </Link>
        </div>
      </section>
    </div>
  );
}
