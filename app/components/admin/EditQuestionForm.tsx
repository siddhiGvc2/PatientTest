import { useState, useEffect } from "react";
import { Question, Screen, Image, NewQuestionState, TestLevel } from "./types";
import AnswerImageSelect from "../Image-Select";

interface EditQuestionFormProps {
  question: Question;
  screens: Screen[];
  images: Image[];
  testLevels: TestLevel[];
  onUpdate: (question: Question, data: NewQuestionState) => Promise<void>;
  onCancel: () => void;
}

export default function EditQuestionForm({ question, screens, images, testLevels, onUpdate, onCancel }: EditQuestionFormProps) {
  const [data, setData] = useState<NewQuestionState>({
    text: question.text,
    screenId: question.screenId.toString(),
    answerImageId: question.answerImageId,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onUpdate(question, data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--card-bg)] p-4 rounded shadow mb-6 border border-[var(--border-color)]">
      <h2 className="text-xl font-semibold mb-4">Edit Question</h2>
      <input
        type="text"
        placeholder="Question Text"
        value={data.text}
        onChange={(e) => setData({ ...data, text: e.target.value })}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      />
      <select
        value={data.screenId}
        onChange={(e) => setData({ ...data, screenId: e.target.value })}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      >
        <option value="">Select Screen</option>
        {screens.map(s => (
          <option key={s.id} value={s.id}>Screen {s.screenNumber} (Level {testLevels.find(tl => tl.id === s.testLevelId)?.level})</option>
        ))}
      </select>
      <AnswerImageSelect
        images={images}
        newQuestion={data}
        setNewQuestion={setData}
      />
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="bg-[var(--success-bg)] text-white p-2 rounded hover:bg-[var(--success-hover)] mr-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating...
          </>
        ) : (
          "Update Question"
        )}
      </button>
      <button onClick={onCancel} className="bg-[var(--secondary-bg)] text-[var(--foreground)] p-2 rounded hover:bg-[var(--border-color)]">
        Cancel
      </button>
    </div>
  );
}
