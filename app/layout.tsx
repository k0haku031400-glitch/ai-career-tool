export const metadata = {
  title: 'Lumipath - 今の自分を、行動から可視化するキャリア診断',
  description: '今の自分を、行動から可視化するキャリア診断。好きな行動・経験から、C/L/T（思考・行動・対人）の傾向を分析し、業種レベルで今の方向性を提示します。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
