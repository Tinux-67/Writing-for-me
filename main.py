import os
import re
import threading
from datetime import datetime
from pathlib import Path
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.scrollview import ScrollView
from kivy.uix.gridlayout import GridLayout
from kivy.uix.popup import Popup
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.core.window import Window
from kivy.clock import Clock
import markdown2
import git
from functools import partial

# --- Constanten ---
NOTES_DIR = Path("notes")
GIT_REPO = Path(".")
MAX_NOTE_TITLE_LENGTH = 100
MAX_NOTE_CONTENT_LENGTH = 100000  # 100KB limiet per notitie
LONG_PRESS_DURATION = 0.6         # seconden voor lang indrukken

# --- Veiligheid ---
def sanitize_filename(filename: str) -> str:
    """Verwijder onveilige tekens uit bestandsnamen."""
    return re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", filename)

def validate_note_title(title: str) -> str:
    """Valideer en sanitize notitietitel."""
    if not title.strip():
        return "Onbenoemde notitie"
    return title[:MAX_NOTE_TITLE_LENGTH].strip()

def validate_note_content(content: str) -> str:
    """Valideer notitie-inhoud."""
    return content[:MAX_NOTE_CONTENT_LENGTH]


# --- Frontmatter parsing (stdlib only, geen PyYAML) ---
_FM_OPEN = re.compile(r'^---[ \t]*\r?\n', re.MULTILINE)
_FM_CLOSE = re.compile(r'\n---[ \t]*\r?\n')


def _parse_frontmatter(text: str) -> tuple:
    """Parseer YAML-stijl frontmatter uit markdown tekst.

    Geeft terug:
        (metadata_dict, body_text)
        metadata_dict: keys zijn 'title', 'created', etc.
        body_text: alles na de sluitende --- (of de volledige tekst als geen frontmatter)
    """
    if not text.startswith("---"):
        return {}, text

    # Zoek de sluitende ---
    close_match = _FM_CLOSE.search(text, 3)
    if not close_match:
        return {}, text

    fm_block = text[3:close_match.start()].strip()
    body = text[close_match.end():]

    metadata = {}
    for line in fm_block.splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if key:
            metadata[key] = value

    return metadata, body


def _encode_frontmatter(metadata: dict, body: str) -> str:
    """Codeer metadata dict + body naar een markdown bestand met frontmatter."""
    lines = ["---"]
    for key, value in metadata.items():
        lines.append(f"{key}: {value}")
    lines.append("---")
    lines.append("")
    lines.append(body.lstrip("\n"))
    return "\n".join(lines) + "\n"


# --- Notitie Model ---
class Note:
    def __init__(self, title: str, content: str, filepath: Path,
                 created_at: datetime = None):
        self.title = validate_note_title(title)
        self.content = validate_note_content(content)
        self.filepath = filepath
        self.created_at = created_at or datetime.now()
        self.updated_at = datetime.now()

    def save(self) -> bool:
        """Sla notitie op met frontmatter en commit naar Git."""
        try:
            NOTES_DIR.mkdir(exist_ok=True)

            metadata = {
                "title": self.title,
                "created": self.created_at.isoformat(),
            }
            file_content = _encode_frontmatter(metadata, self.content)

            with open(self.filepath, "w", encoding="utf-8") as f:
                f.write(file_content)

            self.updated_at = datetime.now()

            threading.Thread(target=self._git_commit, daemon=True).start()
            return True
        except Exception as e:
            print(f"Fout bij opslaan: {e}")
            return False

    def _git_commit(self):
        """Voer Git commit uit in een achtergrondthread."""
        try:
            repo = git.Repo(GIT_REPO)
            repo.index.add([str(self.filepath)])
            repo.index.commit(f"Update: {self.title}")
        except Exception as e:
            print(f"Git commit mislukt: {e}")

    @staticmethod
    def load(filepath: Path) -> "Note":
        """Laad een notitie vanaf schijf, inclusief frontmatter parsing."""
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                raw = f.read()

            metadata, content = _parse_frontmatter(raw)

            # Titel: frontmatter → bestandsnaam stem (achterwaartse compatibiliteit)
            if "title" in metadata and metadata["title"]:
                title = metadata["title"]
            else:
                title = Path(filepath).stem.replace("_", " ")

            # Aanmaakdatum: frontmatter → bestand mtime (achterwaartse compatibiliteit)
            if "created" in metadata:
                try:
                    created_at = datetime.fromisoformat(metadata["created"])
                except (ValueError, TypeError):
                    created_at = datetime.fromtimestamp(os.path.getmtime(filepath))
            else:
                created_at = datetime.fromtimestamp(os.path.getmtime(filepath))

            return Note(
                title=title,
                content=content,
                filepath=filepath,
                created_at=created_at,
            )
        except Exception as e:
            print(f"Fout bij laden: {e}")
            return Note(
                title="Fout bij laden",
                content=f"Fout: {str(e)}",
                filepath=filepath,
            )

    def delete(self) -> bool:
        """Verwijder notitie en commit naar Git."""
        try:
            if self.filepath.exists():
                self.filepath.unlink()
            threading.Thread(target=self._git_delete_commit, daemon=True).start()
            return True
        except Exception as e:
            print(f"Fout bij verwijderen: {e}")
            return False

    def _git_delete_commit(self):
        """Voer Git delete commit uit in een achtergrondthread."""
        try:
            repo = git.Repo(GIT_REPO)
            repo.index.remove([str(self.filepath)])
            repo.index.commit(f"Verwijderd: {self.title}")
        except Exception as e:
            print(f"Git delete commit mislukt: {e}")


# --- Git Service ---
class GitService:
    @staticmethod
    def init_repo() -> bool:
        """Initialiseer Git repository."""
        try:
            if not GIT_REPO.joinpath(".git").exists():
                git.Repo.init(GIT_REPO)
            return True
        except Exception as e:
            print(f"Git init mislukt: {e}")
            return False

    @staticmethod
    def get_commit_history() -> list:
        """Haalt Git commit geschiedenis op."""
        try:
            repo = git.Repo(GIT_REPO)
            return list(repo.iter_commits(max_count=50))
        except Exception as e:
            print(f"Fout bij ophalen Git geschiedenis: {e}")
            return []


# --- Export Service ---
class ExportService:
    @staticmethod
    def export_to_pdf(note: Note, callback=None):
        """Exporteer notitie naar PDF (gebruikt WeasyPrint)."""
        def _export():
            try:
                try:
                    from weasyprint import HTML
                except ImportError:
                    Clock.schedule_once(
                        lambda dt: callback(False, "WeasyPrint niet geïnstalleerd. Gebruik 'pip install weasyprint'"),
                        0
                    )
                    return
                html = markdown2.markdown(note.content)
                output_path = note.filepath.with_suffix(".pdf")
                HTML(string=f"<html><body>{html}</body></html>").write_pdf(str(output_path))
                Clock.schedule_once(lambda dt: callback(True, str(output_path)), 0)
            except PermissionError:
                Clock.schedule_once(
                    lambda dt: callback(False, "Geen schrijfrechten voor PDF export."),
                    0
                )
            except Exception as e:
                Clock.schedule_once(
                    lambda dt: callback(False, f"PDF export mislukt: {str(e)}"),
                    0
                )
        threading.Thread(target=_export, daemon=True).start()

    @staticmethod
    def export_to_html(note: Note, callback=None):
        """Exporteer notitie naar HTML."""
        def _export():
            try:
                html = markdown2.markdown(note.content)
                output_path = note.filepath.with_suffix(".html")
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(f"<html><body>{html}</body></html>")
                Clock.schedule_once(lambda dt: callback(True, str(output_path)), 0)
            except Exception as e:
                Clock.schedule_once(lambda dt: callback(False, f"HTML export mislukt: {e}"), 0)
        threading.Thread(target=_export, daemon=True).start()

    @staticmethod
    def export_to_txt(note: Note, callback=None):
        """Exporteer notitie naar TXT."""
        def _export():
            try:
                output_path = note.filepath.with_suffix(".txt")
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(note.content)
                Clock.schedule_once(lambda dt: callback(True, str(output_path)), 0)
            except Exception as e:
                Clock.schedule_once(lambda dt: callback(False, f"TXT export mislukt: {e}"), 0)
        threading.Thread(target=_export, daemon=True).start()


# --- UI Helpers ---
class UIHelpers:
    @staticmethod
    def show_message(title: str, message: str, size_hint=(0.8, 0.3)):
        """Toon een bericht in een popup."""
        popup = Popup(title=title, size_hint=size_hint)
        content = BoxLayout(orientation="vertical", spacing=10, padding=10)
        content.add_widget(Label(text=message))
        btn_ok = Button(text="OK", size_hint=(1, 0.3))
        btn_ok.bind(on_press=popup.dismiss)
        content.add_widget(btn_ok)
        popup.content = content
        popup.open()

    @staticmethod
    def show_confirmation(title: str, message: str, on_confirm, on_cancel=None):
        """Toon een bevestigingsdialog."""
        popup = Popup(title=title, size_hint=(0.8, 0.3))
        content = BoxLayout(orientation="vertical", spacing=10, padding=10)
        content.add_widget(Label(text=message))

        btn_layout = BoxLayout(spacing=10, size_hint=(1, 0.3))
        btn_yes = Button(text="Ja", background_color=(0, 0.5, 0, 1))
        btn_yes.bind(on_press=lambda btn: (popup.dismiss(), on_confirm()))
        btn_no = Button(text="Nee", background_color=(0.5, 0, 0, 1))
        btn_no.bind(on_press=lambda btn: (popup.dismiss(), on_cancel() if on_cancel else None))
        btn_layout.add_widget(btn_yes)
        btn_layout.add_widget(btn_no)
        content.add_widget(btn_layout)
        popup.content = content
        popup.open()


# --- Schermen ---
class NoteListScreen(BoxLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.orientation = "vertical"
        self.notes = []
        self.load_notes()
        self.create_ui()

    def load_notes(self):
        """Laad alle notities desde schijf."""
        self.notes = []
        if NOTES_DIR.exists():
            for md_file in sorted(NOTES_DIR.glob("*.md"), key=os.path.getmtime, reverse=True):
                self.notes.append(Note.load(md_file))

    def _make_note_button(self, note):
        """Maak een notitieknop met lang-indruk detectie via Clock.schedule_once.

        Kort indrukken (<0.6s) → notitie openen.
        Lang indrukken (≥0.6s) → opties popup (bewerken/verwijderen).
        """
        btn = Button(
            text=note.title,
            size_hint_y=None,
            height=50,
            background_color=(0.2, 0.2, 0.2, 1),
            color=(1, 1, 1, 1),
        )

        # Gebruik een mutable container zodat de closure de event-reference kan muteren
        state = {"event": None, "long_pressed": False}

        def on_touch_down(widget, touch):
            if widget.collide_point(*touch.pos):
                state["long_pressed"] = False
                state["event"] = Clock.schedule_once(
                    lambda dt: _fire_long_press(), LONG_PRESS_DURATION
                )
            return False

        def on_touch_up(widget, touch):
            if state["event"] is not None:
                state["event"].cancel()
                state["event"] = None
            return False

        def _fire_long_press():
            state["long_pressed"] = True
            state["event"] = None
            self.show_note_options(note, btn)

        def on_press(widget):
            # Onderdruk normale tik als lang indrukken al is geactiveerd
            if not state["long_pressed"]:
                self.open_note(note, widget)

        btn.bind(
            on_touch_down=on_touch_down,
            on_touch_up=on_touch_up,
            on_press=on_press,
        )
        return btn

    def create_ui(self):
        """Maak de UI voor de notitielijst."""
        self.clear_widgets()

        title = Label(
            text="Mijn Notities",
            font_size=24,
            color=(1, 1, 1, 1),
            size_hint=(1, 0.1),
        )
        self.add_widget(title)

        scroll = ScrollView()
        grid = GridLayout(cols=1, spacing=10, size_hint_y=None, padding=10)
        grid.bind(minimum_height=grid.setter("height"))

        if not self.notes:
            grid.add_widget(Label(
                text="Geen notities gevonden. Maak een nieuwe notitie!",
                color=(0.7, 0.7, 0.7, 1),
                size_hint_y=None,
                height=50,
            ))
        else:
            for note in self.notes:
                grid.add_widget(self._make_note_button(note))

        scroll.add_widget(grid)
        self.add_widget(scroll)

        btn_layout = BoxLayout(size_hint=(1, 0.1), spacing=10, padding=10)
        btn_new = Button(
            text="Nieuwe Notitie",
            background_color=(0, 0.5, 0, 1),
            color=(1, 1, 1, 1),
        )
        btn_new.bind(on_press=self.new_note)

        btn_history = Button(
            text="Git Geschiedenis",
            background_color=(0.5, 0, 0.5, 1),
            color=(1, 1, 1, 1),
        )
        btn_history.bind(on_press=lambda btn: setattr(self.parent, "current", "history"))

        btn_layout.add_widget(btn_new)
        btn_layout.add_widget(btn_history)
        self.add_widget(btn_layout)

    def open_note(self, note, instance):
        """Open een notitie in de editor."""
        self.parent.get_screen("editor").load_note(note)
        self.parent.current = "editor"

    def show_note_options(self, note, instance):
        """Toon opties voor een notitie (lang indrukken)."""
        content = BoxLayout(orientation="vertical", spacing=10, padding=10)
        popup = Popup(title=f"Opties voor: {note.title}", size_hint=(0.8, 0.4))

        btn_edit = Button(text="Bewerken", background_color=(0, 0.5, 0, 1))
        btn_edit.bind(on_press=lambda btn: (popup.dismiss(), self.open_note(note, None)))

        btn_delete = Button(text="Verwijderen", background_color=(0.5, 0, 0, 1))
        btn_delete.bind(on_press=lambda btn: (
            popup.dismiss(),
            UIHelpers.show_confirmation(
                "Verwijderen",
                f"Weet je zeker dat je '{note.title}' wilt verwijderen?",
                lambda: self.delete_note(note),
                lambda: None,
            )
        ))

        content.add_widget(btn_edit)
        content.add_widget(btn_delete)
        popup.content = content
        popup.open()

    def delete_note(self, note):
        """Verwijder een notitie."""
        if note.delete():
            self.notes.remove(note)
            self.create_ui()
            UIHelpers.show_message("Succes", "Notitie verwijderd!")
        else:
            UIHelpers.show_message("Fout", "Notitie kon niet worden verwijderd.")

    def new_note(self, instance):
        """Maak een nieuwe notitie."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = sanitize_filename(f"notitie_{timestamp}")
        filepath = NOTES_DIR / f"{filename}.md"
        new_note = Note(
            title=f"Notitie {timestamp}",
            content="# Nieuwe Notitie\n\nSchrijf hier in Markdown...",
            filepath=filepath,
        )
        if new_note.save():
            self.notes.insert(0, new_note)
            self.create_ui()
            self.open_note(new_note, None)
        else:
            UIHelpers.show_message("Fout", "Notitie kon niet worden aangemaakt.")


class NoteEditorScreen(BoxLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.orientation = "vertical"
        self.current_note = None
        self.create_ui()

    def create_ui(self):
        """Maak de UI voor de notitie-editor."""
        self.clear_widgets()

        self.title_input = TextInput(
            hint_text="Titel",
            size_hint=(1, 0.1),
            background_color=(0.2, 0.2, 0.2, 1),
            foreground_color=(1, 1, 1, 1),
            multiline=False,
        )
        self.add_widget(self.title_input)

        self.content_input = TextInput(
            hint_text="Schrijf hier in Markdown...\n\nBijvoorbeeld:\n# Titel\n\n- Lijstitem\n\n**Vet** of *cursief*",
            multiline=True,
            size_hint=(1, 0.7),
            background_color=(0.1, 0.1, 0.1, 1),
            foreground_color=(1, 1, 1, 1),
        )
        self.add_widget(self.content_input)

        # Markdown toolbar
        toolbar = BoxLayout(size_hint=(1, 0.1), spacing=5, padding=5)
        for label, text in [
            ("B", "**vet**"),
            ("I", "_cursief_"),
            ("H1", "# Titel"),
            ("List", "- Lijstitem\n"),
            ("Link", "[tekst](url)"),
        ]:
            toolbar.add_widget(Button(
                text=label,
                size_hint=(None, None),
                size=(40, 40),
                background_color=(0.3, 0.3, 0.3, 1),
                on_press=lambda btn, t=text: self.insert_markdown(t),
            ))
        self.add_widget(toolbar)

        btn_layout = BoxLayout(size_hint=(1, 0.1), spacing=10, padding=10)
        btn_save = Button(text="Opslaan", background_color=(0, 0.5, 0, 1), color=(1, 1, 1, 1))
        btn_save.bind(on_press=self.save_note)
        btn_preview = Button(text="Voorvertoning", background_color=(0, 0, 0.5, 1), color=(1, 1, 1, 1))
        btn_preview.bind(on_press=self.show_preview)
        btn_export = Button(text="Export", background_color=(0.5, 0, 0.5, 1), color=(1, 1, 1, 1))
        btn_export.bind(on_press=self.show_export_options)
        btn_back = Button(text="Terug", background_color=(0.5, 0, 0, 1), color=(1, 1, 1, 1))
        btn_back.bind(on_press=self.go_back)
        for b in [btn_save, btn_preview, btn_export, btn_back]:
            btn_layout.add_widget(b)
        self.add_widget(btn_layout)

    def load_note(self, note):
        """Laad een notitie in de editor."""
        self.current_note = note
        self.title_input.text = note.title
        self.content_input.text = note.content

    def insert_markdown(self, markdown_text):
        """Voeg Markdown-sjabloon in op de cursorpositie."""
        if self.content_input.cursor_pos():
            current_text = self.content_input.text
            cursor_pos = self.content_input.cursor_pos()[0]
            new_text = current_text[:cursor_pos] + markdown_text + current_text[cursor_pos:]
            self.content_input.text = new_text
            self.content_input.cursor = (cursor_pos + len(markdown_text), 0)
        else:
            self.content_input.text += markdown_text

    def save_note(self, instance):
        """Sla de huidige notitie op. Titel wordt gepersisteerd via frontmatter."""
        if not self.current_note:
            UIHelpers.show_message("Fout", "Geen notitie geladen!")
            return

        self.current_note.title = self.title_input.text
        self.current_note.content = self.content_input.text

        if self.current_note.save():
            UIHelpers.show_message("Succes", "Notitie opgeslagen!")
            self.parent.get_screen("list").load_notes()
            self.parent.get_screen("list").create_ui()
        else:
            UIHelpers.show_message("Fout", "Notitie kon niet worden opgeslagen.")

    def show_preview(self, instance):
        """Toon een voorvertoning van de Markdown."""
        if not self.current_note:
            return
        try:
            html = markdown2.markdown(self.content_input.text)
            popup = Popup(title="Voorvertoning", size_hint=(0.9, 0.8))
            scroll = ScrollView()
            label = Label(
                text=html,
                size_hint_y=None,
                height=1000,
                color=(0, 0, 0, 1),
                markup=True,
                text_size=(Window.width * 0.8, None),
            )
            label.bind(texture_size=label.setter("size"))
            scroll.add_widget(label)
            popup.content = scroll
            popup.open()
        except Exception as e:
            UIHelpers.show_message("Fout", f"Voorvertoning mislukt: {e}")

    def show_export_options(self, instance):
        """Toon export opties."""
        if not self.current_note:
            UIHelpers.show_message("Fout", "Geen notitie geladen!")
            return

        content = BoxLayout(orientation="vertical", spacing=10, padding=10)
        popup = Popup(title="Export Opties", size_hint=(0.8, 0.4))

        def export_callback(success, message):
            if success:
                UIHelpers.show_message("Succes", message)
            else:
                UIHelpers.show_message("Fout", message)

        btn_pdf = Button(text="Export naar PDF", background_color=(0.5, 0, 0, 1))
        btn_pdf.bind(on_press=lambda btn: (
            popup.dismiss(),
            ExportService.export_to_pdf(self.current_note, export_callback),
        ))
        btn_html = Button(text="Export naar HTML", background_color=(0, 0.5, 0, 1))
        btn_html.bind(on_press=lambda btn: (
            popup.dismiss(),
            ExportService.export_to_html(self.current_note, export_callback),
        ))
        btn_txt = Button(text="Export naar TXT", background_color=(0, 0, 0.5, 1))
        btn_txt.bind(on_press=lambda btn: (
            popup.dismiss(),
            ExportService.export_to_txt(self.current_note, export_callback),
        ))

        content.add_widget(btn_pdf)
        content.add_widget(btn_html)
        content.add_widget(btn_txt)
        popup.content = content
        popup.open()

    def go_back(self, instance):
        """Ga terug naar de notitielijst."""
        self.parent.current = "list"


class GitHistoryScreen(BoxLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.orientation = "vertical"
        self.commits = []
        self.load_commits()
        self.create_ui()

    def load_commits(self):
        """Laad Git commit geschiedenis."""
        self.commits = GitService.get_commit_history()

    def create_ui(self):
        """Maak de UI voor Git geschiedenis."""
        self.clear_widgets()

        title = Label(
            text="Git Geschiedenis",
            font_size=24,
            color=(1, 1, 1, 1),
            size_hint=(1, 0.1),
        )
        self.add_widget(title)

        scroll = ScrollView()
        grid = GridLayout(cols=1, spacing=10, size_hint_y=None, padding=10)
        grid.bind(minimum_height=grid.setter("height"))

        if not self.commits:
            grid.add_widget(Label(
                text="Geen commits gevonden.",
                color=(0.7, 0.7, 0.7, 1),
                size_hint_y=None,
                height=50,
            ))
        else:
            for commit in self.commits:
                commit_date = commit.committed_datetime.strftime("%Y-%m-%d %H:%M")
                btn = Button(
                    text=f"{commit.message}\n{commit_date} - {commit.author.name}",
                    size_hint_y=None,
                    height=80,
                    background_color=(0.2, 0.2, 0.2, 1),
                    color=(1, 1, 1, 1),
                    halign="left",
                    valign="middle",
                    text_size=(Window.width * 0.8, None),
                )
                grid.add_widget(btn)

        scroll.add_widget(grid)
        self.add_widget(scroll)

        btn_back = Button(
            text="Terug",
            size_hint=(1, 0.1),
            background_color=(0.5, 0, 0, 1),
            color=(1, 1, 1, 1),
        )
        btn_back.bind(on_press=self.go_back)
        self.add_widget(btn_back)

    def go_back(self, instance):
        """Ga terug naar de notitielijst."""
        self.parent.current = "list"


# --- Hoofd App ---
class WritingApp(App):
    def build(self):
        Window.clearcolor = (0.1, 0.1, 0.1, 1)
        self.title = "Writing for Me"

        GitService.init_repo()

        self.screen_manager = ScreenManager()

        note_list = NoteListScreen()
        screen_list = Screen(name="list")
        screen_list.add_widget(note_list)
        self.screen_manager.add_widget(screen_list)

        note_editor = NoteEditorScreen()
        screen_editor = Screen(name="editor")
        screen_editor.add_widget(note_editor)
        self.screen_manager.add_widget(screen_editor)

        git_history = GitHistoryScreen()
        screen_history = Screen(name="history")
        screen_history.add_widget(git_history)
        self.screen_manager.add_widget(screen_history)

        return self.screen_manager


if __name__ == "__main__":
    WritingApp().run()
