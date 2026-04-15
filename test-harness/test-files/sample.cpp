#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

class FileManager {
private:
    std::vector<std::string> files;
    std::string basePath;

public:
    FileManager(const std::string& path) : basePath(path) {}

    void addFile(const std::string& name) {
        files.push_back(name);
    }

    std::vector<std::string> search(const std::string& query) const {
        std::vector<std::string> results;
        for (const auto& file : files) {
            if (file.find(query) != std::string::npos) {
                results.push_back(file);
            }
        }
        return results;
    }

    size_t count() const { return files.size(); }
};

int main() {
    FileManager manager("/documents");
    manager.addFile("readme.md");
    manager.addFile("config.json");
    manager.addFile("photo.jpg");

    auto results = manager.search("readme");
    std::cout << "Found " << results.size() << " files" << std::endl;

    return 0;
}
