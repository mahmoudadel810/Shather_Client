// app/layout.jsx
import { Inter } from 'next/font/google';
import ReduxProvider from '../componants/ReduxProvider.jsx';
import ThemeInitializer from '../componants/ThemeInitializer/ThemeInitializer.jsx';
import Navbar from '../componants/Navepar/Navepar.jsx'; 
import Footer from '../componants/Footer/Footer.jsx';
import AuthChecked from '../componants/AuthGuard/authChecked.jsx';
import './globals.css';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Multi-Language & Theme App',
  description: 'Next.js app with Redux for language and theme management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
          <ThemeInitializer />
          <AuthChecked>
            <Navbar/>
            {children}
            <Footer/>
          </AuthChecked>
        </ReduxProvider>
      </body>
    </html>
  );
}