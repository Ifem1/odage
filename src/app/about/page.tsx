export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono-detail text-xs uppercase tracking-[0.3em] text-faded-umber">About</p>
      <h1 className="mt-2 font-display text-3xl text-ink-charcoal">
        A GenLayer-powered archive for layered truth
      </h1>

      <p className="mt-6 leading-relaxed text-shadow-brown/85">
        Odage is a decentralized archive where communities can add new interpretations over old
        events without deleting, replacing, or flattening the earlier meaning. History is not
        always rewritten by removing the old version — sometimes it is rewritten by placing
        another layer above it. The first meaning still exists, but it becomes contested,
        softened, contradicted, expanded, mourned, or reinterpreted.
      </p>

      <h2 className="mt-10 font-display text-xl text-ink-charcoal">Why GenLayer</h2>
      <p className="mt-3 leading-relaxed text-shadow-brown/85">
        GenLayer validators do not choose one final truth. They interpret how a new layer relates
        to previous layers, then reach consensus on how those meanings should remain visible
        together. The non-determinism is not a bug — it is the product. Different validators may
        emphasize different historical, emotional, cultural, artistic, or political dimensions,
        and the contract captures a consensus shape, not a single absolute answer.
      </p>

      <h2 className="mt-10 font-display text-xl text-ink-charcoal">Who it's for</h2>
      <ul className="mt-3 list-inside list-disc space-y-1 text-shadow-brown/85">
        <li>Historians preserving evolving readings of events and documents</li>
        <li>Educators teaching how one event is read differently across time and power</li>
        <li>Art communities layering interpretation over artworks and cultural objects</li>
        <li>Reconciliation projects processing trauma without forcing premature closure</li>
        <li>DAOs and public archives maintaining transparent interpretive evolution</li>
      </ul>

      <h2 className="mt-10 font-display text-xl text-ink-charcoal">What we won't do</h2>
      <p className="mt-3 leading-relaxed text-shadow-brown/85">
        We never let the newest layer silently replace an older one. We never claim that
        validators decide absolute truth. We never treat symbolic or grief-based layers as weak
        simply because they aren't evidentiary. Sensitive memory is always handled with care.
      </p>
    </div>
  );
}
