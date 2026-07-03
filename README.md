# Writing for Me

Een eenvoudige **Markdown note-app** voor **/e/OS** (en andere Android-apparaten) met **versiebeheer (Git)** en **exportfunctionaliteit** (PDF, HTML, TXT).

---

## 📌 Functionaliteiten
- ✅ **Markdown editor** met syntax highlighting en toolbar
- ✅ **Lokaal versiebeheer** met Git (automatisch commiten bij opslaan)
- ✅ **Export naar PDF, HTML en TXT**
- ✅ **Donker thema** (geschikt voor /e/OS)
- ✅ **Offline werken** (alle data lokaal opgeslagen)
- ✅ **Git geschiedenis** bekijken in de app
- ✅ **Notities bewerken, verwijderen en maken**
- ✅ **Veilige bestandspaden** (voorkomt directory traversal)
- ✅ **Input validatie** (limieten op titel- en inhoudslengte)

---

## 📱 Screenshots
*(Voeg later screenshots toe als de app klaar is!)*

---

## 🛠 Vereisten
### Voor Gebruik (APK)
- Een **Android-apparaat** (inclusief /e/OS) met **API 21+** (Android 5.0+).

### Voor Ontwikkeling
- **Python 3.8+**
- **Buildozer** (voor APK bouwen)
- **Kivy 2.1.0**
- **GitPython**
- **Markdown2**
- **WeasyPrint** (voor PDF-export)

---

## 📥 Installatie
### Optie 1: APK Installeren (Aanbevolen)
1. Download de **APK** vanaf de [Releases-pagina](https://github.com/Tinux-67/Writing-for-me/releases).
2. Installeer de APK op je /e/OS-apparaat.

### Optie 2: Handmatig in Pydroid 3
1. Installeer **[Pydroid 3](https://f-droid.org/en/packages/ru.iiec.pydroid3/)** via F-Droid.
2. Clone dit project in Pydroid 3:
   ```bash
   git clone https://github.com/Tinux-67/Writing-for-me.git
   ```
3. Installeer de benodigde packages:
   ```bash
   pip install kivy markdown2 gitpython weasyprint
   ```
4. Voer `main.py` uit.

### Optie 3: APK Bouwen met Buildozer
1. Installeer Buildozer:
   ```bash
   pip install buildozer
   ```
2. Clone dit project:
   ```bash
   git clone https://github.com/Tinux-67/Writing-for-me.git
   cd Writing-for-me
   ```
3. Bouw de APK:
   ```bash
   buildozer -v android debug
   ```
4. De APK wordt gegenereerd in `bin/WritingForMe-0.1.0-debug.apk`.

---

## 📂 Projectstructuur
```
Writing-for-me/
├── main.py          # Hoofdscript (Kivy app)
├── buildozer.spec   # Buildozer configuratie voor APK
├── notes/           # Map voor notities (wordt automatisch aangemaakt)
├── .git/            # Git-repo (wordt geïnitialiseerd)
└── README.md        # Documentatie
```

---

## 🚀 Gebruik
1. **Nieuwe notitie maken**:
   - Klik op **"Nieuwe Notitie"** in de notitielijst.
   - Een nieuwe notitie wordt aangemaakt met een timestamp als naam.

2. **Notitie bewerken**:
   - Klik op een notitie in de lijst om deze te openen.
   - Gebruik de **Markdown toolbar** voor opmaak (vet, cursief, koppen, lijsten, links).
   - Klik op **"Opslaan"** om wijzigingen op te slaan (automatisch Git commit).

3. **Notitie verwijderen**:
   - Houd een notitie in de lijst **lang ingedrukt** om opties te zien.
   - Klik op **"Verwijderen"** en bevestig.

4. **Export**:
   - Open een notitie en klik op **"Export"**.
   - Kies **PDF**, **HTML** of **TXT**.
   - Het bestand wordt opgeslagen in de `notes/` map.

5. **Git Geschiedenis**:
   - Klik op **"Git Geschiedenis"** om alle commits te bekijken.

---

## 🔧 Technische Details
### Gebruikte Bibliotheken
| Bibliotheek | Doel | Versie |
|-------------|------|--------|
| **Kivy** | GUI-framework | 2.1.0 |
| **Markdown2** | Markdown naar HTML | Latest |
| **GitPython** | Git-integratie | Latest |
| **WeasyPrint** | HTML naar PDF | Latest |

### Veiligheid
- **Bestandspaden** worden gesanitized om **directory traversal** te voorkomen.
- **Input validatie** voor titels en inhoud (limieten op lengte).
- **Git-operaties** worden uitgevoerd in **achtergrondthreads** om UI freezing te voorkomen.
- **Foutafhandeling** voor alle kritieke operaties.

---

## 🐛 Foutoplossing
| Probleem | Oplossing |
|----------|-----------|
| **APK crasht bij opstarten** | Zorg dat alle dependencies geïnstalleerd zijn (`kivy`, `markdown2`, `gitpython`, `weasyprint`). |
| **PDF-export werkt niet** | Installeer **WeasyPrint** (`pip install weasyprint`). |
| **Git commits werken niet** | Zorg dat **Git** geïnstalleerd is op je systeem. |
| **Notities worden niet opgeslagen** | Controleer of de `notes/` map bestaat en schrijfrechten heeft. |
| **App ziet er slecht uit** | Pas het thema aan in `main.py` (zoals `Window.clearcolor`). |

---

## 📜 Licentie
Dit project is gelicenseerd onder de **MIT Licentie** – zie [LICENSE](LICENSE) voor details.

---

## 🤝 Bijdragen
Pull requests zijn welkom! Open een **issue** voor bugrapporten of functieverzoeken.

---

## 📞 Contact
Voor vragen of ondersteuning:
- Open een **issue** op GitHub.
- Of stuur een bericht naar de eigenaar van deze repository.
