# 🌐 Smart Job Scraper Frontend

Beautiful React UI for AI-powered resume analysis and job scraping from Indeed.

## ✨ Features

- **Resume Upload & Analysis** - Drag-drop PDF upload with instant keyword extraction
- **Real-time Job Scraping** - Live progress bar showing scraping status per keyword
- **Advanced Filtering** - Search jobs, filter by company, sort by relevance/company/title
- **Dark/Light Theme** - Toggle between dark and light modes (saved locally)
- **Export Results** - Download jobs as TXT, CSV, or JSON formats
- **Favorites System** - Star jobs and save them locally in browser
- **Toast Notifications** - Real-time feedback messages with sound effects
- **Animated Background** - Particle effects and confetti celebration animations
- **Keyboard Shortcuts** - Ctrl+S to scrape, Ctrl+D to download
- **Responsive Design** - Works perfectly on desktop and mobile
- **Editable Keywords** - Add/remove keywords before scraping

## 🛠️ Prerequisites

- Node.js 16 or higher
- npm (comes with Node.js)
- Git

## 📦 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/noaman2005/job-scraper-frontend.git
cd job-scraper-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment Files

**`.env.local`** (for local development):
```
VITE_API_URL=http://localhost:8000
```

**`.env`** (for production):
```
VITE_API_URL=https://your-backend-url.onrender.com
```

## 🚀 Running the Application

### Start Development Server
```bash
npm run dev
```

App will open at: **http://localhost:5173**

Hot reload enabled - changes save automatically!

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

## 📝 How to Use

1. **Upload Resume** - Click upload area or drag-drop PDF file
2. **Analyze** - Click "Analyze Resume" button to extract keywords
3. **Edit Keywords** - Add/remove skills as needed before scraping
4. **Enter Location** - Type city name (autocomplete suggestions appear)
5. **Start Scraping** - Click "Start Scraping" or press Ctrl+S
6. **View Results** - Jobs appear in real-time with progress updates
7. **Filter & Search** - Use search, company filter, and sort options
8. **Save Favorites** - Click star icon on jobs to save them
9. **Export** - Download all results as TXT, CSV, or JSON

## 📂 Project Structure

```
src/
├── App.jsx                    # Main component
├── App.css                    # Main styles
├── components/
│   ├── Toast.jsx             # Toast notifications
│   ├── Toast.css
│   ├── JobModal.jsx          # Job details popup
│   ├── JobModal.css
│   ├── ProgressBar.jsx       # Scraping progress
│   ├── ProgressBar.css
│   ├── StatsCard.jsx         # Stats display
│   ├── StatsCard.css
│   ├── ParticleBackground.jsx # Animated background
│   └── ParticleBackground.css
└── utils/
    └── confetti.js           # Celebration effects
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Start scraping |
| `Ctrl+D` | Download as TXT |

## 💾 Local Storage

App saves automatically:
- Favorite jobs
- Theme preference (dark/light)

Data persists even after closing browser!

## 🎨 Customization

### Change Colors
Edit CSS variables in `App.css`:
```css
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--accent-color: #ff0080;
--text-light: rgba(255, 255, 255, 0.8);
```

### Toggle Features
- Sound: Click speaker icon (top-right)
- Theme: Click sun/moon icon (top-right)

## 🐛 Troubleshooting

### Backend Connection Error
- Ensure backend is running on `http://localhost:8000`
- Check `.env.local` has correct API URL
- Verify CORS is enabled on backend

### No Jobs Found
- Backend scraping might have issues
- Check Chrome is installed on backend server
- View backend terminal for error logs

### Blank Page
- Press F12 to open DevTools
- Check Console tab for JavaScript errors
- Ensure all dependencies installed: `npm install`

## 🤝 Dependencies

- `react` - UI framework
- `axios` - HTTP requests
- `vite` - Build tool

## 📄 License

MIT License

## 👨‍💻 Author

Created by Noaman
