import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pian1st — Steinway Piano Backing Track Studio',
  description: 'Ứng dụng tạo nhạc đệm Piano tự động theo tone, hợp âm và kiểu đệm tùy chỉnh dành riêng cho người tập hát.',
  keywords: ['piano backing track', 'nhạc đệm piano', 'tập hát', 'vòng hợp âm', 'piano virtual', 'steinway'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-[#0B0C10] text-[#F5F2EB] antialiased selection:bg-[#D4AF37] selection:text-[#0B0C10]">
        {children}
      </body>
    </html>
  );
}
