'use client'

import { useState } from "react"
import Link from "next/link"

interface Props {
  urls: {href: string, label: string}[]
  title: string
}

export default function LinkDropdown({ urls, title }: Props) {
  const [open, setOpen] = useState(false)

  function handleClick() {
    setOpen((open) => !open)
  }

  return (
    <div className="relative inline-block">
      <button
        className="bg-white border-1 px-4 py-2 rounded hover:bg-blue-600 cursor-pointer m-4"
        onClick={handleClick}
      >
        {title}
      </button>

      {open && (
        <div className="absolute mt-2 w-40 bg-white border rounded shadow-lg">
          {urls.map((url, index) => (
            <Link
              key={index}
              href={url.href}
              className="block px-4 py-2 hover:bg-gray-100"
            >
              {url.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}