import { Screen, TestLevel } from "./types";

interface ScreenTableProps {
  screens: Screen[];
  testLevels: TestLevel[];
}

export default function ScreenTable({ screens, testLevels }: ScreenTableProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Screens</h3>
      <table className="w-full border-collapse border border-[var(--border-color)] bg-[var(--card-bg)]">
        <thead>
          <tr className="bg-[var(--secondary-bg)]">
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">ID</th>
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">Screen Number</th>
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">TestLevel</th>
          </tr>
        </thead>
        <tbody>
          {screens.map(s => (
            <tr key={s.id} className="bg-[var(--card-bg)]">
              <td className="border border-[var(--border-color)] p-2 text-[var(--foreground)] text-center">{s.id}</td>
              <td className="border border-[var(--border-color)] p-2 text-[var(--foreground)] text-center">{s.screenNumber}</td>
              <td className="border border-[var(--border-color)] p-2 text-[var(--foreground)] text-center">{testLevels.find(tl => tl.id === s.testLevelId)?.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
