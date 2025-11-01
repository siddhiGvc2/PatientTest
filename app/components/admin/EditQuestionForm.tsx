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

  const handleSubmit = async () => {
    await onUpdate(question, data);
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
      <button onClick={handleSubmit} className="bg-[var(--success-bg)] text-white p-2 rounded hover:bg-[var(--success-hover)] mr-2">
        Update Question
      </button>
      <button onClick={onCancel} className="bg-[var(--secondary-bg)] text-[var(--foreground)] p-2 rounded hover:bg-[var(--border-color)]">
        Cancel
      </button>
    </div>
  );
}
