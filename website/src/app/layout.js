import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { SettingsProvider } from '@/context/SettingsContext';
import { AuthProvider } from '@/context/AuthContext';
import { ShopProvider } from '@/context/ShopContext';

export const metadata = {
  title: 'Fleur Notes | Beautiful Handmade Things For Every Moment',
  description: 'Discover handcrafted luxury home decor, natural soy candles, artisanal gift hampers, and boutique accessories.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FAF5EF] text-[#2B1B17]">
        <AuthProvider>
          <ShopProvider>
            <SettingsProvider>
              <Header />
              <main className="flex-1 pb-16 lg:pb-0">{children}</main>
              <Footer />
              <MobileBottomNav />
            </SettingsProvider>
          </ShopProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
