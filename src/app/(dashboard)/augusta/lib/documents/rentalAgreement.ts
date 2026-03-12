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
    month: "long",
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

function headerCell(text: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ ...boldStyle, text })],
      }),
    ],
    shading: { fill: "E8F5E9" },
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

export async function generateRentalAgreement(
  engagement: EngagementData,
  ownerName: string
): Promise<Blob> {
  const rate = engagement.fairMarketDailyRate || 0;
  const events = engagement.plannedEvents;
  const totalDays = events.reduce((s, e) => s + e.days, 0);
  const totalAmount = totalDays * rate;
  const year = new Date().getFullYear();

  // Rental schedule rows
  const scheduleRows = events.map(
    (e) =>
      new TableRow({
        children: [
          cell(formatDate(e.date)),
          cell(e.type),
          cell(String(e.days)),
          cell(formatCurrency(rate)),
          cell(formatCurrency(e.days * rate)),
        ],
      })
  );

  const legalClauses = [
    {
      title: "Use of Premises",
      text: `Tenant shall use the Property exclusively for legitimate business purposes as described in the rental schedule above. The Property shall not be used for any unlawful purpose.`,
    },
    {
      title: "Condition of Premises",
      text: `Landlord shall provide the Property in a clean, habitable condition suitable for the intended business use, including adequate seating, lighting, and restroom facilities.`,
    },
    {
      title: "Insurance",
      text: `Tenant shall maintain adequate liability insurance covering business activities conducted at the Property during each rental period.`,
    },
    {
      title: "Indemnification",
      text: `Tenant agrees to indemnify and hold harmless Landlord from and against any claims, damages, or liabilities arising from Tenant's use of the Property.`,
    },
    {
      title: "Compliance with Law",
      text: `Both parties agree to comply with all applicable federal, state, and local laws, including but not limited to IRC Section 280A(g) (the "Augusta Rule").`,
    },
    {
      title: "Entire Agreement",
      text: `This Agreement constitutes the entire understanding between the parties. Any modifications must be made in writing and signed by both parties.`,
    },
  ];

  const doc = new Document({
    sections: [
      {
        properties: firstSectionProps,
        children: [
          // Title
          new Paragraph({
            alignment: CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ ...h1Style, text: "RENTAL AGREEMENT" })],
          }),
          new Paragraph({
            alignment: CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                ...bodyStyle,
                text: `Tax Year ${year} — Augusta Rule (IRC §280A(g))`,
              }),
            ],
          }),

          // Parties
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ ...h2Style, text: "Parties" })],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ ...boldStyle, text: "Landlord: " }),
              new TextRun({
                ...bodyStyle,
                text: ownerName || "[Owner Name]",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ ...boldStyle, text: "Tenant: " }),
              new TextRun({
                ...bodyStyle,
                text: engagement.entityName || "[Entity Name]",
              }),
              new TextRun({
                ...smallStyle,
                text: ` (${engagement.entityType.replace("_", "-").toUpperCase()})`,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({ ...boldStyle, text: "Effective Date: " }),
              new TextRun({ ...bodyStyle, text: `January 1, ${year}` }),
            ],
          }),

          // Property
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ ...h2Style, text: "Property" })],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                ...bodyStyle,
                text:
                  engagement.propertyAddress ||
                  "[Property Address]",
              }),
            ],
          }),
          ...(engagement.propertyDetails
            ? [
                new Paragraph({
                  spacing: { after: 300 },
                  children: [
                    new TextRun({
                      ...bodyStyle,
                      text: `${engagement.propertyDetails.bedrooms} bedroom(s), ${engagement.propertyDetails.bathrooms} bathroom(s), ${engagement.propertyDetails.squareFeet.toLocaleString()} sq ft`,
                    }),
                    ...(engagement.propertyDetails.amenities.length > 0
                      ? [
                          new TextRun({
                            ...bodyStyle,
                            text: `. Amenities: ${engagement.propertyDetails.amenities.join(", ")}`,
                          }),
                        ]
                      : []),
                  ],
                }),
              ]
            : []),

          // Rental schedule
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ ...h2Style, text: "Rental Schedule" }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  headerCell("Date"),
                  headerCell("Event Type"),
                  headerCell("Days"),
                  headerCell("Daily Rate"),
                  headerCell("Amount"),
                ],
              }),
              ...scheduleRows,
              // Totals row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ ...boldStyle, text: "TOTAL" })],
                      }),
                    ],
                    columnSpan: 2,
                  }),
                  cell(String(totalDays)),
                  cell(""),
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
                  }),
                ],
              }),
            ],
          }),

          // Payment terms
          new Paragraph({
            spacing: { before: 300, after: 200 },
            children: [new TextRun({ ...h2Style, text: "Payment Terms" })],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                ...bodyStyle,
                text: `Tenant shall pay Landlord a total of ${formatCurrency(totalAmount)} for the rental periods described above. Payment is due within 30 days of each rental event.`,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({
                ...bodyStyle,
                text: `The fair market daily rental rate of ${formatCurrency(rate)} is substantiated by comparable rental market analysis (see Rate Justification Memo).`,
              }),
            ],
          }),

          // Legal clauses
          ...legalClauses.flatMap((clause, i) => [
            new Paragraph({
              spacing: { before: 200, after: 100 },
              children: [
                new TextRun({
                  ...h2Style,
                  text: `${i + 1}. ${clause.title}`,
                }),
              ],
            }),
            new Paragraph({
              spacing: { after: 100 },
              children: [new TextRun({ ...bodyStyle, text: clause.text })],
            }),
          ]),

          // Signature blocks
          new Paragraph({
            spacing: { before: 600, after: 300 },
            children: [new TextRun({ ...h2Style, text: "Signatures" })],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                ...bodyStyle,
                text: "________________________________________",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 50 },
            children: [
              new TextRun({
                ...boldStyle,
                text: `${ownerName || "[Owner Name]"}, Landlord`,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({
                ...bodyStyle,
                text: "Date: ____________________",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                ...bodyStyle,
                text: "________________________________________",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 50 },
            children: [
              new TextRun({
                ...boldStyle,
                text: `Authorized Representative, ${engagement.entityName || "[Entity Name]"}, Tenant`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                ...bodyStyle,
                text: "Date: ____________________",
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}
