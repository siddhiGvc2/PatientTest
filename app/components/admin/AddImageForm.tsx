import { useState, useEffect } from "react";
import Select, { SingleValue } from 'react-select';
import { Screen, TestLevel, ImageLibrary } from "./types";

interface ImageOption {
  value: number;
  label: React.ReactNode;
}

interface AddImageFormProps {
  screens: Screen[];
  testLevels: TestLevel[];
  imageLibraries: ImageLibrary[];
  onAdd: (file: File | null, screenId: number, imageLibraryId?: number) => Promise<void>;
  initialScreenId?: number;
}

export default function AddImageForm({ screens, testLevels, imageLibraries, onAdd, initialScreenId }: AddImageFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [screenId, setScreenId] = useState(initialScreenId ? initialScreenId.toString() : "");
  const [imageLibraryId, setImageLibraryId] = useState<number | null>(null);
  const [useLibraryImage, setUseLibraryImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialScreenId) {
      setScreenId(initialScreenId.toString());
    }
  }, [initialScreenId]);

  const handleSubmit = async () => {
    if (!screenId) return;
    if (useLibraryImage && !imageLibraryId) return;
    if (!useLibraryImage && !file) return;

    setIsLoading(true);
    try {
      await onAdd(useLibraryImage ? null : file, parseInt(screenId), useLibraryImage && imageLibraryId ? imageLibraryId : undefined);
      setFile(null);
      setScreenId("");
      setImageLibraryId(null);
      setUseLibraryImage(false);
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
      <h2 className="text-xl font-semibold mb-4">Add Image</h2>

      <div className="mb-4">
        <label className="flex items-center mb-2">
          <input
            type="radio"
            name="imageSource"
            checked={!useLibraryImage}
            onChange={() => {
              setUseLibraryImage(false);
              setImageLibraryId(null);
            }}
            className="mr-2"
          />
          Upload New Image
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="imageSource"
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
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
        />
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

      {initialScreenId ? (
        <div className="mb-2">
          <label className="block mb-2 font-medium">Screen:</label>
          <div className="p-2 bg-gray-100 rounded">
            Screen {screens.find(s => s.id === initialScreenId)?.screenNumber} (Level {testLevels.find(tl => tl.id === screens.find(s => s.id === initialScreenId)?.testLevelId)?.level})
          </div>
        </div>
      ) : (
        <select
          value={screenId}
          onChange={(e) => setScreenId(e.target.value)}
          className="w-full p-2 border border-[var(--border-color)] rounded mb-2 bg-[var(--card-bg)] text-[var(--foreground)]"
        >
          <option value="">Select Screen</option>
          {screens.map(s => (
            <option key={s.id} value={s.id}>Screen {s.screenNumber} (Level {testLevels.find(tl => tl.id === s.testLevelId)?.level})</option>
          ))}
        </select>
      )}
      <button
        onClick={handleSubmit}
        disabled={!screenId || (!useLibraryImage && !file) || (useLibraryImage && !imageLibraryId) || isLoading}
        className="w-full bg-[var(--button-bg)] text-white p-2 rounded hover:bg-[var(--button-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding...
          </>
        ) : (
          "Add Image"
        )}
      </button>
    </div>
  );
}
