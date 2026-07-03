"use client";

import Link from "next/link";
import { useWallet } from "@/lib/useWallet";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/create", label: "Inscribe" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
];

function shortenAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function Navbar() {
  const { address, connecting, connect } = useWallet();

  return (
    <header className="sticky top-0 z-40 border-b border-old-parchment/70 bg-soft-linen/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-medium tracking-tight text-ink-charcoal">
            Odage
          </span>
          <span className="font-mono-detail hidden text-[11px] uppercase tracking-widest text-dust-grey sm:inline">
            layered memory
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono-detail text-xs uppercase tracking-wider text-shadow-brown/80 transition hover:text-oxide-red"
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={connect}
            disabled={connecting || Boolean(address)}
            className="rounded-sm border border-ink-charcoal/80 px-3 py-1.5 font-mono-detail text-xs uppercase tracking-wider text-ink-charcoal transition hover:bg-ink-charcoal hover:text-soft-linen disabled:cursor-default disabled:opacity-70"
          >
            {address ? shortenAddress(address) : connecting ? "Connecting…" : "Connect Wallet"}
          </button>
        </nav>
      </div>
    </header>
  );
}
