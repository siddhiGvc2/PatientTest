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
         

            {question.images.map((image) => (
              <div key={image.id} className="bg-white p-4 rounded-lg shadow-md">
                <img src={image.url} alt={`Image ${image.id}`} className="w-full h-48 object-cover" />
              </div>
            ))}
          </div>
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Options:</h4>
            <ul className="list-disc list-inside">
              {question.options.map((option) => (
                <li key={option.id} className={question.answer?.id === option.id ? 'text-green-600 font-bold' : ''}>
                  {option.text}
                </li>
              ))}
            </ul>
            {question.answer && (
              <p className="text-sm text-gray-600 mt-2">Correct Answer: {question.answer.text}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
