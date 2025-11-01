import { useState } from "react";
import { Screen, Image, NewQuestionState } from "./types";
import { TestLevel } from "./types";
import AnswerImageSelect from "../Image-Select";

interface AddQuestionFormProps {
  screens: Screen[];
  images: Image[];
  testLevels: TestLevel[];
  onAdd: (question: NewQuestionState) => Promise<void>;
}

export default function AddQuestionForm({ screens, images, testLevels, onAdd }: AddQuestionFormProps) {
  const [question, setQuestion] = useState<NewQuestionState>({ text: "", screenId: "", answerImageId: "" });

  const handleSubmit = async () => {
    if (!question.text || !question.screenId) return;
    await onAdd(question);
    setQuestion({ text: "", screenId: "", answerImageId: "" });
  };

  return (
    <div className="bg-[var(--card-bg)] p-4 rounded shadow mb-6 border border-[var(--border-color)]">
      <h2 className="text-xl font-semibold mb-4">Add Question</h2>
      <input
        type="text"
        placeholder="Question Text"
        value={question.text}
        onChange={(e) => setQuestion({ ...question, text: e.target.value })}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      />
      <select
        value={question.screenId}
        onChange={(e) => setQuestion({ ...question, screenId: e.target.value })}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      >
        <option value="">Select Screen</option>
        {screens.map(s => (
          <option key={s.id} value={s.id}>Screen {s.screenNumber} (Level {testLevels.find(tl => tl.id === s.testLevelId)?.level})</option>
        ))}
      </select>
      <AnswerImageSelect
        images={images}
        newQuestion={question}
        setNewQuestion={setQuestion}
      />
      <button onClick={handleSubmit} className="w-full bg-[var(--button-bg)] text-white p-2 rounded hover:bg-[var(--button-hover)]">
        Add Question
      </button>
    </div>
  );
}
