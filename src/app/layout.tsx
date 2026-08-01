import type { Metadata } from "next";
import "./globals.css";
import { Lora, Plus_Jakarta_Sans, Roboto_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "YouTube Growth Stack",
  description:
    "A voice-first workspace for coordinating YouTube growth research.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "font-sans",
        jakarta.variable,
        lora.variable,
        robotoMono.variable,
      )}
    >
      <body className="min-h-screen antialiased">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
