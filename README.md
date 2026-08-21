# Writing for Me

[![CI](https://github.com/Tinux-67/Writing-for-me/actions/workflows/ci.yml/badge.svg)](https://github.com/Tinux-67/Writing-for-me/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Tinux-67/Writing-for-me/pulls)

A **secure, cross-platform markdown notes application** with **export functionality** (PDF, HTML, TXT). Built as a modern web app.

---

## 🚀 Web App

A modern, secure, cross-platform web application built with React and Vite.

**Features:**
- ✅ **Client-side encryption** (AES-GCM)
- ✅ **Live markdown preview** with syntax highlighting
- ✅ **Export to PDF, HTML, Markdown, Text**
- ✅ **Import from files**
- ✅ **Tag support** and **search functionality**
- ✅ **Dark & Light themes**
- ✅ **PWA support** (installable as app)
- ✅ **Offline support** (IndexedDB)
- ✅ **Responsive design** (mobile, tablet, desktop)

**Quick Start:**
```bash
cd web-app
npm install
npm run dev
```

**Access:** Open `http://localhost:3030` in your browser.

[→ Web App Documentation](web-app/README.md)

---

## 📁 Project Structure

```
Writing-for-me/
├── README.md                # This file
└── web-app/                 # Modern web application
    ├── public/              # Static files
    │   ├── index.html       # Main HTML template
    │   ├── manifest.json    # PWA manifest
    │   └── favicon.svg      # App icon
    ├── src/
    │   ├── main.jsx         # App entry point
    │   ├── App.jsx           # Main app component
    │   ├── components/       # React components
    │   │   ├── Editor.jsx    # Markdown editor
    │   │   ├── Sidebar.jsx   # Navigation sidebar
    │   │   └── NoteDetail.jsx # Note detail view
    │   ├── hooks/            # Custom React hooks
    │   ├── styles/           # CSS styles
    │   ├── utils/            # Utility functions
    │   │   ├── security.js   # Security & encryption
    │   │   ├── storage.js    # Storage & export
    │   │   └── markdown.js   # Markdown utilities
    │   └── test/             # Tests
    ├── package.json          # Dependencies
    ├── vite.config.js        # Vite configuration
    └── README.md             # Web app documentation
```

---

## 🔧 Installation & Setup

### Development
```bash
cd web-app
npm install
npm run dev
```

### Production Build
```bash
cd web-app
npm run build
# Files will be in the dist/ directory
```

### Serve Production Build
```bash
cd web-app
npm run preview
# Or use the custom server
node scripts/serve.js 3000
```

---

## 📖 Usage

### Creating Notes
- Click **"New Note"** in the sidebar
- Or press **Ctrl/Cmd + N**
- Start typing in the editor

### Editing Notes
- Click on any note in the sidebar
- Click **"Edit"** to enable editing
- Use the toolbar for formatting
- Press **Ctrl/Cmd + S** or click **"Save"**

### Encrypting Notes
1. When creating a note, set a password
2. Encrypted notes show a 🔒 icon
3. Enter password to view/edit encrypted notes

### Exporting Notes
1. Open the note
2. Click **Export** button
3. Choose format (Markdown, HTML, Text, PDF)
4. File downloads automatically

### Searching
- Press **Ctrl/Cmd + K** to focus search
- Type your query
- Results filter in real-time

---

## 🔒 Security

### Security Features

#### Encryption
- **AES-GCM** encryption for note content
- **PBKDF2** key derivation with 100,000 iterations
- **SHA-256** hashing
- All encryption happens **client-side**

#### Data Protection
- **Input sanitization** prevents XSS attacks
- **Filename sanitization** prevents path traversal
- **Content validation** with size limits (1MB per note)
- **Secure storage** using IndexedDB

#### Privacy
- ❌ No tracking or analytics
- ❌ No external API calls
- ✅ All data stays on your device
- ✅ No registration required

---

## 🎨 Customization

### Themes
Edit CSS variables in `web-app/src/styles/index.css`:

```css
:root {
  --color-primary: #6366f1;
  --bg-primary: #1a1a2e;
  /* ... */
}

[data-theme="light"] {
  --bg-primary: #f8fafc;
  /* ... */
}
```

### Default Settings
Modify defaults in `web-app/src/App.jsx`:

```jsx
// Default theme
const [theme, setTheme] = useState('dark');

// Default sidebar state
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/your-feature`)
3. **Commit** your changes (`git commit -am 'Add some feature'`)
4. **Push** to the branch (`git push origin feature/your-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Keep components/modules small and focused
- Document new features
- Respect security best practices

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering
- [Prism.js](https://prismjs.com/) - Syntax highlighting
- [WebCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - AES-GCM encryption (native browser)
- [DOMPurify](https://github.com/cure53/DOMPurify) - HTML sanitization
- [localForage](https://localforage.github.io/localForage/) - Storage wrapper
- [PDF-Lib](https://pdf-lib.js.org/) - PDF generation
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - File download
- [JSZip](https://stuk.github.io/jszip/) - ZIP archive creation

---

## 📞 Contact & Support

For questions or support:
- Open an **issue** on [GitHub](https://github.com/Tinux-67/Writing-for-me)
- Or contact the repository owner

---

## 🏷️ Keywords

markdown, notes, web-app, cross-platform, secure, encryption, export, pwa, offline, react, vite

---

**Built with ❤️ for secure, cross-platform note-taking**
