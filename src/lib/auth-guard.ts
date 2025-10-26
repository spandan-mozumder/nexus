import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function protectRoute() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  return session;
}

export async function getCurrentSession() {
  return await auth();
}

export async function redirectIfAuthenticated(
  redirectTo: string = "/dashboard",
) {
  const session = await auth();
  if (session?.user) {
    redirect(redirectTo);
  }
}
