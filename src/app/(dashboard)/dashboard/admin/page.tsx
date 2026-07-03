import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, ClipboardCheck, PawPrint } from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  {
    href: '/dashboard/admin/applications',
    title: 'Review applications',
    description:
      'Review pending adoption requests and make approval decisions.',
    icon: ClipboardCheck,
  },
  {
    href: '/dashboard/admin/pets',
    title: 'Manage pets',
    description:
      'Maintain pet profiles, availability, and adoption information.',
    icon: PawPrint,
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="max-w-2xl space-y-4">
        <Badge variant="secondary">Admin workspace</Badge>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">
            Welcome back
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Review adoption requests and keep every pet profile ready to help
            them find the right home.
          </p>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="quick-actions-heading">
        <div className="mb-4 space-y-1">
          <h2
            id="quick-actions-heading"
            className="font-heading text-xl font-semibold"
          >
            Quick actions
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose an area to continue managing the adoption workflow.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {quickActions.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:-translate-y-0.5 group-focus-visible:shadow-md">
                <CardHeader>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl">{title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex items-center gap-2 font-medium text-primary">
                  Open workspace
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
