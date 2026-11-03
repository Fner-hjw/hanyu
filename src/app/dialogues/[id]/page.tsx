import { ALL_DIALOGUES } from "@/data/dialogues-all";
import DialogueClient from "./DialogueClient";

export function generateStaticParams() {
  return ALL_DIALOGUES.map((d) => ({ id: d.id }));
}

export default async function Page({ params }: PageProps<"/dialogues/[id]">) {
  const { id } = await params;
  return <DialogueClient id={id} />;
}
