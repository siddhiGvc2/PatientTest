import { useState } from "react";

interface AddTestLevelFormProps {
  onAdd: (level: number) => Promise<void>;
}

export default function AddTestLevelForm({ onAdd }: AddTestLevelFormProps) {
  const [level, setLevel] = useState("");

  const handleSubmit = async () => {
    if (!level) return;
    await onAdd(parseInt(level));
    setLevel("");
  };

  return (
    <div className="bg-[var(--card-bg)] p-4 rounded shadow mb-6 border border-[var(--border-color)]">
      <h2 className="text-xl font-semibold mb-4">Add TestLevel</h2>
      <input
        type="number"
        placeholder="Level"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      />
      <button onClick={handleSubmit} className="w-full bg-[var(--button-bg)] text-white p-2 rounded hover:bg-[var(--button-hover)]">
        Add TestLevel
      </button>
    </div>
  );
}
