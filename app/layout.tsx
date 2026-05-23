import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "Rolling Recordz Radio",
  description: "Late Night Frequencies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="pt-24">{children}</main>
      </body>
    </html>
  );
}
