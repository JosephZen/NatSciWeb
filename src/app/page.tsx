import { getSpeciesList } from "@/lib/species";
import SpeciesApp from "@/components/SpeciesApp";

export const revalidate = 60; // ISR cache revalidation every minute

export default async function HomePage() {
  const { data, source } = await getSpeciesList();

  return <SpeciesApp initialSpecies={data} dataSource={source} />;
}
