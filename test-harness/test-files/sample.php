<?php
/**
 * Sample PHP file for testing the Text Editor extension.
 */

class FileEntry {
    public function __construct(
        public readonly string $name,
        public readonly int $size = 0,
        private array $tags = [],
    ) {}

    public function getExtension(): string {
        return pathinfo($this->name, PATHINFO_EXTENSION);
    }

    public function addTag(string $tag): void {
        if (!in_array($tag, $this->tags)) {
            $this->tags[] = $tag;
        }
    }

    public function hasTag(string $tag): bool {
        return in_array($tag, $this->tags);
    }

    public function getTags(): array {
        return $this->tags;
    }
}

class FileManager {
    /** @var FileEntry[] */
    private array $files = [];

    public function __construct(private string $basePath) {}

    public function add(string $name, int $size = 0): void {
        $this->files[] = new FileEntry($name, $size);
    }

    public function findByExtension(string $ext): array {
        return array_filter(
            $this->files,
            fn(FileEntry $f) => $f->getExtension() === $ext
        );
    }

    public function getTotalSize(): int {
        return array_sum(array_map(
            fn(FileEntry $f) => $f->size,
            $this->files
        ));
    }

    public function count(): int {
        return count($this->files);
    }
}

// Usage
$manager = new FileManager('/documents');
$manager->add('readme.md', 2048);
$manager->add('photo.jpg', 1048576);
$manager->add('config.json', 512);

$mdFiles = $manager->findByExtension('md');
echo sprintf("Found %d markdown files\n", count($mdFiles));
echo sprintf("Total: %s bytes\n", number_format($manager->getTotalSize()));
