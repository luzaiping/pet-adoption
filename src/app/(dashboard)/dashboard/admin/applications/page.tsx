import { ApplicationQueue } from '@/components/features/admin/application-queue';
import { getAdminApplicationQueue } from '@/lib/admin/applications';

export default async function AdminApplicationsPage() {
  const applicationQueue = await getAdminApplicationQueue();

  return <ApplicationQueue initialQueue={applicationQueue} />;
}
