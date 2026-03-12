import {
  AlignmentType,
  BorderStyle,
  IRunStylePropertiesOptions,
  ITableBordersOptions,
  SectionType,
  convertInchesToTwip,
} from "docx";

// ── Font constants ──
export const FONT_BODY = "Calibri";
export const FONT_HEADING = "Calibri";
export const FONT_SIZE_BODY = 22; // 11pt in half-points
export const FONT_SIZE_SMALL = 20; // 10pt
export const FONT_SIZE_H1 = 32; // 16pt
export const FONT_SIZE_H2 = 28; // 14pt
export const FONT_SIZE_H3 = 24; // 12pt

// ── Common run styles ──
export const bodyStyle: IRunStylePropertiesOptions = {
  font: FONT_BODY,
  size: FONT_SIZE_BODY,
};

export const boldStyle: IRunStylePropertiesOptions = {
  font: FONT_BODY,
  size: FONT_SIZE_BODY,
  bold: true,
};

export const smallStyle: IRunStylePropertiesOptions = {
  font: FONT_BODY,
  size: FONT_SIZE_SMALL,
  color: "666666",
};

export const h1Style: IRunStylePropertiesOptions = {
  font: FONT_HEADING,
  size: FONT_SIZE_H1,
  bold: true,
};

export const h2Style: IRunStylePropertiesOptions = {
  font: FONT_HEADING,
  size: FONT_SIZE_H2,
  bold: true,
};

export const h3Style: IRunStylePropertiesOptions = {
  font: FONT_HEADING,
  size: FONT_SIZE_H3,
  bold: true,
};

// ── Table borders ──
export const tableBorders: ITableBordersOptions = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
};

// ── Section properties (letter, 1" margins) ──
export const sectionProps = {
  type: SectionType.NEXT_PAGE,
  page: {
    size: { width: convertInchesToTwip(8.5), height: convertInchesToTwip(11) },
    margin: {
      top: convertInchesToTwip(1),
      right: convertInchesToTwip(1),
      bottom: convertInchesToTwip(1),
      left: convertInchesToTwip(1),
    },
  },
};

export const firstSectionProps = {
  page: sectionProps.page,
};

// ── Paragraph alignment shorthand ──
export const CENTER = AlignmentType.CENTER;
export const RIGHT = AlignmentType.RIGHT;
export const LEFT = AlignmentType.LEFT;
