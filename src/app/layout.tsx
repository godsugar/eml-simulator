import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EML演算子シミュレータ',
  description: '論文 "All Elementary Functions from a Single Operator" (arXiv:2603.21852) に基づくEML演算子シミュレータ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
