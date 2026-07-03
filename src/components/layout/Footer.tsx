export default function Footer() {
  return (
    <footer className="border-t border-old-parchment/70 bg-archive-bone/60">
      <div className="torn-divider" />
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-shadow-brown/70 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display italic">History should not be overwritten. It should be layered.</p>
        <p className="font-mono-detail text-xs uppercase tracking-widest text-dust-grey">
          Odage · built on GenLayer
        </p>
      </div>
    </footer>
  );
}
