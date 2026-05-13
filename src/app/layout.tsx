import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'ParkFlow — Parking Management',
  description: 'Modern parking management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="mesh-bg" />
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            },
          }}
        />
      </body>
    </html>
  );
}
