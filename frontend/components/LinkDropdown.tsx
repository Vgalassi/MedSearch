"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  urls: { href?: string; label: string; onClick?: () => void | Promise<void> }[];
  title: string;
}

export default function LinkDropdown({ urls, title }: Props) {
  const [open, setOpen] = useState(false);

  function handleClick() {
    setOpen((open) => !open);
  }

  return (
    <div className="relative inline-block">
      <button
        className="btn-secondary px-3 py-2"
        onClick={handleClick}
        type="button"
      >
        {title}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-2 shadow-xl shadow-slate-200/70">
          {urls.map((url, index) => (
            url.href ? (
              <Link
                key={index}
                href={url.href}
                className="block px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-800"
                onClick={() => setOpen(false)}
              >
                {url.label}
              </Link>
            ) : (
              <button
                key={index}
                className="block w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-800"
                onClick={async () => {
                  setOpen(false);
                  await url.onClick?.();
                }}
                type="button"
              >
                {url.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}
