import { DIALOGUES } from "@/data/dialogues";
import DialogueClient from "./DialogueClient";

export function generateStaticParams() {
  return DIALOGUES.map((d) => ({ id: d.id }));
}

export default async function Page({ params }: PageProps<"/dialogues/[id]">) {
  const { id } = await params;
  return <DialogueClient id={id} />;
}
