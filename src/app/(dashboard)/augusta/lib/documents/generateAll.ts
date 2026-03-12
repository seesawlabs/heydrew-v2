import JSZip from "jszip";
import type { EngagementData } from "../../hooks/useAugustaFlow";
import { generateRentalAgreement } from "./rentalAgreement";
import { generateMeetingAgendas } from "./meetingAgendas";
import { generateMeetingMinutes } from "./meetingMinutes";
import { generateRateJustification } from "./rateJustification";
import { generateCalendarTracker } from "./calendarTracker";

export interface GeneratedDocument {
  name: string;
  filename: string;
  blob: Blob;
}

export async function generateDocumentPackage(
  engagement: EngagementData,
  ownerName: string
): Promise<GeneratedDocument[]> {
  const [rental, agendas, minutes, rateJustification, calendar] =
    await Promise.all([
      generateRentalAgreement(engagement, ownerName),
      generateMeetingAgendas(engagement.plannedEvents, engagement.entityName),
      generateMeetingMinutes(engagement.plannedEvents, engagement.entityName),
      generateRateJustification(engagement, ownerName),
      generateCalendarTracker(engagement, ownerName),
    ]);

  return [
    {
      name: "Rental Agreement",
      filename: "rental-agreement.docx",
      blob: rental,
    },
    {
      name: "Meeting Agendas",
      filename: "meeting-agendas.docx",
      blob: agendas,
    },
    {
      name: "Meeting Minutes",
      filename: "meeting-minutes.docx",
      blob: minutes,
    },
    {
      name: "Rate Justification Memo",
      filename: "rate-justification.docx",
      blob: rateJustification,
    },
    {
      name: "Calendar Tracker",
      filename: "calendar-tracker.docx",
      blob: calendar,
    },
  ];
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadAllAsZip(docs: GeneratedDocument[]) {
  const zip = new JSZip();
  for (const doc of docs) {
    zip.file(doc.filename, doc.blob);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, "augusta-rule-documents.zip");
}
