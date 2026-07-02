import { QueryProvider } from '@/providers/query-provider';
import { DashboardMenu } from '@/components/features/dashboard/dashboard-menu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <DashboardMenu />
      {children}
    </QueryProvider>
  );
}
