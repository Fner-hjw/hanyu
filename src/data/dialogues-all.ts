import { DIALOGUES, type Dialogue } from "./dialogues";
import { DIALOGUES_MORE } from "./dialogues-more";

export const ALL_DIALOGUES: Dialogue[] = [...DIALOGUES, ...DIALOGUES_MORE];

export const SCENARIO_LABEL: Record<Dialogue["scenario"], string> = {
  meetings: "Meeting",
  email: "Email",
  phone: "Phone call",
  negotiation: "Negotiation",
  social: "Social",
  daily: "Daily life",
};
