#!/usr/bin/env node
/**
 * trip-itinerary-gen
 * Turns a simple JSON trip file into a polished, branded itinerary document (.docx).
 *
 * Usage:
 *   node src/generate.js examples/sample-trip.json
 *   node src/generate.js examples/sample-trip.json my-output.docx
 */

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ShadingType, BorderStyle,
} = require("docx");

function loadTrip(jsonPath) {
  const raw = fs.readFileSync(jsonPath, "utf-8");
  return JSON.parse(raw);
}

function hr(color) {
  return new Paragraph({
    border: { bottom: { color, space: 4, style: BorderStyle.SINGLE, size: 8 } },
    spacing: { after: 200 },
  });
}

function dayHeader(dayNum, title, navy) {
  return new Paragraph({
    spacing: { before: 280, after: 60 },
    shading: { type: ShadingType.CLEAR, fill: navy },
    children: [
      new TextRun({ text: `  DAY ${dayNum}  `, bold: true, color: "FFFFFF", size: 20, font: "Calibri" }),
      new TextRun({ text: `   ${title}`, bold: true, color: "FFFFFF", size: 20, font: "Calibri" }),
    ],
  });
}

function activity(time, name, note, gold, grey) {
  return new Paragraph({
    spacing: { after: 90 },
    indent: { left: 200 },
    children: [
      new TextRun({ text: `${time}  `, bold: true, color: gold, size: 19, font: "Calibri" }),
      new TextRun({ text: name, bold: true, size: 19, font: "Calibri" }),
      new TextRun({ text: note ? `  \u2014 ${note}` : "", size: 18, color: grey, italics: true, font: "Calibri" }),
    ],
  });
}

function stayLine(text, grey) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text: `Stay: ${text}`, italics: true, size: 18, color: grey, font: "Calibri" })],
  });
}

function sectionTitle(text, navy) {
  return new Paragraph({
    spacing: { before: 320, after: 140 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, color: navy, size: 24, font: "Georgia" })],
  });
}

function buildDocument(trip) {
  const brand = Object.assign(
    { navy: "1F2D3D", gold: "B08D57", grey: "6B6B6B" },
    trip.brand || {}
  );

  const children = [];

  // Title block
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: (trip.title || "TRIP ITINERARY").toUpperCase(), bold: true, color: brand.navy, size: 44, font: "Georgia" })],
    })
  );
  if (trip.subtitle) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: trip.subtitle, italics: true, color: brand.grey, size: 22, font: "Calibri" })],
      })
    );
  }
  children.push(hr(brand.gold));

  // Overview
  if (trip.overview) {
    children.push(sectionTitle("Trip Overview", brand.navy));
    children.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: trip.overview, size: 20, font: "Calibri" })],
      })
    );
  }

  if (Array.isArray(trip.notes)) {
    trip.notes.forEach((note) => {
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: `${note.label}:  `, bold: true, size: 19, font: "Calibri" }),
            new TextRun({ text: note.text, size: 19, font: "Calibri" }),
          ],
        })
      );
    });
  }

  // Day by day
  if (Array.isArray(trip.days) && trip.days.length > 0) {
    children.push(sectionTitle("Day-by-Day Itinerary", brand.navy));
    trip.days.forEach((day) => {
      children.push(dayHeader(day.day, day.title, brand.navy));
      (day.activities || []).forEach((act) => {
        children.push(activity(act.time, act.name, act.note, brand.gold, brand.grey));
      });
      if (day.stay) {
        children.push(stayLine(day.stay, brand.grey));
      }
    });
  }

  // Footer
  children.push(hr(brand.gold));
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: "Questions about this itinerary?", bold: true, size: 20, color: brand.navy, font: "Calibri" })],
    })
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: trip.footer || "Reach out and we'll help customize this trip.", size: 19, color: brand.grey, font: "Calibri" })],
    })
  );

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
          },
        },
        children,
      },
    ],
  });
}

async function main() {
  const [, , inputPath, outputPathArg] = process.argv;

  if (!inputPath) {
    console.error("Usage: node src/generate.js <trip.json> [output.docx]");
    process.exit(1);
  }

  const trip = loadTrip(inputPath);
  const doc = buildDocument(trip);

  const outputPath = outputPathArg || path.join(
    path.dirname(inputPath),
    `${path.basename(inputPath, ".json")}.docx`
  );

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Itinerary created: ${outputPath}`);
}

main().catch((err) => {
  console.error("Failed to generate itinerary:", err.message);
  process.exit(1);
});
