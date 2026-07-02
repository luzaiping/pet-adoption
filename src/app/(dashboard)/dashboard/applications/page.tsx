// CLAUDE-REVIEW

import { auth } from '@/auth';
import { getUserApplications } from '@/lib/applications';
import { redirect } from 'next/navigation';
import { ApplicationList } from '@/components/features/applications/application-list';

export default async function MyApplicationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const applications = await getUserApplications(session.user.id);
  return (
    <main>
      <ApplicationList applications={applications} />
    </main>
  );
}
