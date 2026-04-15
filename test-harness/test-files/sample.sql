-- Sample SQL file for testing the Text Editor extension
-- Demonstrates DDL, DML, and query features

CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL UNIQUE,
    color CHAR(7) DEFAULT '#808080',
    text_color CHAR(7) DEFAULT '#ffffff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    size BIGINT DEFAULT 0,
    extension VARCHAR(20),
    is_directory BOOLEAN DEFAULT FALSE,
    modified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS file_tags (
    file_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    tagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (file_id, tag_id),
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Insert sample tags
INSERT INTO tags (title, color, text_color) VALUES
    ('important', '#ff0000', '#ffffff'),
    ('todo', '#ffc107', '#000000'),
    ('done', '#4caf50', '#ffffff'),
    ('archived', '#9e9e9e', '#ffffff'),
    ('favorite', '#e91e63', '#ffffff');

-- Insert sample files
INSERT INTO files (name, path, size, extension, modified_at) VALUES
    ('readme.md', '/docs/readme.md', 2048, 'md', '2024-01-15 10:30:00'),
    ('photo.jpg', '/images/photo.jpg', 1048576, 'jpg', '2024-01-14 14:20:00'),
    ('report.pdf', '/docs/report.pdf', 524288, 'pdf', '2024-01-13 09:15:00'),
    ('config.json', '/settings/config.json', 512, 'json', '2024-01-12 16:45:00');

-- Complex query: files with their tags
SELECT
    f.name,
    f.extension,
    f.size,
    GROUP_CONCAT(t.title, ', ') AS tags,
    COUNT(t.id) AS tag_count
FROM files f
LEFT JOIN file_tags ft ON f.id = ft.file_id
LEFT JOIN tags t ON ft.tag_id = t.id
GROUP BY f.id
HAVING tag_count > 0
ORDER BY f.modified_at DESC;
