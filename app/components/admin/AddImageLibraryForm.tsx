import { useState } from "react";

interface AddImageLibraryFormProps {
  onAdd: (file: File) => Promise<void>;
}

export default function AddImageLibraryForm({ onAdd }: AddImageLibraryFormProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    await onAdd(file);
    setFile(null);
  };

  return (
    <div className="bg-[var(--card-bg)] p-4 rounded shadow mb-6 border border-[var(--border-color)]">
      <h2 className="text-xl font-semibold mb-4">Add Image to Library</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      />
      <button onClick={handleSubmit} className="w-full bg-[var(--button-bg)] text-white p-2 rounded hover:bg-[var(--button-hover)]">
        Add to Library
      </button>
    </div>
  );
}
