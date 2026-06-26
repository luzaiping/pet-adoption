export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main>
      <h1>Pet Detail: {id}</h1>
      {/* TODO: pet info, images, apply button */}
    </main>
  );
}