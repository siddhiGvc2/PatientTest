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
  const [useLibraryImage, setUseLibraryImage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onUpdate({ ...image, screenId }, useLibraryImage ? undefined : file || undefined, useLibraryImage && imageLibraryId ? imageLibraryId : undefined);
    } finally {
      setIsLoading(false);
    }
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
            checked={useLibraryImage}
            onChange={() => {
              setUseLibraryImage(true);
              setFile(null);
            }}
            className="mr-2"
          />
          Choose from Image Library
        </label>
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
          "Update Image"
        )}
      </button>
      <button onClick={onCancel} className="bg-[var(--secondary-bg)] text-[var(--foreground)] p-2 rounded hover:bg-[var(--border-color)]">
        Cancel
      </button>
    </div>
  );
}
