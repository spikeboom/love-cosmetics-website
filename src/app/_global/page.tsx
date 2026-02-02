'use server';
import { redirect } from "next/navigation";

export default async function HomeRedirect() {
  redirect("/home");
}
