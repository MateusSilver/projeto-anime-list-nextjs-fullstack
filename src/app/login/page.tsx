import type { Metadata } from "next";
import LoginClient from "./loginClient";

export const metadata: Metadata = {
  title: "Entrar",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
