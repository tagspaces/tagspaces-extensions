# Sample Ruby file for testing the Text Editor extension

class FileEntry
  attr_accessor :name, :size, :tags

  def initialize(name, size = 0)
    @name = name
    @size = size
    @tags = []
  end

  def extension
    File.extname(@name).delete('.')
  end

  def tagged?(tag)
    @tags.include?(tag)
  end

  def to_s
    "#{@name} (#{format_size})"
  end

  private

  def format_size
    units = ['B', 'KB', 'MB', 'GB']
    s = @size.to_f
    units.each do |unit|
      return "#{s.round(1)} #{unit}" if s < 1024
      s /= 1024
    end
    "#{s.round(1)} TB"
  end
end

class FileManager
  def initialize(base_path)
    @base_path = base_path
    @files = []
  end

  def add(name, size = 0)
    @files << FileEntry.new(name, size)
  end

  def find_by_tag(tag)
    @files.select { |f| f.tagged?(tag) }
  end

  def find_by_ext(ext)
    @files.select { |f| f.extension == ext }
  end

  def total_size
    @files.sum(&:size)
  end
end

# Usage
manager = FileManager.new('/documents')
manager.add('readme.md', 2048)
manager.add('photo.jpg', 1_048_576)
puts "Total: #{manager.total_size} bytes"
