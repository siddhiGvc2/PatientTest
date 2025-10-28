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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const fetchTestLevel = async () => {
    try {
      const res = await fetch('/api/test-level/1');
      if (res.ok) {
        const data = await res.json();
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

  useEffect(() => {
    fetchTestLevel();
  }, []);

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
          <h3 className="text-xl font-semibold mb-4">{question.text}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            {question.images.map((image, index) => {
              const labels = ['A', 'B', 'C', 'D'];
              return (
                <div key={image.id} className="bg-white p-4 rounded-lg shadow-md relative">
                  <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 rounded text-sm font-bold">
                    {labels[index]}
                  </div>
                  <img src={image.url} alt={`Image ${image.id}`} className="w-full h-48 object-cover" />
                </div>
              );
            })}
          </div>
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Options:</h4>
            <div className="space-y-2">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`block w-full text-left p-2 border rounded ${
                    selectedOption === option.id
                      ? 'bg-blue-200 border-blue-500'
                      : 'bg-white border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>
            <div style={{width:"100%",display:"flex"}}>
            {selectedOption && (
              <button
                onClick={() => setShowAnswer(true)}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Submit Answer
              </button>
            )}
            {showAnswer && question.answer && (
              <p className={`mt-6 ml-4 text-md ${selectedOption === question.answer.id ? 'text-green-600' : 'text-red-600'}`}>
                {selectedOption === question.answer.id ? 'Correct!' : `Incorrect. Correct Answer: ${question.answer.text}`}
              </p>
            )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
