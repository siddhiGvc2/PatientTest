import { useState } from "react";
import { TestLevel } from "./types";

interface AddScreenFormProps {
  testLevels: TestLevel[];
  onAdd: (screenNumber: number, testLevelId: number) => Promise<void>;
}

export default function AddScreenForm({ testLevels, onAdd }: AddScreenFormProps) {
  const [screenNumber, setScreenNumber] = useState("");
  const [testLevelId, setTestLevelId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!screenNumber || !testLevelId) return;
    setIsLoading(true);
    try {
      await onAdd(parseInt(screenNumber), parseInt(testLevelId));
      setScreenNumber("");
      setTestLevelId("");
    } finally {
      setIsLoading(false);
    }
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
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-[var(--button-bg)] text-white p-2 rounded hover:bg-[var(--button-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding...
          </>
        ) : (
          "Add Screen"
        )}
      </button>
    </div>
  );
}
