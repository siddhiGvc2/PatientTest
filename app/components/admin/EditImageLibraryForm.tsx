import { useState } from "react";
import { ImageLibrary } from "./types";

interface EditImageLibraryFormProps {
  imageLibrary: ImageLibrary;
  onUpdate: (imageLibrary: ImageLibrary, file?: File) => Promise<void>;
  onCancel: () => void;
}

export default function EditImageLibraryForm({ imageLibrary, onUpdate, onCancel }: EditImageLibraryFormProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    await onUpdate(imageLibrary, file || undefined);
  };

  return (
    <div className="bg-[var(--card-bg)] p-4 rounded shadow mb-6 border border-[var(--border-color)]">
      <h2 className="text-xl font-semibold mb-4">Edit Image Library Item</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      />
      <p className="text-sm text-gray-500 mb-2">Leave empty to keep current image</p>
      <button onClick={handleSubmit} className="bg-[var(--success-bg)] text-white p-2 rounded hover:bg-[var(--success-hover)] mr-2">
        Update Item
      </button>
      <button onClick={onCancel} className="bg-[var(--secondary-bg)] text-[var(--foreground)] p-2 rounded hover:bg-[var(--border-color)]">
        Cancel
      </button>
    </div>
  );
}
