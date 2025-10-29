"use client";

import { useEffect, useState } from "react";

interface Option {
  id: number;
  text: string;
}

interface Image {
  id: number;
  url: string;
}

interface Question {
  id: number;
  text: string;
  images: Image[];
  options: Option[];
  answer: Option | null;
}

interface TestLevel {
  id: number;
  level: number;
  questions: Question[];
}

export default function TestLevel() {
  const [testLevel, setTestLevel] = useState<TestLevel | null>(null);
  const [allOptions, setAllOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | null>>({});
  const [showAnswer, setShowAnswer] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);

  const fetchTestLevel = async (level: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/test-level/${level}`);
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        setTestLevel(data);
      } else {
        setError('Failed to fetch test level');
      }
    } catch (err) {
      setError('Error fetching test level');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOptions = async () => {
    try {
      const res = await fetch('/api/options');
      if (res.ok) {
        const data = await res.json();
        setAllOptions(data.options);
      } else {
        console.error('Failed to fetch options');
      }
    } catch (err) {
      console.error('Error fetching options');
    }
  };

  useEffect(() => {
    fetchTestLevel(currentLevel);
    fetchAllOptions();
  }, [currentLevel]);

  if (loading) {
    return <div className="text-center">Loading test level...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!testLevel) {
    return <div className="text-center">No test level found.</div>;
  }

  return (
    <div className="w-full p-6">
      <h2 className="text-2xl font-bold mb-4">Test Level {testLevel.level}</h2>
      {testLevel.questions.map((question) => (
        <div key={question.id} className="mb-8">
         
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
  {question.images.map((image, index) => {
    const labels = ['A', 'B', 'C', 'D'];
    const correspondingOption = question.options[index]; // match image with option

    if (!correspondingOption) return null;

    return (
      <div
        key={image.id}
        onClick={() => setSelectedOptions(prev => ({ ...prev, [question.id]: correspondingOption.id }))} // select option on image click
        className={`bg-white p-4 rounded-lg shadow-md relative cursor-pointer transition-all ${
          selectedOptions[question.id] === correspondingOption.id
            ? 'ring-4 ring-blue-400'
            : 'hover:shadow-lg'
        }`}
      >
        <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 rounded text-sm font-bold">
          {labels[index] || ''}
        </div>
        <img
          src={image.url}
          alt={`Image ${image.id}`}
          className="w-full h-48 object-cover rounded-md"
        />
      </div>
    );
  })}
</div>
      <h3 className="text-xl font-semibold mb-4">{question.text}</h3>
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Options:</h4>
            <div className="space-y-2">
              {allOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOptions(prev => ({ ...prev, [question.id]: option.id }))}
                  className={`block w-full text-left p-2 border rounded ${
                    selectedOptions[question.id] === option.id
                      ? 'bg-blue-200 border-blue-500'
                      : 'bg-white border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>
            <div style={{width:"100%",display:"flex"}}>
           
            {showAnswer && question.answer && (
              <p className={`mt-6 ml-4 text-md ${selectedOptions[question.id] === question.answer.id ? 'text-green-600' : 'text-red-600'}`}>
                {selectedOptions[question.id] === question.answer.id ? 'Correct!' : `Incorrect. Correct Answer: ${question.answer.text}`}
              </p>
            )}
            </div>
          </div>
        </div>
      ))}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            setCurrentLevel(currentLevel + 1);
            setSelectedOptions({});
            setShowAnswer(false);
          }}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Next Level
        </button>
      </div>
    </div>
  );
}
