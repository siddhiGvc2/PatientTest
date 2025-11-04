import { ImageLibrary } from "./types";

interface ImageLibraryTableProps {
  imageLibraries: ImageLibrary[];
  onDelete: (id: number) => void;
}

export default function ImageLibraryTable({ imageLibraries, onDelete }: ImageLibraryTableProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Image Library</h3>
      <table className="w-full border-collapse border border-[var(--border-color)] bg-[var(--card-bg)]">
        <thead>
          <tr className="bg-[var(--secondary-bg)]">
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">ID</th>
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">Image</th>
            <th className="border border-[var(--border-color)] p-2 text-[var(--foreground)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {imageLibraries.map(i => (
            <tr key={i.id} className="bg-[var(--card-bg)]">
              <td className="border border-[var(--border-color)] p-2 text-[var(--foreground)] text-center">{i.id}</td>
              <td className="border border-[var(--border-color)] p-2 text-center">
                <img src={i.url} width={50} height={50} alt="" className="object-cover rounded" />
              </td>
              <td className="border border-[var(--border-color)] p-2 text-center">
                <button onClick={() => onDelete(i.id)} className="bg-[var(--danger-bg)] text-white px-2 py-1 rounded hover:bg-[var(--danger-hover)]">
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
