# Markdown Notes Web App

A **secure, cross-platform** markdown notes web application with **intuitive UX** and **export functionality**. Built with React, Vite, and modern web technologies.

## Features

### Core Features
- ✅ **Markdown Editor** with live preview and syntax highlighting
- ✅ **Split-pane view** (edit, preview, or split)
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
- ✅ **Export all notes** as ZIP archive
- ✅ **Import from files** (markdown, text, HTML)

### Organization
- ✅ **Tag support** for categorizing notes
- ✅ **Search functionality** across all notes
- ✅ **Sort by date** (newest first)
- ✅ **Filter by tags**

### User Experience
- ✅ **Dark & Light themes**
- ✅ **Responsive design** (mobile, tablet, desktop)
- ✅ **Keyboard shortcuts**
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
   The app will automatically open at `http://localhost:3000`

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
- Or press **Ctrl/Cmd + N**
- Start typing in the editor

### Editing Notes
- Click on any note in the sidebar to open it
- Click **"Edit"** to enable editing
- Use the toolbar for formatting or type markdown directly
- Press **Ctrl/Cmd + S** or click **"Save"** to save changes

### Formatting
The toolbar provides quick access to common markdown formatting:
- **Headers**: H1, H2, H3
- **Text**: Bold, Italic, Strikethrough, Inline Code
- **Lists**: Bullet List, Numbered List
- **Code**: Code Block (with language selection)
- **Links & Images**: Insert Link, Insert Image
- **Other**: Horizontal Rule, Table

### Encrypting Notes
1. When creating a note, you can optionally set a password
2. Encrypted notes are marked with a 🔒 icon
3. To view/edit an encrypted note, enter the password when prompted
4. The password is never stored or transmitted

### Exporting Notes
1. Open the note you want to export
2. Click the **Export** button in the header
3. Choose your preferred format (Markdown, HTML, Text, PDF)
4. The file will download automatically

### Exporting All Notes
- Press **Ctrl/Cmd + E** to export all notes as a ZIP archive

### Searching Notes
- Press **Ctrl/Cmd + K** to focus the search input
- Type your search query
- Results will filter in real-time

### Using Tags
- Tags are automatically extracted from your notes
- Click on a tag in the sidebar to filter notes by that tag
- Click **"All"** to clear the filter

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | Create new note |
| `Ctrl/Cmd + K` | Focus search |
| `Ctrl/Cmd + S` | Save note |
| `Ctrl/Cmd + E` | Export all notes |
| `Esc` | Close modals/dropdowns |
| `Ctrl/Cmd + F` | Find in note (browser native) |

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
│   │   ├── Editor.jsx       # Markdown editor
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   └── NoteDetail.jsx   # Note detail view
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

### Common Issues

**Notes not saving:**
- Check browser console for errors
- Ensure IndexedDB is not blocked
- Try clearing browser cache

**Encryption not working:**
- Ensure you're using a strong password (8+ chars, mixed case, numbers, special chars)
- Check browser console for errors
- Try a different browser

**Export not working:**
- Check if the note is encrypted (requires password)
- Ensure you have write permissions in your download directory
- Try a different export format

**App not loading:**
- Check browser console for errors
- Ensure JavaScript is enabled
- Try clearing browser cache
- Try a different browser

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
