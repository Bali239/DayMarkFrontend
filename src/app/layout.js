import Providers from "./Providers";
import "./globals.css";

export const metadata = {
  title: "Daymark — Make room for what matters",
  description: "A calmer way to keep track of the things that matter.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
