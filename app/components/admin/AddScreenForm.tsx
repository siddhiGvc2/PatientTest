import { useState } from "react";
import { TestLevel } from "./types";

interface AddScreenFormProps {
  testLevels: TestLevel[];
  onAdd: (screenNumber: number, testLevelId: number) => Promise<void>;
}

export default function AddScreenForm({ testLevels, onAdd }: AddScreenFormProps) {
  const [screenNumber, setScreenNumber] = useState("");
  const [testLevelId, setTestLevelId] = useState("");

  const handleSubmit = async () => {
    if (!screenNumber || !testLevelId) return;
    await onAdd(parseInt(screenNumber), parseInt(testLevelId));
    setScreenNumber("");
    setTestLevelId("");
  };

  return (
    <div className="bg-[var(--card-bg)] p-4 rounded shadow mb-6 border border-[var(--border-color)]">
      <h2 className="text-xl font-semibold mb-4">Add Screen</h2>
      <input
        type="number"
        placeholder="Screen Number"
        value={screenNumber}
        onChange={(e) => setScreenNumber(e.target.value)}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      />
      <select
        value={testLevelId}
        onChange={(e) => setTestLevelId(e.target.value)}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      >
        <option value="">Select TestLevel</option>
        {testLevels.map(tl => (
          <option key={tl.id} value={tl.id}>{tl.level}</option>
        ))}
      </select>
      <button onClick={handleSubmit} className="w-full bg-[var(--button-bg)] text-white p-2 rounded hover:bg-[var(--button-hover)]">
        Add Screen
      </button>
    </div>
  );
}
