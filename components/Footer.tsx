import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-red-100 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-gray-600">
        <div className="flex flex-wrap gap-4">
          <Link href="/terms" className="hover:text-gray-900">利用規約</Link>
          <Link href="/privacy" className="hover:text-gray-900">プライバシーポリシー</Link>
        </div>
        <p className="mt-4 text-xs text-gray-500">© {new Date().getFullYear()} Lumipath</p>
      </div>
    </footer>
  );
}

