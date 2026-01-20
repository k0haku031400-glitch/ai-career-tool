"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-5">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          エラーが発生しました
        </h1>
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
          <p className="mb-2 text-sm font-semibold text-red-800">エラー詳細:</p>
          <p className="mb-2 text-sm text-red-700">{error.message || "不明なエラー"}</p>
          {error.digest && (
            <p className="text-xs text-red-600">エラーID: {error.digest}</p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700"
          >
            もう一度試す
          </button>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            ホームに戻る
          </Link>
        </div>
        <div className="mt-8 text-xs text-gray-500">
          <p>問題が解決しない場合は、ページをリロードしてください。</p>
        </div>
      </div>
    </div>
  );
}

