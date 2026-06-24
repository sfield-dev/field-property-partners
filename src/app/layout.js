import './globals.css';

export const metadata = {
  title: 'Field Property Partners',
  description: 'Institutional-grade property sourcing in Manchester & Liverpool',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}