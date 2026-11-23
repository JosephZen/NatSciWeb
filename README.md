# 🌿 Picture Book of Wild Life and Plants

A full-stack interactive biodiversity website cataloging **60 unique campus plants and wildlife specimens**, built with **Next.js 14+ (App Router)**, **Tailwind CSS**, **Framer Motion**, and **Neon Serverless Postgres**.

---

## ✨ Features

- **UI 1: Scrapbook Modal Experience with 3D Book Turning**
  - **Realistic 3D Page Turn Animation**: Next and previous pages rotate in 3D around the central spine (`rotateY: 45deg` to `-45deg`) with dynamic shadow and lighting layers, simulating physical paper bending.
  - **Synthesized Paper Sound**: Built-in zero-dependency Web Audio API that generates an authentic, gentle paper rustle and whoosh sound on every page flip (with Mute/Sound On toggle).
  - **Cover Reveal Mode**: Option to toggle a vintage leather-bound cover with gold embossed lettering that opens into the field notes.
  - **Dog-Ear Interactive Corners**: Folded page corner peel hints on the bottom corners that let you turn pages with a single click.
  - Authentic scrapbook aesthetic (washi tape, polaroid photo frames, stamps, paper textures).
  - Ambient rainforest rain droplet canvas animation with interactive toggle.
  - Page-by-page flipping (◀ ▶ keyboard arrows, dog-ear corners, or buttons).
  - Can be dismissed anytime with <kbd>ESC</kbd> or the close button.
  - Floating book icon in the bottom-right corner (`fixed bottom-6 right-6`) with bounce animation that re-opens the scrapbook to your last-viewed page.
- **UI 2: Catalog View (Row-Column & Grid Layout)**
  - Clean nature-themed layout displaying plain static images with standardized fields:
    - **Common Name** (e.g. *Huntsman Spider*)
    - **Scientific Name** (e.g. *Family Sparassidae*)
    - **Origin**
    - **Description**
    - **Fun Fact** (highlighted in sticky-note callout)
  - Search bar (by common name, scientific name, or keywords).
  - Category filters (*Insects*, *Arachnids*, *Flora & Flowers*, *Trees & Ferns*, *Birds & Reptiles*, *Small Fauna*).
  - Toggle between **Grid Cards** and **Row List** layout.
  - "View in Scrapbook" button on every card to jump directly to that page in the book.
- **Full-Stack REST API**:
  - `GET /api/species` returns JSON of all 60 documented specimens.

---

## 📁 Where to Input Images & Text

We have created a dedicated intake folder right in your project:

```
content-intake/
├── images/               <-- 📸 DROP YOUR 60 IMAGES HERE (.jpg, .png, .webp)
├── species-data.json     <-- 📝 EDIT YOUR 60 TEXT ENTRIES HERE
└── README.md             <-- Guide on updating content
```

### 1. Adding/Editing Texts
Open `content-intake/species-data.json`. It is already pre-loaded with 60 comprehensive campus entries. You can edit any field (Common Name, Scientific Name, Origin, Description, Fun Fact) directly.

### 2. Adding Images
Save your image files into `content-intake/images/` using the slug name (e.g. `huntsman-spider.jpg`).

### 3. Syncing Your Changes
Whenever you update text or drop images into `content-intake/`, simply run:

```bash
npm run sync-data
```

This will automatically copy your images into `public/species/`, validate all paths, and generate fallback botanical cards for any species that doesn't have a photo yet (ensuring zero broken links!).

---

## 🔍 How to Trace Images and Text on the Frontend

Here is how data flows from storage to the frontend components:

```
[content-intake/species-data.json] OR [Neon Postgres "species" table]
                               │
                               ▼
                    [src/lib/species.ts]
                    (getSpeciesList())
                               │
                               ▼
                    [src/app/page.tsx]
                     (Server Component)
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   [src/components/CatalogView.tsx]      [src/components/ScrapbookModal.tsx]
         (UI 2: Catalog Grid)                   (UI 1: Scrapbook Modal)
   • item.imagePath                       • item.imagePath (Polaroid frame)
   • item.commonName                      • item.commonName (Page title)
   • item.scientificName                  • item.scientificName (Taxonomy)
   • item.origin                          • item.origin (Stamped box)
   • item.description                     • item.description (Journal notes)
   • item.funFact                         • item.funFact (Yellow sticky note)
```

- **Local Images**: Placed in `public/species/`. Next.js serves them at `/species/<filename>`.
- **Database Fields**: Mapped directly in `src/db/schema.ts` and `src/lib/species.ts`.

---

## 🚀 Running Locally

1. **Install dependencies** (already installed):
   ```bash
   npm install
   ```
2. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Connecting to Neon Serverless Postgres

The site is currently running on the local fallback JSON and works 100% out of the box.

To connect your **Neon Postgres** database:
1. Create a project at [Neon Console](https://console.neon.tech).
2. Copy your connection string into `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
3. Seed the 60 entries into Neon:
   ```bash
   npm run seed
   ```
4. Restart your dev server (`npm run dev`). The header badge will switch from *"Local Verified Dataset"* to *"⚡ Neon Serverless Postgres"*.

---

## 🌐 Deploying to GitHub & Vercel

1. **Automated One-Command Push with Git LFS (.bat & .sh)**:
   You can push your entire project and media assets (images, PDFs) using either the Windows Batch file (`.bat`) or the Bash script (`.sh`):

   ```cmd
   :: Method 1: Double-click push-with-lfs.bat in File Explorer, or in CMD:
   push-with-lfs.bat

   :: Method 2: Via npm:
   npm run push

   :: Method 3: In Git Bash / Linux / macOS terminal:
   bash push-with-lfs.sh
   ```

   **What the script does automatically**:
   - Runs `npm run sync-data` to sync images from `content-intake/images/` to `public/species/`.
   - Initializes Git and sets default branch to `main` if not yet done.
   - Installs Git LFS hooks and tracks all binary image assets (`*.jpg`, `*.jpeg`, `*.png`, `*.webp`, `*.pdf`).
   - Stages `.gitattributes` and project files.
   - Prompts for your GitHub repository URL if no remote is configured yet.
   - Pushes all Git LFS media objects and code commits to GitHub.

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Import your GitHub repository.
   - In **Environment Variables**, add:
     - `DATABASE_URL`: Your Neon Postgres connection string.
   - Click **Deploy**. Vercel will build and serve your global fullstack app.

---

## 📜 Master System Specification Prompt

Below is the complete prompt incorporating the 3D book turning mechanism and fullstack specifications:

```markdown
Build a full-stack Next.js 14+ (App Router, TypeScript) website titled "Picture Book of Wild Life and Plants" for a campus natural science biodiversity catalog featuring 60 unique plants, insects, and creatures.

### 1. Dual User Interface Architecture
- **UI 1: Modal Scrapbook Experience (Authentic 3D Book Turning)**
  - Interactive modal designed like an explorer's field journal and scrapbook.
  - Realistic 3D book page flipping:
    - Page turning animates in 3D around the central spine (`rotateY` with perspective, depth scale, and dynamic shadows) so pages turn like a physical book.
    - Web Audio API synthesized paper swoosh/rustle sound effect on each page turn (with mute toggle).
    - Ornate leather cover toggle mode with gold-leaf typography.
    - Interactive dog-ear corner curls on bottom corners to flip forward/backward with a click.
    - Scrapbook visual aesthetics: Washi tape strips, polaroid-style specimen photo frames with handwritten titles, botanical classification stamps, and a yellow sticky note with a pushpin for the Fun Fact.
  - Controls: Next/Previous buttons, keyboard arrows (◀ ▶), and global ESC key listener to exit anytime.
  - Floating Trigger: An animated floating mini-book fixed at `bottom-6 right-6` with pulse animation, hover tooltip, and specimen counter badge to re-open the scrapbook to the last-viewed page.

- **UI 2: Row-Column Nature Catalog**
  - Standardized specimen cards/rows displaying:
    - Common Name
    - Scientific Name (italicized taxonomy)
    - Origin
    - Description
    - Fun Fact (highlighted callout box)
    - Specimen photo
    - "View in Scrapbook Mode" button to jump directly to that page in UI 1.
  - Live search input + category filter tabs (Insects, Arachnids, Flora & Flowers, Trees & Ferns, Birds & Reptiles, Small Fauna).
  - Grid View vs Row View layout switcher.

- **Ambient Rainforest Flare**:
  - Fullscreen HTML5 canvas particle rain with gentle water ripples, recreating a peaceful rainforest atmosphere with a toggle button.

### 2. Data & Asset Management
- **Dedicated User Intake**:
  - `content-intake/images/` for user image uploads.
  - `content-intake/species-data.json` for all 60 text entries.
  - `npm run sync-data` command that copies user images to `public/species/`, validates slugs, and auto-generates botanical SVG placeholders for any unassigned item so there are zero 404s.
- **Fullstack Database Layer**:
  - Neon Serverless Postgres via Drizzle ORM (`species` table).
  - Seed script (`npm run seed`) to upsert all 60 items into Neon.
  - Automatic fallback to verified local JSON if `DATABASE_URL` is omitted, ensuring zero-configuration local operation.
  - REST endpoint: `GET /api/species`.
```

