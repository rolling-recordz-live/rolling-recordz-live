"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function Nav() {
  const router = useRouter();
  const menuRef = useRef<HTMLDetailsElement | null>(null);
  const clicks = useRef(0);
  const timer = useRef<NodeJS.Timeout | null>(null);

  function secretOwnerClick(e: React.MouseEvent) {
    e.preventDefault();
    clicks.current += 1;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => (clicks.current = 0), 900);

    if (clicks.current >= 5) {
      clicks.current = 0;
      router.push("/owner");
    }
  }

  const links = [
    ["Home", "/"],
    ["Radio", "/radio"],
    ["Artist Upload", "/upload"],
    ["Record Players", "/record-players"],
    ["Gallery", "/gallery"],
    ["Community", "/community"],
    ["Artists", "/artists"],
    ["Book Service", "/contact"],
    ["Services", "/services"],
    ["Packages", "/packages"],
    ["About", "/about"],
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[999999] bg-black border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/" onClick={secretOwnerClick} className="font-black text-2xl leading-none">
          <div>ROLLING</div>
          <div className="text-[#25c8ff]">RECORDZ</div>
        </Link>

        <nav className="hidden lg:flex gap-4 text-sm font-bold">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>

        <details ref={menuRef} className="lg:hidden relative">
          <summary className="list-none rounded-full border border-white/20 px-4 py-3 text-base font-black bg-[#25c8ff] text-black cursor-pointer">
            Menu
          </summary>

          <div className="absolute right-0 top-14 w-[86vw] max-h-[75vh] overflow-y-auto rounded-2xl border border-white/10 bg-black p-3 grid gap-2 shadow-2xl">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  if (menuRef.current) menuRef.current.open = false;
                }}
                className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white font-black"
              >
                {label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}
