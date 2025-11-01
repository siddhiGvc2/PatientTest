import { TestLevel } from "./types";

interface TestLevelTableProps {
  testLevels: TestLevel[];
}

export default function TestLevelTable({ testLevels }: TestLevelTableProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">TestLevels</h3>
      <table className="w-full border-collapse border border-[var(--border-color)] bg-[var(--card-bg)]">
        <thead>
          <tr className="bg-[var(--secondary-bg)]">
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">ID</th>
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">Level</th>
          </tr>
        </thead>
        <tbody>
          {testLevels.map(tl => (
            <tr key={tl.id} className="bg-[var(--card-bg)]">
              <td className="border border-[var(--border-color)] p-2 text-[var(--foreground)] text-center">{tl.id}</td>
              <td className="border border-[var(--border-color)] p-2 text-[var(--foreground)] text-center">{tl.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
