# trip-itinerary-gen

Turn a simple trip file into a polished, branded travel itinerary document (`.docx`) — no design work needed.

Built for travel planners and agencies who send clients a lot of itineraries and want a consistent, professional format every time.

## What it does

You describe a trip in a simple JSON file (destination, days, activities, timings). The tool turns it into a formatted Word document with:

- A branded title page
- A trip overview section
- Day-by-day sections with times, activity names, and notes
- A closing/contact section

## Requirements

- [Node.js](https://nodejs.org) version 16 or higher (free, takes 2 minutes to install)

## Installation

1. Download or clone this repository.
2. Open a terminal in the project folder.
3. Run:

   ```
   npm install
   ```

## Usage

1. Copy `examples/sample-trip.json` and edit it with your own trip details (see format below).
2. Run:

   ```
   node src/generate.js examples/your-trip.json
   ```

3. This creates `your-trip.docx` in the same folder — ready to open, brand-check, and send.

You can also set a custom output name:

```
node src/generate.js examples/your-trip.json output/final-itinerary.docx
```

## Trip file format

```json
{
  "title": "Trip Title",
  "subtitle": "A short tagline for the trip",
  "overview": "A paragraph describing the trip.",
  "brand": {
    "navy": "1F2D3D",
    "gold": "B08D57",
    "grey": "6B6B6B"
  },
  "notes": [
    { "label": "Best time to visit", "text": "..." },
    { "label": "Good to know", "text": "..." }
  ],
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        { "time": "2:00 PM", "name": "Place name", "note": "Optional tip" }
      ],
      "stay": "City/hotel name"
    }
  ],
  "footer": "Closing line, e.g. contact info or a call to action."
}
```

- `brand` is optional — omit it to use the default color palette.
- `notes` is optional.
- Each day needs `day`, `title`, and `activities`; `stay` is optional.

## Why this exists

Travel planners often rebuild the same itinerary document by hand for every client. This tool keeps formatting consistent, cuts document production time, and lets non-technical teams generate professional itineraries just by editing a JSON file.

## Roadmap

- [ ] PDF export directly (currently outputs `.docx`, which can be exported to PDF from Word/Google Docs)
- [ ] Multi-language support
- [ ] Command-line prompts for building a trip file without writing JSON by hand
- [ ] Optional map image embedding per day

## Contributing

Issues and pull requests are welcome. If you use this for your own travel business and want a feature, open an issue describing your use case.

## License

MIT
