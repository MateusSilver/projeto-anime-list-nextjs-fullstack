import type { Metadata } from "next";
import RegisterClient from "./registerClient";

export const metadata: Metadata = {
  title: "Criar Conta",
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
