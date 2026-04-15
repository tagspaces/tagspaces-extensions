package org.tagspaces.sample;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class FileManager {
    private final String basePath;
    private final List<FileEntry> files = new ArrayList<>();

    record FileEntry(String name, long size, List<String> tags) {}

    public FileManager(String basePath) {
        this.basePath = basePath;
    }

    public void addFile(String name, long size) {
        files.add(new FileEntry(name, size, new ArrayList<>()));
    }

    public List<FileEntry> findByExtension(String ext) {
        return files.stream()
            .filter(f -> f.name().endsWith("." + ext))
            .collect(Collectors.toList());
    }

    public long getTotalSize() {
        return files.stream().mapToLong(FileEntry::size).sum();
    }

    public static void main(String[] args) {
        var manager = new FileManager("/documents");
        manager.addFile("readme.md", 2048);
        manager.addFile("photo.jpg", 1048576);
        manager.addFile("config.json", 512);

        var mdFiles = manager.findByExtension("md");
        System.out.printf("Found %d markdown files%n", mdFiles.size());
        System.out.printf("Total size: %,d bytes%n", manager.getTotalSize());
    }
}
