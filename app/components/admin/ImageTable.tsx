import { Image as ImageType, Screen, TestLevel } from "./types";

interface ImageTableProps {
  images: ImageType[];
  testLevels: TestLevel[];
  screens: Screen[];
  onEdit: (image: ImageType) => void;
  onDelete: (id: number) => void;
}

export default function ImageTable({ images, testLevels, screens, onEdit, onDelete }: ImageTableProps) {
  const handleDelete = (image: ImageType) => {
    if (window.confirm(`Are you sure you want to delete image ${image.id}?`)) {
      onDelete(image.id);
    }
  };

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
                <button onClick={() => onEdit(i)} className="bg-[var(--success-bg)] text-white px-2 py-1 rounded hover:bg-[var(--success-hover)] mr-2">
                  Edit
                </button>
                <button onClick={() => handleDelete(i)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
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
