"use client";

import React from "react";
import Link from "next/link";

type TableOfContentsProps = {
  items: { id: string; label: string }[];
};

export default function TableOfContents({ items }: TableOfContentsProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    
    // クライアント側でのみ実行
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    
    try {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 96;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    } catch (error) {
      // エラー時は通常のアンカーリンクにフォールバック
      console.error("Scroll error:", error);
      if (typeof window !== "undefined") {
        window.location.href = `#${id}`;
      }
    }
  };

  return (
    <nav className="mb-8 rounded-lg border border-red-100 bg-red-50/30 p-5">
      <h2 className="mb-4 text-lg font-bold text-gray-900">目次</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className="text-sm text-gray-700 underline-offset-2 hover:text-red-600 hover:underline"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

