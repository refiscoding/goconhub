import { redirect } from "next/navigation";

// Redirect bare /support to the auth page so users log in first
export default function SupportRedirect() {
  redirect("/");
}
