import { ObserveScreen } from "@/components/ObserveScreen";

export default async function ObservePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ObserveScreen raceId={id} />;
}
