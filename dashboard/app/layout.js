import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata = {
  title: 'Vardhan Quantum Proxy :: Enterprise CISO Control Center',
  description: 'Zero-Touch Post-Quantum Ingress Interceptor and DORA Audit Feed',
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className="bg-grid-pattern min-h-screen p-4 sm:p-8 text-white antialiased">
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
