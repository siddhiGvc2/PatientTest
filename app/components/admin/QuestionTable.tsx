import { Question, Screen } from "./types";

interface QuestionTableProps {
  questions: Question[];
  screens: Screen[];
  onEdit: (question: Question) => void;
  onDelete: (id: number) => void;
}

export default function QuestionTable({ questions, screens, onEdit, onDelete }: QuestionTableProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Questions</h3>
      <table className="w-full border-collapse border border-[var(--border-color)] bg-[var(--card-bg)]">
        <thead>
          <tr className="bg-[var(--secondary-bg)]">
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">ID</th>
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">Text</th>
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">Screen</th>
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">Answer Image ID</th>
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map(q => (
            <tr key={q.id} className="bg-[var(--card-bg)]">
              <td className="border border-[var(--border-color)] p-2 text-[var(--foreground)] text-center">{q.id}</td>
              <td className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">{q.text}</td>
              <td className="border border-[var(--border-color)] p-2 text-[var(--foreground)] text-center">{screens.find(s => s.id === q.screenId)?.screenNumber}</td>
              <td className="border border-[var(--border-color)] p-2 text-[var(--foreground)] text-center">{q.answerImageId !== undefined ? q.answerImageId : 'N/A'}</td>
              <td className="border border-[var(--border-color)] p-2 text-center">
                <button onClick={() => onEdit(q)} className="bg-[var(--danger-bg)] text-white px-2 py-1 rounded hover:bg-[var(--danger-hover)] mr-1">
                  Edit
                </button>
                <button onClick={() => onDelete(q.id)} className="bg-[var(--danger-bg)] text-white px-2 py-1 rounded hover:bg-[var(--danger-hover)]">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
