import { useState } from "react";

interface AddImageLibraryFormProps {
  onAdd: (files: File[]) => Promise<void>;
}

export default function AddImageLibraryForm({ onAdd }: AddImageLibraryFormProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async () => {
    if (files.length === 0) return;
    await onAdd(files);
    setFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  return (
    <div className="bg-[var(--card-bg)] p-4 rounded shadow mb-6 border border-[var(--border-color)]">
      <h2 className="text-xl font-semibold mb-4">Add Images to Library</h2>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      />
      {files.length > 0 && (
        <div className="mb-2 text-sm text-[var(--foreground)]">
          {files.length} file{files.length > 1 ? 's' : ''} selected
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={files.length === 0}
        className="w-full bg-[var(--button-bg)] text-white p-2 rounded hover:bg-[var(--button-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add to Library
      </button>
    </div>
  );
}
