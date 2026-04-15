/**
 * Sample TypeScript file for testing the Text Editor extension.
 * Demonstrates interfaces, generics, enums, and type utilities.
 */

// Enums
enum FileType {
  Document = 'document',
  Image = 'image',
  Audio = 'audio',
  Video = 'video',
  Code = 'code',
}

// Interfaces
interface Tag {
  readonly id: string;
  title: string;
  color: string;
  textColor?: string;
}

interface FileEntry {
  id: string;
  name: string;
  path: string;
  size: number;
  type: FileType;
  tags: Tag[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  modifiedAt: Date;
}

// Generic repository pattern
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// Type utilities
type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'modifiedAt'>;
type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt'>>;

// Implementation
class FileRepository implements Repository<FileEntry> {
  private files = new Map<string, FileEntry>();

  async findById(id: string): Promise<FileEntry | null> {
    return this.files.get(id) ?? null;
  }

  async findAll(filter?: Partial<FileEntry>): Promise<FileEntry[]> {
    let results = [...this.files.values()];
    if (filter?.type) {
      results = results.filter((f) => f.type === filter.type);
    }
    if (filter?.name) {
      results = results.filter((f) =>
        f.name.toLowerCase().includes(filter.name!.toLowerCase())
      );
    }
    return results;
  }

  async save(entity: FileEntry): Promise<FileEntry> {
    this.files.set(entity.id, { ...entity, modifiedAt: new Date() });
    return entity;
  }

  async delete(id: string): Promise<boolean> {
    return this.files.delete(id);
  }

  async findByTag(tagTitle: string): Promise<FileEntry[]> {
    return [...this.files.values()].filter((f) =>
      f.tags.some((t) => t.title === tagTitle)
    );
  }

  async getStatistics(): Promise<{
    totalFiles: number;
    totalSize: number;
    byType: Record<FileType, number>;
  }> {
    const files = [...this.files.values()];
    const byType = Object.values(FileType).reduce(
      (acc, type) => ({
        ...acc,
        [type]: files.filter((f) => f.type === type).length,
      }),
      {} as Record<FileType, number>
    );

    return {
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      byType,
    };
  }
}

export { FileRepository, FileType };
export type { FileEntry, Tag, Repository, CreateInput, UpdateInput };
