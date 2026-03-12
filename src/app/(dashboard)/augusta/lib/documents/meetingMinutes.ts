import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Packer,
} from "docx";
import type { PlannedEvent } from "../../hooks/useAugustaFlow";
import {
  bodyStyle,
  boldStyle,
  h1Style,
  h2Style,
  h3Style,
  smallStyle,
  tableBorders,
  firstSectionProps,
  sectionProps,
  CENTER,
} from "./styles";

const discussionTopicsByType: Record<string, string[]> = {
  "Board Meeting": [
    "Financial performance and budget adherence",
    "Strategic direction and key decisions",
    "Operational updates and challenges",
  ],
  "Strategy Session": [
    "Market opportunities and competitive threats",
    "Resource allocation priorities",
    "Growth strategy and milestones",
  ],
  "Team Retreat": [
    "Team dynamics and collaboration improvements",
    "Performance review and goal alignment",
    "Professional development initiatives",
  ],
  "Client Meeting": [
    "Project deliverables and timeline",
    "Client feedback and satisfaction",
    "Scope adjustments and next steps",
  ],
  "Training Session": [
    "Key learning outcomes achieved",
    "Skills assessment and gaps identified",
    "Follow-up training needs",
  ],
};

const defaultTopics = [
  "Key discussion points and outcomes",
  "Decisions made and rationale",
  "Outstanding items requiring follow-up",
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

function buildMinutesSection(
  event: PlannedEvent,
  entityName: string
): Paragraph[] {
  const topics = discussionTopicsByType[event.type] || defaultTopics;
  const paragraphs: Paragraph[] = [];

  // Title
  paragraphs.push(
    new Paragraph({
      alignment: CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ ...h1Style, text: "MEETING MINUTES" })],
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
  paragraphs.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ ...boldStyle, text: "Location: " }),
        new TextRun({ ...bodyStyle, text: "[Property Address]" }),
      ],
    })
  );
  paragraphs.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ ...boldStyle, text: "Recorded by: " }),
        new TextRun({ ...bodyStyle, text: "____________________________" }),
      ],
    })
  );
  paragraphs.push(
    new Paragraph({
      spacing: { after: 300 },
      children: [
        new TextRun({ ...boldStyle, text: "Attendees present: " }),
        new TextRun({
          ...bodyStyle,
          text: `____ of ${event.attendees} expected`,
        }),
      ],
    })
  );

  // Discussion sections
  paragraphs.push(
    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [new TextRun({ ...h2Style, text: "Discussion" })],
    })
  );

  topics.forEach((topic, i) => {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({ ...h3Style, text: `${i + 1}. ${topic}` }),
        ],
      })
    );
    paragraphs.push(
      new Paragraph({
        spacing: { after: 50 },
        indent: { left: 360 },
        children: [
          new TextRun({
            ...smallStyle,
            text: "Notes: ",
            italics: true,
          }),
        ],
      })
    );
    // Blank lines for notes
    paragraphs.push(
      new Paragraph({ spacing: { after: 50 }, children: [] })
    );
    paragraphs.push(
      new Paragraph({ spacing: { after: 100 }, children: [] })
    );
  });

  // Decisions section
  paragraphs.push(
    new Paragraph({
      spacing: { before: 300, after: 200 },
      children: [new TextRun({ ...h2Style, text: "Decisions Made" })],
    })
  );
  for (let i = 1; i <= 3; i++) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 100 },
        indent: { left: 360 },
        children: [
          new TextRun({ ...bodyStyle, text: `${i}. ` }),
        ],
      })
    );
  }

  // Action items table
  paragraphs.push(
    new Paragraph({
      spacing: { before: 300, after: 200 },
      children: [new TextRun({ ...h2Style, text: "Action Items" })],
    })
  );

  const actionTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ ...boldStyle, text: "#" })],
              }),
            ],
            width: { size: 5, type: WidthType.PERCENTAGE },
            shading: { fill: "E8F5E9" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ ...boldStyle, text: "Action Item" })],
              }),
            ],
            width: { size: 45, type: WidthType.PERCENTAGE },
            shading: { fill: "E8F5E9" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ ...boldStyle, text: "Assigned To" })],
              }),
            ],
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { fill: "E8F5E9" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ ...boldStyle, text: "Due Date" })],
              }),
            ],
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { fill: "E8F5E9" },
          }),
        ],
      }),
      // Empty rows for filling in
      ...Array.from({ length: 4 }, (_, i) =>
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ ...bodyStyle, text: String(i + 1) }),
                  ],
                }),
              ],
            }),
            new TableCell({ children: [new Paragraph({ children: [] })] }),
            new TableCell({ children: [new Paragraph({ children: [] })] }),
            new TableCell({ children: [new Paragraph({ children: [] })] }),
          ],
        })
      ),
    ],
  });
  paragraphs.push(actionTable as unknown as Paragraph);

  // Attendee sign-off
  paragraphs.push(
    new Paragraph({
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ ...h2Style, text: "Attendee Sign-Off" })],
    })
  );
  for (let i = 0; i < Math.min(event.attendees, 10); i++) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 150 },
        children: [
          new TextRun({
            ...bodyStyle,
            text: `Name: ________________________  Signature: ________________________  Date: __________`,
          }),
        ],
      })
    );
  }

  return paragraphs;
}

export async function generateMeetingMinutes(
  events: PlannedEvent[],
  entityName: string
): Promise<Blob> {
  // The table is in paragraphs array — need to handle mixed content
  const sections = events.map((event, i) => {
    const content = buildMinutesSection(event, entityName);
    return {
      properties: i === 0 ? firstSectionProps : sectionProps,
      children: content,
    };
  });

  const doc = new Document({ sections });
  return Packer.toBlob(doc);
}
