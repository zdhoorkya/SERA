# SERA News and Magazine Platform

SERA is a full-stack digital news and magazine platform hosted under the parent ecosystem **Primpla** (`sera.primpla.com`). 

Rebuilt with pixel-per-pixel accuracy from the approved design mockup, it features a strict paper-and-ink grayscale theme, a custom serif and sans-serif type system (Fraunces, Newsreader, Archivo), and a sticky spine sidebar navigation on desktop that collapses to a top navigation bar on mobile.

---

## Technical Stack
- **Framework:** Next.js 14 (App Router) & TypeScript
- **Styling:** Tailwind CSS & Vanilla CSS (with high-contrast grayscale photo filters)
- **Animations:** GSAP & ScrollTrigger (for drawing labels and revealing images)
- **Database:** Prisma ORM (mapped to a local SQLite database for instant setup; swappable to PostgreSQL)
- **Authentication:** NextAuth (Credentials Provider)
- **Image Processing:** Server-side Jimp (automatically converts uploaded hero images to high-contrast grayscale before saving)

---

## Local Setup & Installation

### 1. Install Dependencies
Ensure you have Node.js version 18+ or 20+ installed. In the project root, run:
```bash
npm install
```

### 2. Configure Environment Variables
A default `.env` file is generated at the root of the project with local SQLite database parameters. You can modify these values as needed:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sera-secret-key-super-secret-12345"
```
*Note: If swapping to a live PostgreSQL database, change the `provider` in `prisma/schema.prisma` from `"sqlite"` to `"postgresql"` and update the `DATABASE_URL` link.*

### 3. Initialize and Seed the Database
Run the following commands to synchronize the database schema and populate it with sample accounts, categories, and articles (including the home-hero story, opinion rail columns, and category list grids):
```bash
# Push database schema
npx prisma db push

# Generate client
npx prisma generate

# Seed sample database values
node prisma/seed.js
```

### 4. Run Development Server
Boot the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Credentials and Roles

We seed four primary user accounts for local review (password for all accounts is **`password123`**):
- **Admin:** `admin@sera.com` (Aravind Nair)
- **Editor:** `editor@sera.com` (Devika Roy)
- **Author:** `author@sera.com` (Ananya Reddy)
- **Author Collaborator:** `karan@sera.com` (Karan Mehta)

### Role-Based Approval Workflow State Machine
1. **Author:** Can write and save draft articles (`DRAFT`). They submit drafts for editorial review, which moves the status to `IN_REVIEW`. They cannot self-publish.
2. **Editor:** Can review and edit submissions in the **Review Queue**. When they approve or edit/upload an article, it changes to `PENDING_ADMIN` verification. Editors cannot publish live pieces on their own.
3. **Admin:** Has full access. Reviews and verifies all submissions in the **Review Queue** (including editor-approved ones). Once verified, the Admin sets the status to `PUBLISHED`, taking the article live on the public site.

---

## Promoting a User to Editor or Admin

To change a user's role designation:
1. Log in as an Administrator (`admin@sera.com` / `password123`).
2. Go to the **Studio Dashboard** (`/studio`) and click **User Directory** in the sidebar.
3. Under the **Role Designation** column, select the new role (Author, Editor, Admin) from the dropdown for the target user.
4. The system updates their database record instantly via REST. They will obtain the new capabilities on their next page load/session verify.
