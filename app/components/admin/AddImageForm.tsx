import { useState } from "react";
import { Screen, TestLevel } from "./types";

interface AddImageFormProps {
  screens: Screen[];
  testLevels: TestLevel[];
  onAdd: (file: File, screenId: number) => Promise<void>;
}

export default function AddImageForm({ screens, testLevels, onAdd }: AddImageFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [screenId, setScreenId] = useState("");

  const handleSubmit = async () => {
    if (!file || !screenId) return;
    await onAdd(file, parseInt(screenId));
    setFile(null);
    setScreenId("");
  };

  return (
    <div className="bg-[var(--card-bg)] p-4 rounded shadow mb-6 border border-[var(--border-color)]">
      <h2 className="text-xl font-semibold mb-4">Add Image</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      />
      <select
        value={screenId}
        onChange={(e) => setScreenId(e.target.value)}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      >
        <option value="">Select Screen</option>
        {screens.map(s => (
          <option key={s.id} value={s.id}>Screen {s.screenNumber} (Level {testLevels.find(tl => tl.id === s.testLevelId)?.level})</option>
        ))}
      </select>
      <button onClick={handleSubmit} className="w-full bg-[var(--button-bg)] text-white p-2 rounded hover:bg-[var(--button-hover)]">
        Add Image
      </button>
    </div>
  );
}
