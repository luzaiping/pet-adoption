import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const { role } = session.user;

  let target = '/dashboard/forbidden';

  if (role === Role.ADMIN) {
    target = '/dashboard/admin';
  }

  if (role === Role.USER) {
    target = '/dashboard/applications';
  }

  redirect(target);
}