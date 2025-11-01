import { Image as ImageType, Screen, TestLevel } from "./types";

interface ImageTableProps {
  images: ImageType[];
  testLevels: TestLevel[];
  screens: Screen[];
  onEdit: (image: ImageType) => void;
}

export default function ImageTable({ images, testLevels, screens, onEdit }: ImageTableProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Images</h3>
      <table className="w-full border-collapse border border-[var(--border-color)] bg-[var(--card-bg)]">
        <thead>
          <tr className="bg-[var(--secondary-bg)]">
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">ID</th>
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">Image</th>
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">Screen</th>
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {images.map(i => (
            <tr key={i.id} className="bg-[var(--card-bg)]">
              <td className="border border-[var(--border-color)] p-2 text-[var(--foreground)] text-center">{i.id}</td>
              <td className="border border-[var(--border-color)] p-2 text-center">
                <img src={i.url} width={50} height={50} alt="" className="object-cover rounded" />
              </td>
              <td className="border border-[var(--border-color)] p-2 text-[var(--foreground)] text-center">
                {screens.find(s => s.id === i.screenId)?.screenNumber} (Level {testLevels.find(tl => tl.id === screens.find(s => s.id === i.screenId)?.testLevelId)?.level})
              </td>
              <td className="border border-[var(--border-color)] p-2 text-center">
                <button onClick={() => onEdit(i)} className="bg-[var(--success-bg)] text-white px-2 py-1 rounded hover:bg-[var(--success-hover)]">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
