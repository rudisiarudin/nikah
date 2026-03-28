# 💍 Ethereal Union — Wedding Invitation

<div align="center">

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)

**A premium, animated digital wedding invitation with guest management system.**

*Built with love for Ayu & Rudi — 02 Agustus 2026* 🤍

[Live Demo](https://ayurudi.web.id) · [Report Bug](https://github.com/rudisiarudin/nikah/issues)

---

</div>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎬 **Cinematic Opening** | Split-screen cover with animated birds overlay & guest name personalization |
| 🎵 **Background Music** | Auto-play ambient music with toggle control |
| ⏳ **Live Countdown** | Real-time countdown timer to the wedding day |
| 👫 **Couple Profiles** | Elegant bride & groom cards with gradient photo overlays |
| 📅 **Event Details** | Akad Nikah & Resepsi info with Google Maps & Calendar integration |
| 🎨 **Dresscode Palette** | Interactive color swatches for guest attire suggestions |
| 📖 **Love Story Timeline** | Animated timeline with background photo slideshow |
| 📸 **Photo Gallery** | Grid gallery with zoom-on-click & lightbox |
| 🎥 **Prewedding Video** | Autoplay muted cinematic video section |
| 💌 **Interactive Guestbook** | Real-time guest wishes with attendance status (powered by Supabase) |
| 💝 **Wedding Gift** | Bank transfer & physical gift information with copy-to-clipboard |
| 🕌 **Islamic Elements** | Bismillah, Quranic verses & wedding prayer (doa pengantin) |
| 🔗 **Personalized Links** | Unique guest URLs via `?to=NamaTamu` parameter |
| 📱 **Fully Responsive** | Optimized for mobile-first with elegant desktop sidebar layout |
| 🛡️ **Admin Panel** | Protected dashboard for managing wishes & replies (`/admin`) |

## 🖼️ Layout

```
┌──────────────────────────────────────────────────┐
│  Desktop View                                    │
│  ┌────────────────────┬─────────────────────┐    │
│  │                    │                     │    │
│  │   Desktop Sidebar  │  Mobile-like Panel  │    │
│  │   (Prewed Photo    │  (Scrollable        │    │
│  │    + Names + Date) │   Invitation)       │    │
│  │                    │                     │    │
│  │   flex-1           │   w-[450px]         │    │
│  │                    │                     │    │
│  └────────────────────┴─────────────────────┘    │
│                                                  │
│  Mobile View                                     │
│  ┌─────────────────────┐                         │
│  │  Full Width Panel   │                         │
│  │  (max-w: 500px)     │                         │
│  └─────────────────────┘                         │
└──────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

- **Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animation:** [Framer Motion](https://www.framer.com/motion/) + [Lottie](https://airbnb.io/lottie/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Fonts:** Italiana, Cinzel, Charlotte Southern, Outfit, Lateef
- **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Supabase](https://supabase.com/) account (free tier)

### 1. Clone the repository

```bash
git clone https://github.com/rudisiarudin/nikah.git
cd nikah
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_PASSWORD=your_admin_password
```

### 4. Setup Supabase database

Run the following SQL in your Supabase SQL Editor:

```sql
CREATE TABLE wishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Hadir',
  reply TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- Allow public read & insert
CREATE POLICY "Allow public read" ON wishes FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON wishes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON wishes FOR UPDATE USING (true);
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:5173/?to=NamaTamu](http://localhost:5173/?to=NamaTamu) in your browser.

## 📁 Project Structure

```
nikah/
├── public/
│   ├── font/                 # Custom fonts (Italiana, Cinzel, Charlotte)
│   ├── images/               # Photos (cover, gallery, story, profiles)
│   ├── video/                # Prewedding video
│   ├── Kaulah-Segalanya.mp3  # Background music
│   ├── lottie_birds.json     # Bird animation data
│   └── lottie_arrow-down.json
├── src/
│   ├── components/
│   │   ├── OpeningUI.tsx     # Split-screen cover / sampul
│   │   └── Reveal.tsx        # Scroll-triggered animation wrapper
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client config
│   │   └── utils.ts          # Utility functions (cn)
│   ├── App.tsx               # Main application (all sections)
│   ├── Admin.tsx             # Admin panel for managing wishes
│   ├── config.ts             # Wedding details & asset paths
│   ├── index.css             # Global styles & font faces
│   └── main.tsx              # App entry point & routing
├── .env                      # Environment variables (git-ignored)
├── index.html                # HTML entry point
├── vite.config.ts            # Vite configuration
└── package.json
```

## ⚙️ Configuration

All wedding details can be easily customized in [`src/config.ts`](src/config.ts):

```typescript
export const WEDDING_CONFIG = {
  brideName: 'Ayu Dewi Saputri',
  groomName: "Rudi Si'arudin",
  weddingDate: '02 . 08 . 2026',
  akadTime: '08.00 - 10.00 WIB',
  resepsiTime: '11.00 - 14.00 WIB',
  // ... more options
};
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel dashboard
4. Deploy! 🚀

### Netlify

1. Connect your GitHub repo to [Netlify](https://netlify.com/)
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy!

## 🔗 Guest Link Format

Each guest receives a personalized link:

```
https://yourdomain.com/?to=Nama+Tamu
```

Example:
- `https://yourdomain.com/?to=Budi+Santoso`
- `https://yourdomain.com/?to=Keluarga+Pak+Ahmad`

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Made with 💖 by Rudi Si'arudin**

*"Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri..."*
*(QS. Ar-Rum: 21)*

</div>
