# Markdown Notes Web App

A **secure, cross-platform** markdown notes web application with **intuitive UX** and **export functionality**. Built with React, Vite, and modern web technologies.

## Features

### Core Features
- ✅ **Markdown Editor** with live preview and syntax highlighting
- ✅ **Split-pane view** (edit, preview, or true 50/50 split)
- ✅ **Rich toolbar** with formatting shortcuts
- ✅ **Code blocks** with syntax highlighting for multiple languages
- ✅ **Tables, lists, links, images** support
- ✅ **Word count, character count, reading time** statistics

### Security Features
- ✅ **Client-side encryption** using AES-GCM
- ✅ **Password protection** for individual notes
- ✅ **Secure key derivation** with PBKDF2
- ✅ **Input sanitization** to prevent XSS attacks
- ✅ **Filename sanitization** to prevent path traversal
- ✅ **Content validation** with size limits

### Export & Import
- ✅ **Export as Markdown** (.md)
- ✅ **Export as HTML** (.html)
- ✅ **Export as Text** (.txt)
- ✅ **Export as PDF** (.pdf)
- ✅ **Export all notes** as ZIP archive (sidebar only)
- ✅ **Import from files** (markdown, text, HTML)

### Organization
- ✅ **Tag support** for categorizing notes
- ✅ **Search functionality** across all notes
- ✅ **Sort by date** (newest first)
- ✅ **Filter by tags** — always-visible pill row in sidebar

### User Experience
- ✅ **Dark & Light themes**
- ✅ **Responsive design** (mobile, tablet, desktop)
- ✅ **Collapsible sidebar**
- ✅ **PWA support** (installable as app)
- ✅ **Offline support** (IndexedDB storage)

## Quick Start

### Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tinux-67/Writing-for-me.git
   cd Writing-for-me/web-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   After `VITE ready` appears, open `http://localhost:3030` manually.
   (Auto-open is disabled; port 3030 avoids conflict with open-webui on 3000.)

### One-Click Start (Linux)

A convenience script starts the dev server, waits until it is reachable, opens
the browser, and cleans up on `Ctrl+C`:

```bash
chmod +x scripts/dev.sh
./scripts/dev.sh            # default port 3030
PORT=3040 ./scripts/dev.sh  # override port
```

For a desktop/dock launcher, install the included `.desktop` file. It
assumes the repo is cloned at `~/Writing-for-me`; if your clone lives
elsewhere, edit the `Exec=` line in `scripts/writing-for-me.desktop` to
the absolute path of `dev.sh` first.

```bash
# Replace USERNAME in the Exec= line with your real username, then:
chmod +x scripts/writing-for-me.desktop
mkdir -p ~/.local/share/applications
cp scripts/writing-for-me.desktop ~/.local/share/applications/
update-desktop-database ~/.local/share/applications/ 2>/dev/null || true
```

"Writing for Me" then appears in your application menu; pin it to your dock for
a one-click start.

### Production Build

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Creating Notes
- Click the **"New Note"** button in the sidebar
- Start typing in the editor

### Editing Notes
- Click on any note in the sidebar to open it in the editor — notes are **always editable**
- Use the toolbar for formatting or type markdown directly
- The **title** is editable at the top of the editor; changes save automatically with debounce

### Formatting
The toolbar provides quick access to:
- **Bold** (`**text**`)
- **Italic** (`_text_`)
- **Code** (inline)
- **Bullet List**
- **Numbered List** (auto-continues on Enter; double-Enter exits list)
- **Link**
- **Template Insert**

### Encrypting Notes
1. When creating a note, you can optionally set a password
2. Encrypted notes are marked with a 🔒 icon
3. To view/edit an encrypted note, enter the password when prompted
4. The password is never stored or transmitted

### Exporting Notes
- Export is available from the **sidebar only** (per-note export is not present in the header)
- For bulk export: click **Export All** in the sidebar to download a ZIP archive

### Searching Notes
- Type in the search input in the sidebar
- Results filter in real-time

### Using Tags
- In the editor, type a tag and press **Enter** or **comma** to add it
- Remove a tag by clicking the **×** on its pill
- Autocomplete suggests from existing tags
- In the sidebar, click a tag pill to filter notes; click **All** to clear the filter

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close modals/dropdowns |
| `Ctrl/Cmd + F` | Find in note (browser native) |

> **Note:** `Ctrl+N`, `Ctrl+S`, and `Ctrl+E` are **not implemented**. Notes save automatically; use the sidebar for export.

## Security

### Encryption
- Uses **AES-GCM** for content encryption
- **PBKDF2** with 100,000 iterations for key derivation
- **SHA-256** for hashing
- All encryption happens **client-side** - your data never leaves your device unencrypted

### Data Protection
- **Input sanitization** prevents XSS attacks
- **Filename sanitization** prevents path traversal
- **Content validation** enforces size limits (1MB per note)
- **Secure storage** using IndexedDB with encryption support

### Privacy
- No tracking or analytics
- No external API calls
- All data stays on your device
- No registration required

## Project Structure

```
web-app/
├── public/                  # Static files
│   ├── index.html           # Main HTML template
│   ├── manifest.json        # PWA manifest
│   └── favicon.svg          # App icon
├── src/
│   ├── main.jsx            # App entry point
│   ├── App.jsx              # Main app component
│   ├── components/          # React components
│   │   ├── Editor.jsx       # Markdown editor (always editable)
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   └── NoteDetail.jsx   # Legacy — not used in routing
│   ├── hooks/               # Custom React hooks
│   │   ├── useLocalStorage.js
│   │   └── useDebounce.js
│   ├── styles/              # CSS styles
│   │   ├── index.css        # Global styles
│   │   └── app.css          # App-specific styles
│   ├── utils/               # Utility functions
│   │   ├── security.js      # Security utilities
│   │   ├── storage.js       # Storage utilities
│   │   └── markdown.js      # Markdown utilities
│   └── test/                # Tests
│       ├── setup.js         # Test setup
│       └── security.test.js  # Security tests
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## Technologies

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Markdown** - Markdown rendering
- **Prism.js / React Syntax Highlighter** - Code syntax highlighting
- **FileSaver.js** - File download utility
- **JSZip** - ZIP archive creation
- **PDF-Lib** - PDF generation

### Security
- **CryptoJS** - Encryption utilities
- **Web Crypto API** - Browser-native cryptography
- **UUID** - Unique ID generation

### Storage
- **IndexedDB** - Persistent storage
- **localForage** - IndexedDB wrapper

### Testing
- **Vitest** - Test runner
- **Testing Library** - React testing utilities

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full support |
| Firefox | ✅ Full support |
| Safari | ✅ Full support |
| Edge | ✅ Full support |
| Opera | ✅ Full support |

**Minimum Requirements:**
- ES6 support
- IndexedDB support
- Web Crypto API support

## PWA Features

The app can be installed as a Progressive Web App:

1. **Installation**: Open in Chrome/Edge and click "Install" in the address bar
2. **Offline Support**: Works without internet connection
3. **App-like Experience**: Runs in its own window
4. **Splash Screen**: Custom splash screen on launch
5. **Theme Colors**: Custom theme colors for native look

## Customization

### Themes
Edit the CSS variables in `src/styles/index.css`:

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
Modify the default settings in the App component:

```jsx
// Default theme
const [theme, setTheme] = useState('dark');

// Default sidebar state
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
```

## Troubleshooting

### Port 3000 Conflict
If another application (e.g., open-webui in Docker) is already using port 3000, you may see a blank page or a 500 error from a different app.

**Fix:**
```bash
PORT=3030 npm run dev
```
Or update `vite.config.js`:
```js
export default defineConfig({
  server: { port: 3030 }
})
```

### Service Worker Conflict
If the browser shows a 500 error or loads the wrong app on `localhost:3030`, a stale service worker from another project may be interfering.

**Fix:**
1. Open DevTools (F12)
2. Go to **Application** → **Service Workers** → **Unregister**
3. Go to **Application** → **Storage** → **Clear site data**
4. Hard-refresh the page (`Ctrl+Shift+R`)

### Notes Not Saving
- Check browser console for errors
- Ensure IndexedDB is not blocked
- Try clearing browser cache

### Encryption Not Working
- Ensure you're using a strong password (8+ chars, mixed case, numbers, special chars)
- Check browser console for errors
- Try a different browser

### Export Not Working
- Check if the note is encrypted (requires password)
- Ensure you have write permissions in your download directory
- Try a different export format

### Debug Mode

Add debug logging by modifying the `loadData` function in `App.jsx`:

```jsx
const loadData = useCallback(async () => {
  console.debug('Loading data...');
  try {
    // ... existing code
  } catch (err) {
    console.error('Failed to load data:', err);
    setError(err.message);
    setIsLoading(false);
  }
}, [currentNoteId]);
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Keep components small and focused
- Use TypeScript for new components (optional)
- Document new features in this README

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering
- [Prism.js](https://prismjs.com/) - Syntax highlighting
- [CryptoJS](https://github.com/brix/crypto-js) - Encryption utilities
- [localForage](https://localforage.github.io/localForage/) - Storage wrapper

## Contact

For questions or support:
- Open an issue on [GitHub](https://github.com/Tinux-67/Writing-for-me)
- Or contact the repository owner

---

**Built with ❤️ for secure, cross-platform note-taking**
