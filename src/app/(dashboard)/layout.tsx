import { QueryProvider } from '@/providers/query-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
