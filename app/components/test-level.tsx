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
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testEnded,setTestEnded]=useState(false);

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
        setTestEnded(true);
        // setError('Failed to fetch test level');
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
    setCurrentQuestionIndex(0);
  }, [currentLevel]);

  useEffect(() => {
    if (testLevel && selectedOptions[testLevel.questions[currentQuestionIndex].id] !== undefined) {
      const timer = setTimeout(() => {
        if (currentQuestionIndex < testLevel.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          setCurrentLevel(currentLevel + 1);
          setSelectedOptions({});
        }
      }, 1000); // 3 seconds delay
      return () => clearTimeout(timer);
    }
  }, [selectedOptions, currentQuestionIndex, testLevel, currentLevel]);

  if (loading) {
    return <div className="text-center">Loading test level...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!testLevel) {
    return <div className="text-center">No test level found.</div>;
  }

  if (testEnded) {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 text-center transform transition-all duration-500 hover:scale-105">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          🎉 Test Completed!
        </h2>
        <p className="text-gray-600 mb-6">
          Great job! You’ve reached the end of the test.
        </p>
        <button
          onClick={() => {
            setCurrentLevel(1);
            setSelectedOptions({});
            setTestEnded(false);
          }}
          className="px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          🔁 Retake Test
        </button>
      </div>
    </div>
  );
}


  const currentQuestion = testLevel.questions[currentQuestionIndex];
  const isAnswered = selectedOptions[currentQuestion.id] !== undefined;

  return (
    <div className="w-full p-6">
      <h2 className="text-2xl font-bold mb-4">Test Level {testLevel.level}</h2>
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          {testLevel.questions[0].images.map((image, index) => {
            const labels = ['A', 'B', 'C', 'D'];
            const correspondingOption = currentQuestion.options[index]; // match image with option

            return (
              <div
                key={image.id}
                onClick={() => setSelectedOptions(prev => ({ ...prev, [currentQuestion.id]: index+1 }))} // select option on image click
                className={`bg-white p-4 rounded-lg shadow-md relative cursor-pointer  transition-all ${
                  selectedOptions[currentQuestion.id] === index+1
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
        <h3 className="text-xl font-semibold mb-4">{currentQuestion.text}</h3>
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Options:</h4>
          <div className="space-y-2">
            {allOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOptions(prev => ({ ...prev, [currentQuestion.id]: option.id }))}
                className={`block w-full text-left p-2 border rounded ${
                  selectedOptions[currentQuestion.id] === option.id
                    ? 'bg-blue-200 border-blue-500'
                    : 'bg-white border-gray-300 hover:bg-gray-100'
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
          {/* <div style={{width:"100%",display:"flex"}}>
            {currentQuestion.answer && (
              <p className={`mt-6 ml-4 text-md ${selectedOptions[currentQuestion.id] === currentQuestion.answer.id ? 'text-green-600' : 'text-red-600'}`}>
                {selectedOptions[currentQuestion.id] === currentQuestion.answer.id ? 'Correct!' : `Incorrect. Correct Answer: ${currentQuestion.answer.text}`}
              </p>
            )}
          </div> */}
        </div>
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            if (currentQuestionIndex > 0) {
              setCurrentQuestionIndex(currentQuestionIndex - 1);
            }
          }}
          disabled={currentQuestionIndex <= 0}
          className={`px-6 py-3 mr-4 rounded ${
            currentQuestionIndex <= 0
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          Previous Question
        </button>
        {isAnswered && currentQuestionIndex < testLevel.questions.length - 1 && (
          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            className="px-6 py-3 mr-4 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Next Question
          </button>
        )}
        {isAnswered && currentQuestionIndex === testLevel.questions.length - 1 && (
          <button
            onClick={() => {
              setCurrentLevel(currentLevel + 1);
              setSelectedOptions({});
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Next Level
          </button>
        )}
        <button
          onClick={() => {
            if (currentLevel > 1) {
              setCurrentLevel(currentLevel - 1);
              setSelectedOptions({});
            }
          }}
          disabled={currentLevel <= 1}
          className={`px-6 py-3 mr-4 rounded ${
            currentLevel <= 1
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          Previous Level
        </button>
      </div>
    </div>
  );
}
