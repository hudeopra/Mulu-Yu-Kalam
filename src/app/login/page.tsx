import { LoginPage } from "@/views/LoginPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Login",
  description: "Sign in to Mulu Yu Kalam studio administration portal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginRoute() {
  return <LoginPage />;
}
