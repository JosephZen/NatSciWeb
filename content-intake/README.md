# 🌿 Content Intake: Images & Text for 60 Wildlife & Plant Species

Welcome! This folder is your dedicated workspace where you can input and manage all **60 wildlife and plant entries** for the project.

---

## 📁 Folder Structure

```
content-intake/
├── images/               <-- 📸 DROP YOUR 60 IMAGES HERE (.jpg, .jpeg, .png, .webp)
├── species-data.json     <-- 📝 EDIT YOUR 60 TEXT ENTRIES HERE
└── README.md             <-- This instruction guide
```

---

## 1. How to Input Text

Open `content-intake/species-data.json`. It is pre-populated with **60 campus species** across 6 categories (`Insects`, `Arachnids`, `Flora & Flowers`, `Trees & Ferns`, `Birds & Reptiles`, `Small Fauna`).

Each entry follows this exact format:

```json
{
  "id": 1,
  "slug": "huntsman-spider",
  "commonName": "Huntsman Spider",
  "scientificName": "Family Sparassidae (exact species uncertain)",
  "category": "Arachnids",
  "origin": "Huntsman spiders occur in tropical and subtropical regions around the world, including Southeast Asia and the Philippines.",
  "description": "A large brown spider with a flattened body, long legs, and natural camouflage that helps it blend into tree bark and leaves. It is a predator that feeds on insects and other small animals.",
  "funFact": "Huntsman spiders can move sideways because their legs are positioned like those of a crab.",
  "imagePath": "/species/huntsman-spider.webp"
}
```

You can edit any text directly in this file.

---

## 2. How to Input Images

1. Save your photos or diagrams into `content-intake/images/`.
2. Name the image to match the `slug` or `imagePath` in `species-data.json`.
   - Example: For `huntsman-spider`, place `huntsman-spider.jpg` (or `.png` / `.webp`) in `content-intake/images/`.
3. If an image is missing, the website automatically displays a beautiful nature-themed botanical placeholder illustration, so the site will never show a broken image!

---

## 3. How to Sync into the Website & Database

Whenever you update text or add new images, run this single command in your terminal:

```bash
npm run sync-data
```

This command will:
1. Copy all images from `content-intake/images/` into `public/species/`.
2. Sync `species-data.json` into the application.
3. If you have your Neon `DATABASE_URL` set in `.env.local`, you can run `npm run seed` to push the data into your Neon Postgres database!

---

## 4. Tracing Where Data Appears on the Website

| Field in JSON / DB | UI 1: Modal Scrapbook | UI 2: Catalog View |
| :--- | :--- | :--- |
| `imagePath` | Main polaroid photograph with washi tape | Top card image |
| `commonName` | Scrapbook page header | Card bold title |
| `scientificName` | Italicized botanical label below photo | Italic taxonomy line |
| `category` | Vintage stamp badge (e.g., "ARACHNID") | Filter badge |
| `origin` | "Geographic Origin" stamped section | "Origin" field |
| `description` | Handwritten journal field notes | "Description" paragraph |
| `funFact` | Yellow sticky note with pin at bottom | Highlighted callout box |
