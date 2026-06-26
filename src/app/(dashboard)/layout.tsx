export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: enforce authentication once NextAuth is wired up
  // TODO: wrap with <QueryProvider> once @tanstack/react-query is installed
  return <div>{children}</div>;
}