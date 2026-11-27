import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GLASSY STORE — Your Trusted Digital Marketplace",
  description: "Discover digital products in a crystal-clear marketplace."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
