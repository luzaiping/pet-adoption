import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session?.user?.role !== Role.ADMIN) {
    redirect('/dashboard/forbidden')
  }

  return <div>{children}</div>;
}