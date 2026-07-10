# Writing for Me

A **secure, cross-platform markdown notes application** with **version control (Git)** and **export functionality** (PDF, HTML, TXT). Available as both a **Python/Kivy mobile app** and a **modern web app**.

---

## 📱 Available Versions

### 1. Web App (Recommended)
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

**Access:** Open `http://localhost:3000` in your browser.

[→ Web App Documentation](web-app/README.md)

---

### 2. Python/Kivy Mobile App
A mobile application for **/e/OS** and **Android** devices with Git version control.

**Features:**
- ✅ **Markdown editor** with syntax highlighting and toolbar
- ✅ **Local version control** with Git (automatic commit on save)
- ✅ **Export to PDF, HTML, and TXT**
- ✅ **Dark theme** (suitable for /e/OS)
- ✅ **Offline work** (all data stored locally)
- ✅ **Git history** viewer in the app
- ✅ **Notes management** (create, edit, delete)
- ✅ **Secure file paths** (prevents directory traversal)
- ✅ **Input validation** (limits on title and content length)

**Quick Start:**
```bash
# For development
pip install kivy markdown2 gitpython weasyprint
python main.py

# For APK build
pip install buildozer
buildozer -v android debug
```

[→ Original Documentation](#-functionaliteiten)

---

## 🚀 Comparison

| Feature | Web App | Python/Kivy App |
|---------|---------|-----------------|
| **Platform** | Any browser | Android /e/OS |
| **Encryption** | ✅ AES-GCM | ❌ No |
| **Git Integration** | ❌ No | ✅ Yes |
| **Live Preview** | ✅ Yes | ❌ No |
| **Syntax Highlighting** | ✅ Yes | ✅ Yes |
| **Export Formats** | PDF, HTML, MD, TXT | PDF, HTML, TXT |
| **Import** | ✅ Yes | ❌ No |
| **Tags** | ✅ Yes | ❌ No |
| **Search** | ✅ Yes | ❌ No |
| **Themes** | Dark & Light | Dark only |
| **PWA** | ✅ Yes | ❌ No |
| **Offline** | ✅ IndexedDB | ✅ Local files |
| **Mobile Optimized** | ✅ Yes | ✅ Yes |

---

## 📁 Project Structure

```
Writing-for-me/
├── main.py                  # Python/Kivy mobile app
├── buildozer.spec           # Buildozer configuration for APK
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

## 🎯 Which Version Should You Use?

### Use the **Web App** if you want:
- A **modern, secure** note-taking experience
- **Cross-platform** support (works on any device with a browser)
- **Encryption** for sensitive notes
- **Rich features** like tags, search, and live preview
- **No installation** required (just open in browser)
- **PWA support** (can be installed as a standalone app)

### Use the **Python/Kivy App** if you want:
- A **native mobile app** for Android /e/OS
- **Git version control** built-in
- **Offline-first** design
- **Simple, focused** interface
- **APK distribution** for easy installation

---

## 🔧 Installation & Setup

### Web App

#### Development
```bash
cd web-app
npm install
npm run dev
```

#### Production Build
```bash
cd web-app
npm run build
# Files will be in the dist/ directory
```

#### Serve Production Build
```bash
cd web-app
npm run preview
# Or use the custom server
node scripts/serve.js 3000
```

### Python/Kivy App

#### Option 1: APK Install (Recommended)
1. Download the **APK** from the [Releases page](https://github.com/Tinux-67/Writing-for-me/releases)
2. Install the APK on your /e/OS or Android device

#### Option 2: Manual in Pydroid 3
1. Install **[Pydroid 3](https://f-droid.org/en/packages/ru.iiec.pydroid3/)** via F-Droid
2. Clone this project in Pydroid 3:
   ```bash
   git clone https://github.com/Tinux-67/Writing-for-me.git
   ```
3. Install required packages:
   ```bash
   pip install kivy markdown2 gitpython weasyprint
   ```
4. Run `main.py`

#### Option 3: APK Build with Buildozer
1. Install Buildozer:
   ```bash
   pip install buildozer
   ```
2. Clone this project:
   ```bash
   git clone https://github.com/Tinux-67/Writing-for-me.git
   cd Writing-for-me
   ```
3. Build the APK:
   ```bash
   buildozer -v android debug
   ```
4. The APK will be generated in `bin/WritingForMe-0.1.0-debug.apk`

---

## 📖 Usage

### Web App Usage

#### Creating Notes
- Click **"New Note"** in the sidebar
- Or press **Ctrl/Cmd + N**
- Start typing in the editor

#### Editing Notes
- Click on any note in the sidebar
- Click **"Edit"** to enable editing
- Use the toolbar for formatting
- Press **Ctrl/Cmd + S** or click **"Save"**

#### Encrypting Notes
1. When creating a note, set a password
2. Encrypted notes show a 🔒 icon
3. Enter password to view/edit encrypted notes

#### Exporting Notes
1. Open the note
2. Click **Export** button
3. Choose format (Markdown, HTML, Text, PDF)
4. File downloads automatically

#### Searching
- Press **Ctrl/Cmd + K** to focus search
- Type your query
- Results filter in real-time

### Python/Kivy App Usage

#### New Note
- Click **"New Note"** in the note list
- A new note is created with a timestamp as name

#### Edit Note
- Click on a note in the list to open it
- Use the **Markdown toolbar** for formatting
- Click **"Save"** to save changes (auto Git commit)

#### Delete Note
- Long press a note in the list
- Click **"Delete"** and confirm

#### Export
- Open a note
- Click **"Export"**
- Choose **PDF**, **HTML**, or **TXT**
- File saves to the `notes/` directory

#### Git History
- Click **"Git History"** to view all commits

---

## 🔒 Security

### Web App Security Features

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

### Python/Kivy App Security Features

#### File Security
- **Sanitized file paths** to prevent directory traversal
- **Input validation** for titles and content
- **Safe file operations**

#### Git Security
- **Background threads** for Git operations (prevents UI freezing)
- **Error handling** for all Git operations

---

## 🎨 Customization

### Web App Customization

#### Themes
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

#### Default Settings
Modify defaults in `web-app/src/App.jsx`:

```jsx
// Default theme
const [theme, setTheme] = useState('dark');

// Default sidebar state
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
```

### Python/Kivy App Customization

#### Colors
Edit color definitions in `main.py`:

```python
# Window colors
Window.clearcolor = (0.1, 0.1, 0.1, 1)  # Dark background

# Button colors
primary_color = (0.3, 0.4, 0.6, 1)
```

#### Limits
Edit constants in `main.py`:

```python
MAX_NOTE_TITLE_LENGTH = 100
MAX_NOTE_CONTENT_LENGTH = 100000  # 100KB
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

### Web App
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering
- [Prism.js](https://prismjs.com/) - Syntax highlighting
- [CryptoJS](https://github.com/brix/crypto-js) - Encryption utilities
- [localForage](https://localforage.github.io/localForage/) - Storage wrapper
- [PDF-Lib](https://pdf-lib.js.org/) - PDF generation
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - File download
- [JSZip](https://stuk.github.io/jszip/) - ZIP archive creation

### Python/Kivy App
- [Kivy](https://kivy.org/) - Cross-platform UI framework
- [Markdown2](https://github.com/trentm/python-markdown2) - Markdown to HTML
- [GitPython](https://gitpython.readthedocs.io/) - Git integration
- [WeasyPrint](https://weasyprint.org/) - HTML to PDF
- [Buildozer](https://buildozer.dev/) - APK building

---

## 📞 Contact & Support

For questions or support:
- Open an **issue** on [GitHub](https://github.com/Tinux-67/Writing-for-me)
- Or contact the repository owner

---

## 🏷️ Keywords

markdown, notes, web-app, cross-platform, secure, encryption, export, pwa, offline, react, vite, python, kivy, android, mobile

---

**Built with ❤️ for secure, cross-platform note-taking**
