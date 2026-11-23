import fs from "fs";
import path from "path";

interface SpeciesRecord {
  id: number;
  slug: string;
  commonName: string;
  scientificName: string;
  category: string;
  origin: string;
  description: string;
  funFact: string;
  imagePath: string;
}

const intakeImagesDir = path.join(process.cwd(), "content-intake", "images");
const publicSpeciesDir = path.join(process.cwd(), "public", "species");
const intakeDataFile = path.join(process.cwd(), "content-intake", "species-data.json");
const srcDataDir = path.join(process.cwd(), "src", "data");
const fallbackDataFile = path.join(srcDataDir, "fallback-species.json");

// Ensure directories exist
for (const dir of [intakeImagesDir, publicSpeciesDir, srcDataDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Read intake data
if (!fs.existsSync(intakeDataFile)) {
  console.error(`Missing ${intakeDataFile}. Run scripts/generate-data.ts first.`);
  process.exit(1);
}

const raw = fs.readFileSync(intakeDataFile, "utf-8");
const speciesList: SpeciesRecord[] = JSON.parse(raw);

console.log(`🌿 Loaded ${speciesList.length} species entries from content-intake/species-data.json`);

// Check intake images directory for user uploads
const userImages = fs.readdirSync(intakeImagesDir);
console.log(`📸 Found ${userImages.length} user-uploaded images in content-intake/images/`);

// Color schemes for botanical placeholders based on category
const categoryTheme: Record<string, { bg1: string; bg2: string; icon: string; accent: string }> = {
  "Insects": { bg1: "#1A3626", bg2: "#2A5239", icon: "🦗", accent: "#86BF9B" },
  "Arachnids": { bg1: "#2B2118", bg2: "#4A392A", icon: "🕷️", accent: "#D6C097" },
  "Flora & Flowers": { bg1: "#361A25", bg2: "#572B3C", icon: "🌺", accent: "#ECA3B9" },
  "Trees & Ferns": { bg1: "#162E20", bg2: "#254832", icon: "🌿", accent: "#9DBA88" },
  "Birds & Reptiles": { bg1: "#1F2E3B", bg2: "#30475B", icon: "🦎", accent: "#9AC4E8" },
  "Small Fauna": { bg1: "#362719", bg2: "#533D29", icon: "🦇", accent: "#E8C89A" },
};

function generateBotanicalSvg(species: SpeciesRecord): string {
  const theme = categoryTheme[species.category] || { bg1: "#1D3B2B", bg2: "#2C5B42", icon: "🌱", accent: "#A5D6A7" };
  const safeName = species.commonName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeSci = species.scientificName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeCat = species.category.toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <radialGradient id="grad-${species.id}" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="${theme.bg2}" />
      <stop offset="100%" stop-color="${theme.bg1}" />
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="url(#grad-${species.id})" />

  <!-- Botanical Vignette Border -->
  <rect x="25" y="25" width="750" height="550" rx="16" fill="none" stroke="${theme.accent}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="8 6" />
  <rect x="35" y="35" width="730" height="530" rx="12" fill="none" stroke="${theme.accent}" stroke-opacity="0.15" stroke-width="1" />

  <!-- Specimen Stamp Badge -->
  <g transform="translate(60, 60)">
    <rect width="180" height="34" rx="6" fill="#F4EBD9" fill-opacity="0.9" />
    <text x="90" y="22" font-family="sans-serif" font-weight="700" font-size="12" letter-spacing="1.5" fill="#3A2A1D" text-anchor="middle">
      ${safeCat}
    </text>
  </g>

  <!-- Central Botanical Icon Symbol -->
  <g filter="url(#shadow)">
    <circle cx="400" cy="250" r="110" fill="#FDFBF7" fill-opacity="0.08" stroke="${theme.accent}" stroke-opacity="0.4" stroke-width="2" />
    <text x="400" y="290" font-size="100" text-anchor="middle">${theme.icon}</text>
  </g>

  <!-- Scientific Nomenclature Label Banner -->
  <g transform="translate(400, 440)">
    <text x="0" y="0" font-family="Georgia, serif" font-weight="bold" font-size="34" fill="#FAF6EE" text-anchor="middle" filter="url(#shadow)">
      ${safeName}
    </text>
    <text x="0" y="34" font-family="Georgia, serif" font-style="italic" font-size="20" fill="${theme.accent}" text-anchor="middle">
      ${safeSci}
    </text>
    <text x="0" y="65" font-family="sans-serif" font-size="13" fill="#D6C097" letter-spacing="2" text-anchor="middle" opacity="0.8">
      CAMPUS SPECIMEN #${species.id.toString().padStart(3, "0")}
    </text>
  </g>
</svg>`;
}

const finalSpeciesList: SpeciesRecord[] = speciesList.map((item) => {
  // Check if a user uploaded an image for this item
  const matchingUpload = userImages.find((file) => {
    const base = path.parse(file).name.toLowerCase();
    return base === item.slug.toLowerCase();
  });

  let resolvedPath = item.imagePath;

  if (matchingUpload) {
    const src = path.join(intakeImagesDir, matchingUpload);
    const dest = path.join(publicSpeciesDir, matchingUpload);
    fs.copyFileSync(src, dest);
    resolvedPath = `/species/${matchingUpload}`;
    console.log(`✅ Synced uploaded photo: ${matchingUpload}`);
  } else {
    // Check if public/species/<slug>.* already exists
    const existing = fs.readdirSync(publicSpeciesDir).find((file) => path.parse(file).name.toLowerCase() === item.slug.toLowerCase());
    if (existing) {
      resolvedPath = `/species/${existing}`;
    } else {
      // Create SVG placeholder so there are zero 404s
      const svgFileName = `${item.slug}.svg`;
      const svgPath = path.join(publicSpeciesDir, svgFileName);
      fs.writeFileSync(svgPath, generateBotanicalSvg(item), "utf-8");
      resolvedPath = `/species/${svgFileName}`;
    }
  }

  return {
    ...item,
    imagePath: resolvedPath,
  };
});

// Write fallback JSON
fs.writeFileSync(fallbackDataFile, JSON.stringify(finalSpeciesList, null, 2), "utf-8");
console.log(`✨ Successfully synchronized ${finalSpeciesList.length} species into ${fallbackDataFile}`);
