import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import ThemeRegistry from './ThemeRegistry';

export const metadata = {
  title: 'Vision Pro Dashboard :: Vardhan Quantum',
  description: 'Zero-Touch Post-Quantum Ingress Interceptor and DORA Audit Feed',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
