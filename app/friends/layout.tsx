import type { Metadata } from "next";
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import "./friends.css";

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Friends — a private cockpit",
  description:
    "A small AI-assisted email cockpit built for someone specific.",
  robots: { index: false, follow: false },
};

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-friends
      className={`${instrument.variable} ${geist.variable} ${geistMono.variable}`}
    >
      {children}
    </div>
  );
}
