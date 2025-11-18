"use client";

import { useEffect, useState } from "react";

const patientTerm = process.env.NEXT_PUBLIC_PATIENT || 'Patient';

const getLevelName = (level: number): string => {
  switch (level) {
    case 1:
      return process.env.NEXT_PUBLIC_Level1 || 'One Word Level Pictures';
    case 2:
      return process.env.NEXT_PUBLIC_Level2 || 'One Word Action Pictures';
    case 3:
      return process.env.NEXT_PUBLIC_Level3 || 'Two Word Level';
    case 4:
      return process.env.NEXT_PUBLIC_Level4 || 'Three Word Level';
    case 5:
      return process.env.NEXT_PUBLIC_Level5 || 'Four Word Level';
    default:
      return `Level ${level}`;
  }
};

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
  answerImageId: number;
}

interface Screen {
  id: number;
  screenNumber: number;
  questions: Question[];
  images: Image[];
}

interface TestLevel {
  id: number;
  level: number;
  screens: Screen[];
}
interface TestLevels{
  id: number;
  level: number;
  
}

interface TestLevelProps {
  onTestEnd?: () => void;
  onExit?: () => void;
  onRetake?: () => void;
  selectedPatient?: any;
}

export default function TestLevel({ onTestEnd, onExit, onRetake, selectedPatient }: TestLevelProps) {
  const [AllTestLevel, setAllTestLevels] = useState<TestLevels[]>([]);
  const [testLevel, setTestLevel] = useState<TestLevel | null>(null);
  const [allOptions, setAllOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | null>>({});
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [currentQuestionIndexInScreen, setCurrentQuestionIndexInScreen] = useState(0);
  const [testEnded,setTestEnded]=useState(false);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);


  const fetchAllTestLevels = async () => {
    try {
      const res = await fetch('/api/test-level');
      if (res.ok) {
        const data = await res.json();
        setAllTestLevels(data);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  useEffect(()=>{
    fetchAllTestLevels();
    setMounted(true);
  },[])

  const advanceToNextValidScreen = () => {
    if (!testLevel) return;
    let nextScreenIndex = currentScreenIndex;
    while (nextScreenIndex < testLevel.screens.length) {
      if (testLevel.screens[nextScreenIndex].questions && testLevel.screens[nextScreenIndex].questions.length > 0) {
        setCurrentScreenIndex(nextScreenIndex);
        setCurrentQuestionIndexInScreen(0);
        return;
      }
      nextScreenIndex++;
    }
    // No valid screen found, end test
    setTestEnded(true);
    onTestEnd?.();
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Set language to Hindi (India)
      window.speechSynthesis.speak(utterance);
      console.log("speakText called");
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  const saveResponse = async (questionId: number, selectedImageId: number) => {
    if (!selectedPatient) return;
    setSaving(true);
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          questionId,
          selectedImageId,
        }),
      });
      if (!res.ok) {
        console.error('Failed to save response');
      }
    } catch (error) {
      console.error('Error saving response:', error);
    } finally {
      setSaving(false);
    }
  };

  const fetchTestLevel = async (level: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/test-level/${level}`);
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        // Check if the level has screens with questions
        const hasValidScreens = data.screens && data.screens.some((screen: Screen) => screen.questions && screen.questions.length > 0);
        if (hasValidScreens) {
          setTestLevel(data);
          setCurrentScreenIndex(0);
          setCurrentQuestionIndexInScreen(0);
        } else {
          // No valid screens, try next level
          if (level < AllTestLevel.length-1) { // Assume max 10 levels to prevent infinite loop
            setCurrentLevel(level + 1);
          } else {
            setTestEnded(true);
            onTestEnd?.();
          }
        }
      } else {
        setTestEnded(true);
         onTestEnd?.();
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

  }, [currentLevel]);

  useEffect(() => {
    if (testLevel && currentScreenIndex >= testLevel.screens.length) {
      setTestEnded(true);
       onTestEnd?.();
    } else if (testLevel && testLevel.screens[currentScreenIndex] && (!testLevel.screens[currentScreenIndex].questions || testLevel.screens[currentScreenIndex].questions.length === 0)) {
      advanceToNextValidScreen();
    }
  }, [testLevel, currentScreenIndex]);



  useEffect(() => {
    if (testLevel && testLevel.screens[currentScreenIndex] && testLevel.screens[currentScreenIndex].questions[currentQuestionIndexInScreen]) {
      const currentQuestion = testLevel.screens[currentScreenIndex].questions[currentQuestionIndexInScreen];
      if (selectedOptions[currentQuestion.id] !== undefined) {
        const timer = setTimeout(() => {
          const currentScreen = testLevel.screens[currentScreenIndex];
          if (currentQuestionIndexInScreen < currentScreen.questions.length - 1) {
            setCurrentQuestionIndexInScreen(currentQuestionIndexInScreen + 1);
          } else if (currentScreenIndex < testLevel.screens.length - 1) {
            let nextIndex = currentScreenIndex + 1;
            while (nextIndex < testLevel.screens.length && (!testLevel.screens[nextIndex].questions || testLevel.screens[nextIndex].questions.length === 0)) {
              nextIndex++;
            }
            if (nextIndex < testLevel.screens.length) {
              setCurrentScreenIndex(nextIndex);
              setCurrentQuestionIndexInScreen(0);
            } else {
              setCurrentLevel(currentLevel + 1);
              setSelectedOptions({});
            }
          } else {
            setCurrentLevel(currentLevel + 1);
            setSelectedOptions({});
          }
        }, 1000); // 1 seconds delay
        return () => clearTimeout(timer);
      }
    }
  }, [selectedOptions, currentScreenIndex, currentQuestionIndexInScreen, testLevel]);

  useEffect(() => {
    try {
      document.documentElement.requestFullscreen();
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  }, []);

  useEffect(() => {
    if (mounted && testLevel && testLevel.screens[currentScreenIndex] && testLevel.screens[currentScreenIndex].questions[currentQuestionIndexInScreen]) {
      speakText(testLevel.screens[currentScreenIndex].questions[currentQuestionIndexInScreen].text);
    }
  }, [currentScreenIndex, currentQuestionIndexInScreen, testLevel, mounted]);

  useEffect(() => {
    if (testEnded) {
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
      }
    }
  }, [testEnded]);

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
            onRetake?.(); // Call the callback to hide header again
          }}
          className="px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          🔁 Retake Test
        </button>
      </div>
    </div>
  );
}


  const currentScreen = testLevel.screens[currentScreenIndex];
  if (!currentScreen) {
    setTimeout(() => {
      setTestEnded(true);
      onTestEnd?.();
    }, 0);
    return null;
  }
  const currentQuestion = currentScreen.questions && currentScreen.questions[currentQuestionIndexInScreen];
  if (!currentQuestion) {
    setTimeout(() => {
      setTestEnded(true);
      onTestEnd?.();
    }, 0);
    return null;
  }
  const isAnswered = selectedOptions[currentQuestion.id] !== undefined;

  return (
    <div className="w-full p-6">
      {selectedPatient && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">{patientTerm}: {selectedPatient.name}</h3>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Test Level {currentLevel}-{getLevelName(testLevel.level)}</h2>
        <button
          onClick={() => {
            setTestEnded(true);
            setCurrentLevel(1);
            setCurrentScreenIndex(0);
            setCurrentQuestionIndexInScreen(0);
            onExit?.();
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Exit Test
        </button>
      </div>
      <div className="mb-8">
         <div className="flex items-center mb-4">
           <h3 className="text-xl font-semibold">S{currentScreen.screenNumber}/{currentQuestionIndexInScreen+1}  {currentQuestion.text}</h3>
           <button
             onClick={() => speakText(`${currentQuestion.text}`)}
             className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
             title="Speak question"
           >
             🔊
           </button>
         </div>
        <div className="flex justify-center mb-4">
          <div className="grid grid-cols-2 gap-6 mx-auto">
          {currentScreen.images.map((image, index) => {
            const labels = ['A', 'B', 'C', 'D'];

            return (
              <div
                key={image.id}
                onClick={() => {
                  setSelectedOptions(prev => ({ ...prev, [currentQuestion.id]: image.id }));
                  saveResponse(currentQuestion.id, image.id);
                }} // select option on image click and save response
                className={`md:w-[200px] h-[200px]   bg-white p-0 rounded-lg shadow-md relative cursor-pointer transition-all ${
                  selectedOptions[currentQuestion.id] === image.id
                    ? 'ring-4 ring-blue-400'
                    : 'hover:shadow-lg'
                }`}
              >
                {/* <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 rounded text-sm font-bold">
                  {labels[index] || ''}
                </div> */}
                <img
                  src={image.url}
                  alt={`Image ${image.id}`}
                  className="md:w-[200px] h-[200px]  object-content rounded-md border border-black"
                />
              </div>
            );
          })}
          </div>
        </div>
       
        {/* <div className="mb-4">
          <h4 className="font-semibold mb-2">Options:</h4> */}
          {/* <div className="space-y-2">
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
          </div> */}
          {/* <div style={{width:"100%",display:"flex"}}>
            {currentQuestion.answer && (
              <p className={`mt-6 ml-4 text-md ${selectedOptions[currentQuestion.id] === currentQuestion.answer.id ? 'text-green-600' : 'text-red-600'}`}>
                {selectedOptions[currentQuestion.id] === currentQuestion.answer.id ? 'Correct!' : `Incorrect. Correct Answer: ${currentQuestion.answer.text}`}
              </p>
            )}
          </div> */}
        {/* </div> */}
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            if (currentQuestionIndexInScreen > 0) {
              const newQuestionIndex = currentQuestionIndexInScreen - 1;
              const newQuestion = currentScreen.questions[newQuestionIndex];
              setCurrentQuestionIndexInScreen(newQuestionIndex);
              setSelectedOptions({});
            } else if (currentScreenIndex > 0) {
              const prevScreenIndex = currentScreenIndex - 1;
              const prevScreen = testLevel.screens[prevScreenIndex];
              const newQuestionIndex = prevScreen.questions.length - 1;
              const newQuestion = prevScreen.questions[newQuestionIndex];
              setCurrentScreenIndex(prevScreenIndex);
              setCurrentQuestionIndexInScreen(newQuestionIndex);
              setSelectedOptions({});
            }
          }}
          disabled={currentScreenIndex === 0 && currentQuestionIndexInScreen === 0}
          className={`px-6 py-3 mr-4 rounded ${
            currentScreenIndex === 0 && currentQuestionIndexInScreen === 0
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          Previous Question
        </button>
        {isAnswered && currentQuestionIndexInScreen < currentScreen.questions.length - 1 && (
          <button
            onClick={() => setCurrentQuestionIndexInScreen(currentQuestionIndexInScreen + 1)}
            className="px-6 py-3 mr-4 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Next Question
          </button>
        )}
        {isAnswered && currentQuestionIndexInScreen === currentScreen.questions.length - 1 && currentScreenIndex < testLevel.screens.length - 1 && (
          <button
            onClick={() => {
              let nextIndex = currentScreenIndex + 1;
              while (nextIndex < testLevel.screens.length && (!testLevel.screens[nextIndex].questions || testLevel.screens[nextIndex].questions.length === 0)) {
                nextIndex++;
              }
              if (nextIndex < testLevel.screens.length) {
                setCurrentScreenIndex(nextIndex);
                setCurrentQuestionIndexInScreen(0);
              } else {
                setCurrentLevel(currentLevel + 1);
                setSelectedOptions({});
              }
            }}
            className="px-6 py-3 mr-4 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Next Screen
          </button>
        )}
        {isAnswered && currentScreenIndex === testLevel.screens.length - 1 && currentQuestionIndexInScreen === currentScreen.questions.length - 1 && (
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
