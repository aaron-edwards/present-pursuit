import { redirect } from "next/navigation";

import { getFirstStep } from "@/lib/hunt";

export default function HuntEntryPage() {
  redirect(`/hunt/${getFirstStep().id}`);
}
