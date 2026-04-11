import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import { WinHereChatView } from "@/components/win-here/chat-view";

export const metadata: Metadata = {
  title: "How do I get my time and energy back? | Salience",
  description:
    "Live chat with Salience. Tell us about your week — we'll canvass your business, find what's eating your day, and show you what AI can actually take off your plate.",
};

export default function WinHerePage() {
  return (
    <>
      <Navbar />
      <WinHereChatView />
    </>
  );
}
