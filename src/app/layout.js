import "./globals.css";
import { AppProvider } from "../components/Context";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Bommal Foods | Wholesale Food Products & Edible Oils",
  description: "Shop premium wood-pressed groundnut oil, coconut oil, organic millets, rice varieties, masalas, health mixes, and brown sugar from Bommal Foods wholesale platform. Instant ordering for retailers and distributors.",
  keywords: "Bommal Foods, wholesale food, edible oils, groundnut oil, organic millets, rice distributor, masala powders, Chennai, health mix, nattu sakkarai",
  openGraph: {
    title: "Bommal Foods | Wholesale Food Products & Edible Oils",
    description: "Premium wholesale food products and wood-pressed oils. Order online in bulk.",
    type: "website",
    locale: "en_IN",
    siteName: "Bommal Foods",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: '1 0 auto' }}>
              {children}
            </main>
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
