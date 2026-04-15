"""
Sample Python file for testing the Text Editor extension.
Demonstrates various Python language features.
"""

from dataclasses import dataclass, field
from typing import Optional
from pathlib import Path
import json


@dataclass
class Tag:
    """Represents a file tag with color metadata."""
    title: str
    color: str = "#808080"
    text_color: str = "#ffffff"

    def to_dict(self) -> dict:
        return {"title": self.title, "color": self.color, "textColor": self.text_color}


@dataclass
class FileEntry:
    """Represents a managed file with metadata."""
    name: str
    path: Path
    size: int = 0
    tags: list[Tag] = field(default_factory=list)

    @property
    def extension(self) -> str:
        return self.path.suffix.lstrip(".")

    def add_tag(self, tag: Tag) -> None:
        if tag not in self.tags:
            self.tags.append(tag)

    def has_tag(self, title: str) -> bool:
        return any(t.title == title for t in self.tags)


class FileManager:
    """Manages a collection of files with tagging support."""

    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self._files: dict[str, FileEntry] = {}

    def scan_directory(self, pattern: str = "*") -> list[FileEntry]:
        """Scan the base directory for files matching the pattern."""
        entries = []
        for path in self.base_path.glob(pattern):
            if path.is_file():
                entry = FileEntry(
                    name=path.name,
                    path=path,
                    size=path.stat().st_size,
                )
                self._files[path.name] = entry
                entries.append(entry)
        return sorted(entries, key=lambda e: e.name)

    def find_by_tag(self, tag_title: str) -> list[FileEntry]:
        """Find all files with a specific tag."""
        return [f for f in self._files.values() if f.has_tag(tag_title)]

    def find_by_extension(self, ext: str) -> list[FileEntry]:
        """Find all files with a specific extension."""
        return [f for f in self._files.values() if f.extension == ext]

    def export_metadata(self, output_path: Optional[str] = None) -> str:
        """Export file metadata as JSON."""
        data = {
            name: {
                "path": str(entry.path),
                "size": entry.size,
                "extension": entry.extension,
                "tags": [t.to_dict() for t in entry.tags],
            }
            for name, entry in self._files.items()
        }
        result = json.dumps(data, indent=2)
        if output_path:
            Path(output_path).write_text(result)
        return result

    @property
    def total_size(self) -> int:
        return sum(f.size for f in self._files.values())

    def __len__(self) -> int:
        return len(self._files)

    def __repr__(self) -> str:
        return f"FileManager(base='{self.base_path}', files={len(self)})"


# Example usage
if __name__ == "__main__":
    manager = FileManager("/home/user/documents")
    files = manager.scan_directory("*.md")

    important = Tag("important", "#ff0000")
    for f in files[:5]:
        f.add_tag(important)

    print(f"Scanned {len(manager)} files, total size: {manager.total_size:,} bytes")
    print(manager.export_metadata())
