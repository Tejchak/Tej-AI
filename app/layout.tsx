import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Development Assistant",
  description: "Build faster with AI assistance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800",
        fontSans.className
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
