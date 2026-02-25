import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Laundry-Admin",
  description: "Laundry Admin Panel",
  openGraph: {
    title: "Laundry-Admin",
    description: "Laundry Admin Panel",
    images: [
      {
        url: "/assets/washingMachine.jpg",
        width: 1200,
        height: 630,
        alt: "Laundry Admin Panel",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Laundry-Admin",
    description: "Laundry Admin Panel",
    images: ["/assets/washingMachine.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className="antialiased">
        <Toaster position="bottom-center" />
        {children}
      </body>
    </html>
  );
}
