import { EditRaceScreen } from "@/components/EditRaceScreen";

export default async function EditRacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditRaceScreen raceId={id} />;
}
