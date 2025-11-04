import { useState } from "react";
import Select, { SingleValue } from 'react-select';
import { Image as ImageType, Screen, TestLevel, ImageLibrary } from "./types";

interface ImageOption {
  value: number;
  label: React.ReactNode;
}

interface EditImageFormProps {
  image: ImageType;
  screens: Screen[];
  testLevels: TestLevel[];
  imageLibraries: ImageLibrary[];
  onUpdate: (image: ImageType, file?: File, imageLibraryId?: number) => Promise<void>;
  onCancel: () => void;
}

export default function EditImageForm({ image, screens, testLevels, imageLibraries, onUpdate, onCancel }: EditImageFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [screenId, setScreenId] = useState(image.screenId);
  const [imageLibraryId, setImageLibraryId] = useState<number | null>(null);
  const [useLibraryImage, setUseLibraryImage] = useState(false);

  const handleSubmit = async () => {
    await onUpdate({ ...image, screenId }, useLibraryImage ? undefined : file || undefined, useLibraryImage && imageLibraryId ? imageLibraryId : undefined);
  };

  const imageOptions: ImageOption[] = imageLibraries.map((il) => ({
    value: il.id,
    label: (
      <div className="flex items-center gap-2">
        <img
          src={il.url}
          alt={`Image ${il.id}`}
          width={50}
          height={50}
          className="rounded"
        />
        <span>Image {il.id}</span>
      </div>
    ),
  }));

  const handleImageSelectChange = (selected: SingleValue<ImageOption>) => {
    setImageLibraryId(selected ? selected.value : null);
  };

  return (
    <div className="bg-[var(--card-bg)] p-4 rounded shadow mb-6 border border-[var(--border-color)]">
      <h2 className="text-xl font-semibold mb-4">Edit Image</h2>

      <div className="mb-4">
        <label className="flex items-center mb-2">
          <input
            type="radio"
            name="editImageSource"
            checked={!useLibraryImage}
            onChange={() => {
              setUseLibraryImage(false);
              setImageLibraryId(null);
            }}
            className="mr-2"
          />
          Upload New Image
        </label>
        <label className="flex items-center mb-2">
          <input
            type="radio"
            name="editImageSource"
            checked={useLibraryImage}
            onChange={() => {
              setUseLibraryImage(true);
              setFile(null);
            }}
            className="mr-2"
          />
          Choose from Image Library
        </label>
      </div>

      {!useLibraryImage ? (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
          />
          <p className="text-sm text-gray-500 mb-2">Leave empty to keep current image</p>
        </>
      ) : (
        <div className="mb-2">
          <label className="block mb-2 font-medium">Select Image from Library:</label>
          <Select
            options={imageOptions}
            value={imageOptions.find(
              (opt) => opt.value === imageLibraryId
            )}
            onChange={handleImageSelectChange}
            placeholder="Select Image from Library"
            classNamePrefix="select"
            styles={{
              option: (base) => ({
                ...base,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }),
              singleValue: (base) => ({
                ...base,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }),
              control: (base) => ({
                ...base,
                borderColor: '#d1d5db', // Tailwind gray-300
                boxShadow: 'none',
                '&:hover': { borderColor: '#60a5fa' }, // Tailwind blue-400
              }),
            }}
          />
        </div>
      )}

      <select
        value={screenId}
        onChange={(e) => setScreenId(parseInt(e.target.value))}
        className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
      >
        <option value="">Select Screen</option>
        {screens.map(s => (
          <option key={s.id} value={s.id}>Screen {s.screenNumber} (Level {testLevels.find(tl => tl.id === s.testLevelId)?.level})</option>
        ))}
      </select>
      <button onClick={handleSubmit} className="bg-[var(--success-bg)] text-white p-2 rounded hover:bg-[var(--success-hover)] mr-2">
        Update Image
      </button>
      <button onClick={onCancel} className="bg-[var(--secondary-bg)] text-[var(--foreground)] p-2 rounded hover:bg-[var(--border-color)]">
        Cancel
      </button>
    </div>
  );
}
