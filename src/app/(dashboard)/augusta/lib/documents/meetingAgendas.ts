import { Document, Paragraph, TextRun, Packer } from "docx";
import type { PlannedEvent } from "../../hooks/useAugustaFlow";
import {
  bodyStyle,
  boldStyle,
  h1Style,
  h2Style,
  h3Style,
  smallStyle,
  firstSectionProps,
  sectionProps,
  CENTER,
} from "./styles";

// Auto-generated agenda items by event type
const agendaItemsByType: Record<string, string[]> = {
  "Board Meeting": [
    "Call to order and roll call",
    "Approval of previous meeting minutes",
    "Financial report and budget review",
    "Old business / action item follow-ups",
    "New business and strategic initiatives",
    "Adjournment",
  ],
  "Strategy Session": [
    "Welcome and session objectives",
    "Review of current market position",
    "Competitive landscape analysis",
    "Strategic priorities for upcoming quarter",
    "Action items and ownership assignments",
    "Wrap-up and next steps",
  ],
  "Team Retreat": [
    "Welcome and retreat goals overview",
    "Team building activity",
    "Business performance review",
    "Department updates and cross-functional alignment",
    "Goal setting for next period",
    "Closing remarks and feedback",
  ],
  "Client Meeting": [
    "Introductions and agenda overview",
    "Project status update",
    "Client feedback and requirements review",
    "Proposed solutions and next deliverables",
    "Timeline and milestone confirmation",
    "Action items and follow-up schedule",
  ],
  "Training Session": [
    "Welcome and learning objectives",
    "Topic 1: Core concepts and fundamentals",
    "Topic 2: Practical applications",
    "Interactive exercise / workshop",
    "Q&A and discussion",
    "Summary and resource distribution",
  ],
};

const defaultAgenda = [
  "Welcome and introductions",
  "Review of meeting objectives",
  "Discussion of key topics",
  "Decision items and voting",
  "Action items and assignments",
  "Adjournment",
];

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildAgendaSection(
  event: PlannedEvent,
  entityName: string
): Paragraph[] {
  const items = agendaItemsByType[event.type] || defaultAgenda;
  const paragraphs: Paragraph[] = [];

  // Event title
  paragraphs.push(
    new Paragraph({
      alignment: CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ ...h1Style, text: "MEETING AGENDA" })],
    })
  );

  paragraphs.push(
    new Paragraph({
      alignment: CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({ ...bodyStyle, text: entityName || "[Entity Name]" }),
      ],
    })
  );

  // Meta
  paragraphs.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ ...boldStyle, text: "Event: " }),
        new TextRun({ ...bodyStyle, text: event.type }),
      ],
    })
  );
  paragraphs.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ ...boldStyle, text: "Date: " }),
        new TextRun({ ...bodyStyle, text: formatDate(event.date) }),
      ],
    })
  );
  if (event.days > 1) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ ...boldStyle, text: "Duration: " }),
          new TextRun({ ...bodyStyle, text: `${event.days} days` }),
        ],
      })
    );
  }
  paragraphs.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ ...boldStyle, text: "Attendees: " }),
        new TextRun({
          ...bodyStyle,
          text: `${event.attendees} expected`,
        }),
      ],
    })
  );
  paragraphs.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ ...boldStyle, text: "Location: " }),
        new TextRun({ ...bodyStyle, text: "[Property Address]" }),
      ],
    })
  );

  if (event.description) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({ ...boldStyle, text: "Purpose: " }),
          new TextRun({ ...bodyStyle, text: event.description }),
        ],
      })
    );
  }

  // Agenda items
  paragraphs.push(
    new Paragraph({
      spacing: { before: 300, after: 200 },
      children: [new TextRun({ ...h2Style, text: "Agenda" })],
    })
  );

  items.forEach((item, i) => {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 100 },
        indent: { left: 360 },
        children: [
          new TextRun({ ...boldStyle, text: `${i + 1}. ` }),
          new TextRun({ ...bodyStyle, text: item }),
        ],
      })
    );
  });

  // Attendee placeholders
  paragraphs.push(
    new Paragraph({
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ ...h3Style, text: "Attendees" })],
    })
  );
  for (let i = 0; i < Math.min(event.attendees, 10); i++) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            ...bodyStyle,
            text: `${i + 1}. ____________________________`,
          }),
        ],
      })
    );
  }

  return paragraphs;
}

export async function generateMeetingAgendas(
  events: PlannedEvent[],
  entityName: string
): Promise<Blob> {
  const sections = events.map((event, i) => ({
    properties: i === 0 ? firstSectionProps : sectionProps,
    children: buildAgendaSection(event, entityName),
  }));

  const doc = new Document({ sections });
  return Packer.toBlob(doc);
}
