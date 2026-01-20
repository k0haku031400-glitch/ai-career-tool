import Link from "next/link";
import React from "react";

type Props = {
  title: string;
  updatedAt: string; // YYYY-MM-DD
  children: React.ReactNode;
  toc?: React.ReactNode;
};

export default function LegalLayout({ title, updatedAt, toc, children }: Props) {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-red-600" />
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Lumipathに戻る
            </Link>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            最終更新日: <span className="font-medium text-gray-800">{updatedAt}</span>
          </p>

          <div className="mt-6 h-px w-full bg-red-100" />
        </header>

        {toc && <div>{toc}</div>}

        <article className="space-y-4 text-gray-700 leading-relaxed [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_p]:mb-4 [&_p]:leading-relaxed [&_ol]:mb-4 [&_ol]:ml-6 [&_ol]:list-decimal [&_ul]:mb-4 [&_ul]:ml-6 [&_ul]:list-disc [&_li]:mb-2 [&_a]:text-red-600 [&_a]:underline hover:[&_a]:text-red-700">
          {children}
        </article>

        <footer className="mt-12 border-t border-red-100 pt-6 text-sm text-gray-600">
          <div className="flex flex-wrap gap-4">
            <Link href="/terms" className="hover:text-gray-900">
              利用規約
            </Link>
            <Link href="/privacy" className="hover:text-gray-900">
              プライバシーポリシー
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            ※ 本ページは参考情報です。必要に応じて専門家にご相談ください。
          </p>
        </footer>
      </div>
    </main>
  );
}

