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

export async function generateRateJustification(
  engagement: EngagementData,
  ownerName: string
): Promise<Blob> {
  const rate = engagement.fairMarketDailyRate || 0;
  const comps = engagement.compSources;
  const year = new Date().getFullYear();
  const pd = engagement.propertyDetails;

  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      alignment: CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          ...h1Style,
          text: "FAIR MARKET RENTAL RATE JUSTIFICATION",
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      alignment: CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({ ...bodyStyle, text: `Memorandum — Tax Year ${year}` }),
      ],
    })
  );

  // Prepared for
  children.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ ...boldStyle, text: "Prepared for: " }),
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
      spacing: { after: 300 },
      children: [
        new TextRun({ ...boldStyle, text: "Property: " }),
        new TextRun({
          ...bodyStyle,
          text: engagement.propertyAddress || "[Property Address]",
        }),
      ],
    })
  );

  // Property description
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ ...h2Style, text: "Property Description" }),
      ],
    })
  );

  if (pd) {
    children.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            ...bodyStyle,
            text: `The subject property is a residential dwelling located at ${engagement.propertyAddress || "[Property Address]"}. It contains ${pd.bedrooms} bedroom(s), ${pd.bathrooms} bathroom(s), and approximately ${pd.squareFeet.toLocaleString()} square feet of living space.`,
          }),
        ],
      })
    );
    if (pd.amenities.length > 0) {
      children.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              ...bodyStyle,
              text: `Notable amenities include: ${pd.amenities.join(", ")}.`,
            }),
          ],
        })
      );
    }
  } else {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            ...bodyStyle,
            text: "[Property description to be completed]",
          }),
        ],
      })
    );
  }

  // Comparable analysis
  children.push(
    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({ ...h2Style, text: "Comparable Rental Analysis" }),
      ],
    })
  );

  if (comps.length > 0) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            ...bodyStyle,
            text: `The following ${comps.length} comparable short-term rental listings were identified in the property's market area via online rental platforms:`,
          }),
        ],
      })
    );

    const compsTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorders,
      rows: [
        new TableRow({
          children: [
            headerCell("#"),
            headerCell("Listing"),
            headerCell("Source"),
            headerCell("Bed/Bath"),
            headerCell("Rate/Night"),
          ],
        }),
        ...comps.slice(0, 10).map(
          (comp, i) =>
            new TableRow({
              children: [
                cell(String(i + 1)),
                cell(comp.listingTitle || "Rental listing"),
                cell(comp.source || "Online platform"),
                cell(`${comp.bedrooms}/${comp.bathrooms}`),
                cell(formatCurrency(comp.pricePerNight)),
              ],
            })
        ),
      ],
    });
    children.push(compsTable);

    // Stats
    const prices = comps.map((c) => c.pricePerNight);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const median = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            ...bodyStyle,
            text: `Range: ${formatCurrency(min)} – ${formatCurrency(max)} per night`,
          }),
        ],
      })
    );
    children.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            ...bodyStyle,
            text: `Average: ${formatCurrency(avg)} | Median: ${formatCurrency(median)}`,
          }),
        ],
      })
    );
  } else {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            ...bodyStyle,
            text: "No direct comparable listings were available at the time of analysis. The fair market rate was estimated based on property characteristics including bedroom count, bathroom count, square footage, and available amenities, consistent with prevailing market conditions for similar properties.",
          }),
        ],
      })
    );
  }

  // Methodology
  children.push(
    new Paragraph({
      spacing: { before: 300, after: 200 },
      children: [new TextRun({ ...h2Style, text: "Methodology" })],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          ...bodyStyle,
          text: `Fair market rental value was determined using the market approach, comparing the subject property to similar short-term rental listings in the same geographic area. Adjustments were considered for differences in size, amenities, and condition.`,
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          ...bodyStyle,
          text: `This analysis follows IRS guidance under IRC §280A(g), which provides that rental income from a dwelling unit used as a personal residence is not included in gross income if the property is rented for fewer than 15 days during the taxable year, provided the rental rate reflects fair market value.`,
        }),
      ],
    })
  );

  // Concluded rate
  children.push(
    new Paragraph({
      spacing: { before: 300, after: 200 },
      children: [
        new TextRun({ ...h2Style, text: "Concluded Fair Market Rate" }),
      ],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          ...bodyStyle,
          text: `Based on the analysis above, the concluded fair market daily rental rate for the subject property is `,
        }),
        new TextRun({
          ...boldStyle,
          text: `${formatCurrency(rate)} per day`,
        }),
        new TextRun({
          ...bodyStyle,
          text: ".",
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      spacing: { before: 400, after: 100 },
      children: [
        new TextRun({
          ...smallStyle,
          text: "This memorandum is prepared for documentation purposes and does not constitute legal or tax advice. Consult a qualified tax professional for guidance specific to your situation.",
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
