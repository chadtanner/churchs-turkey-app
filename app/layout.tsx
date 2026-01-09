import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
    title: "Church's Texas Chicken - Thanksgiving Turkey Reservation",
    description: "Reserve your fully cooked, smoked turkey for Thanksgiving pickup at Church's Texas Chicken",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Header />
                <main style={{ minHeight: 'calc(100vh - 200px)' }}>
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
