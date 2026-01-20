import Link from "next/link";
import React from "react";

export default function ConsentNotice() {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-red-100 bg-white p-4 text-sm text-gray-700">
      <p className="mb-2 leading-relaxed">
        診断を開始することで、
        <Link href="/terms" className="text-red-600 underline-offset-2 hover:text-red-700 hover:underline">
          利用規約
        </Link>
        ・
        <Link href="/privacy" className="text-red-600 underline-offset-2 hover:text-red-700 hover:underline">
          プライバシーポリシー
        </Link>
        に同意したものとみなします。
      </p>
      <p className="text-xs text-gray-500">
        ※ 診断入力や結果は、他ユーザーの分析やAI学習には使用しません。
      </p>
    </div>
  );
}

