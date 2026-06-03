import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Markets | July 8-9 Launch Event",
  description:
    "Join the Global Markets launch event. Discover Agents as a Service — AI-powered business automation in your own dedicated environment.",
  openGraph: {
    title: "Global Markets | July 8-9 Launch Event",
    description:
      "AI agents that run your business. Your own VM, your own agents, fully managed.",
    type: "website",
    url: "https://stud.exchange/event",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Markets | July 8-9 Launch Event",
    description:
      "AI agents that run your business. Your own VM, your own agents, fully managed.",
  },
};

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
}
