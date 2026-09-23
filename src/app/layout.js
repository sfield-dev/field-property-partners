import './globals.css';

export const metadata = {
  title: 'Field Property Partners',
  description: 'Institutional-grade property sourcing in Manchester & Liverpool',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}