export default function SourceTrail({ sources }: { sources: string[] | undefined }) {
  if (!sources || sources.length === 0) {
    return <p className="text-sm italic text-dust-grey">No supporting sources provided.</p>;
  }
  return (
    <div>
      <p className="font-mono-detail mb-2 text-[11px] uppercase tracking-widest text-faded-umber">
        Author-provided sources
      </p>
      <ul className="space-y-1.5">
        {sources.map((src) => (
          <li key={src}>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="font-mono-detail text-xs text-consensus-blue underline decoration-dotted underline-offset-4 hover:text-oxide-red"
            >
              {src}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs italic text-dust-grey">
        Sources are displayed as author-provided evidence and are not independently verified.
      </p>
    </div>
  );
}
