"use client";

import { useCallback, useEffect, useState } from "react";

type InjectedProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

function getInjectedProvider(): InjectedProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window.genlayer ?? window.ethereum) as InjectedProvider | undefined;
}

// Tracks the connected injected-wallet address (GenLayer/MetaMask-style provider)
// so pages can scope reads/writes to the current user without a global store.
export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const provider = getInjectedProvider();
    if (!provider) return;
    provider
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const list = accounts as string[];
        if (list.length > 0) setAddress(list[0]);
      })
      .catch(() => {});
  }, []);

  const connect = useCallback(async () => {
    const provider = getInjectedProvider();
    if (!provider) {
      window.alert("No injected wallet found. Install a GenLayer-compatible wallet extension.");
      return;
    }
    setConnecting(true);
    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      if (accounts.length > 0) setAddress(accounts[0]);
    } finally {
      setConnecting(false);
    }
  }, []);

  return { address, connecting, connect };
}
