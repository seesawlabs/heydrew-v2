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
import type { EngagementData } from "../../hooks/useAugustaFlow";
import {
  bodyStyle,
  boldStyle,
  h1Style,
  h2Style,
  smallStyle,
  tableBorders,
  firstSectionProps,
  CENTER,
} from "./styles";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function headerCell(text: string, widthPct?: number): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ ...boldStyle, text })],
      }),
    ],
    shading: { fill: "E8F5E9" },
    ...(widthPct
      ? { width: { size: widthPct, type: WidthType.PERCENTAGE } }
      : {}),
  });
}

function cell(text: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ ...bodyStyle, text })],
      }),
    ],
  });
}

// Unicode ballot boxes
const UNCHECKED = "\u2610"; // ☐
const CHECKED = "\u2611"; // ☑

export async function generateCalendarTracker(
  engagement: EngagementData,
  ownerName: string
): Promise<Blob> {
  const rate = engagement.fairMarketDailyRate || 0;
  const events = engagement.plannedEvents;
  const totalDays = events.reduce((s, e) => s + e.days, 0);
  const totalAmount = totalDays * rate;
  const year = new Date().getFullYear();

  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      alignment: CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          ...h1Style,
          text: "RENTAL EVENT CALENDAR & TRACKER",
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      alignment: CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({ ...bodyStyle, text: `Tax Year ${year}` }),
      ],
    })
  );

  // Info
  children.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ ...boldStyle, text: "Property Owner: " }),
        new TextRun({ ...bodyStyle, text: ownerName || "[Owner Name]" }),
      ],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ ...boldStyle, text: "Entity: " }),
        new TextRun({
          ...bodyStyle,
          text: engagement.entityName || "[Entity Name]",
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ ...boldStyle, text: "Property: " }),
        new TextRun({
          ...bodyStyle,
          text: engagement.propertyAddress || "[Property Address]",
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 300 },
      children: [
        new TextRun({ ...boldStyle, text: "Daily Rate: " }),
        new TextRun({ ...bodyStyle, text: formatCurrency(rate) }),
      ],
    })
  );

  // Instructions
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ ...h2Style, text: "Instructions" })],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          ...bodyStyle,
          text: "Check each box as the corresponding task is completed for each rental event. Keep this tracker with your tax records as supporting documentation.",
        }),
      ],
    })
  );

  // Event table
  children.push(
    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [new TextRun({ ...h2Style, text: "Event Tracker" })],
    })
  );

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          headerCell("Date"),
          headerCell("Event"),
          headerCell("Days"),
          headerCell("Amount"),
          headerCell("Agenda"),
          headerCell("Minutes"),
          headerCell("Paid"),
        ],
      }),
      ...events.map(
        (e) =>
          new TableRow({
            children: [
              cell(formatDate(e.date)),
              cell(e.type),
              cell(String(e.days)),
              cell(formatCurrency(e.days * rate)),
              cell(UNCHECKED),
              cell(UNCHECKED),
              cell(UNCHECKED),
            ],
          })
      ),
      // Totals row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ ...boldStyle, text: "TOTALS" })],
              }),
            ],
            columnSpan: 2,
            shading: { fill: "F5F5F5" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    ...boldStyle,
                    text: `${totalDays}/14`,
                  }),
                ],
              }),
            ],
            shading: { fill: "F5F5F5" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    ...boldStyle,
                    text: formatCurrency(totalAmount),
                  }),
                ],
              }),
            ],
            shading: { fill: "F5F5F5" },
          }),
          new TableCell({
            children: [new Paragraph({ children: [] })],
            columnSpan: 3,
            shading: { fill: "F5F5F5" },
          }),
        ],
      }),
    ],
  });
  children.push(table);

  // Notes
  children.push(
    new Paragraph({
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ ...h2Style, text: "Notes" })],
    })
  );
  for (let i = 0; i < 5; i++) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            ...bodyStyle,
            text: "_______________________________________________________________________________",
          }),
        ],
      })
    );
  }

  // Footer
  children.push(
    new Paragraph({
      spacing: { before: 400 },
      children: [
        new TextRun({
          ...smallStyle,
          text: "Under IRC §280A(g), rental income from a personal residence is excluded from gross income when rented for fewer than 15 days per year at fair market value. Maintain this tracker and all supporting documents for a minimum of 7 years.",
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: firstSectionProps,
        children: children as Paragraph[],
      },
    ],
  });

  return Packer.toBlob(doc);
}
