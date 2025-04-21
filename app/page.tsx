import { redirect } from "next/navigation"

// This root page should redirect to the user home page
export default function Home() {
  redirect("/shop")
}

