import React from 'react';
import Select, { SingleValue } from 'react-select';

interface ImageData {
  id: string | number;
  url: string;
}

interface NewQuestionState {
  text: string;
  screenId: string;
  answerImageId: string | number | '';
}

interface ImageOption {
  value: string | number;
  label: React.ReactNode;
}

interface AnswerImageSelectProps {
  images: ImageData[];
  newQuestion: NewQuestionState;
  setNewQuestion: React.Dispatch<React.SetStateAction<NewQuestionState>>;
}

const AnswerImageSelect: React.FC<AnswerImageSelectProps> = ({
  images,
  newQuestion,
  setNewQuestion,
}) => {
  const options: ImageOption[] = images.map((img) => ({
    value: img.id,
    label: (
      <div className="flex items-center gap-2">
        <img
          src={img.url}
          alt={`Option ${img.id}`}
          width={50}
          height={50}
          className="rounded"
        />
        <span>{img.id}</span>
      </div>
    ),
  }));

  const handleChange = (selected: SingleValue<ImageOption>) => {
    console.log(selected? selected.value : 'Not found');
    setNewQuestion({
      ...newQuestion,
      answerImageId: selected ? selected.value : '',
    });
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium">Select Answer Image:</label>
      <Select
        options={options}
        value={options.find(
          (opt) => opt.value === newQuestion.answerImageId
        )}
        onChange={handleChange}
        placeholder="Select Answer Image"
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
  );
};

export default AnswerImageSelect;
