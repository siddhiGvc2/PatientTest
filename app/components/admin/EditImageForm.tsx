import { useState } from "react";
import { Image as ImageType, Screen, TestLevel } from "./types";

interface EditImageFormProps {
  image: ImageType;
  screens: Screen[];
  testLevels: TestLevel[];
  onUpdate: (image: ImageType) => Promise<void>;
  onCancel: () => void;
}

export default function EditImageForm({ image, screens, testLevels, onUpdate, onCancel }: EditImageFormProps) {
  const [url, setUrl] = useState(image.url);
  const [screenId, setScreenId] = useState(image.screenId);

  const handleSubmit = async () => {
    await onUpdate({ ...image, url, screenId });
  };

  return (
    <div className="bg-[var(--card-bg)] p-4 rounded shadow mb-6 border border-[var(--border-color)]">
      <h2 className="text-xl font-semibold mb-4">Edit Image</h2>
      <input
        type="text"
        placeholder="Image URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      />
      <select
        value={screenId}
        onChange={(e) => setScreenId(parseInt(e.target.value))}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      >
        <option value="">Select Screen</option>
        {screens.map(s => (
          <option key={s.id} value={s.id}>Screen {s.screenNumber} (Level {testLevels.find(tl => tl.id === s.testLevelId)?.level})</option>
        ))}
      </select>
      <button onClick={handleSubmit} className="bg-[var(--success-bg)] text-white p-2 rounded hover:bg-[var(--success-hover)] mr-2">
        Update Image
      </button>
      <button onClick={onCancel} className="bg-[var(--secondary-bg)] text-[var(--foreground)] p-2 rounded hover:bg-[var(--border-color)]">
        Cancel
      </button>
    </div>
  );
}
