import { allUnits } from "@/lib/units";
import UnitClient from "./UnitClient";

export function generateStaticParams() {
  return allUnits().map(({ level, unit }) => ({ level: String(level), unit: String(unit) }));
}

export default async function Page({ params }: PageProps<"/learn/[level]/[unit]">) {
  const { level, unit } = await params;
  return <UnitClient level={+level} unit={+unit} />;
}
