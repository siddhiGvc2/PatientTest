"use client";

import { useState, useEffect } from "react";
import AnswerImageSelect from "./Image-Select";

interface TestLevel {
  id: number;
  level: number;
}

interface Screen {
  id: number;
  screenNumber: number;
  testLevelId: number;
}

interface Question {
  id: number;
  text: string;
  screenId: string;
  answerImageId: string | number;
}

interface Image {
  id: number;
  url: string;
  screenId: number;
}

interface Option {
  id: number;
  text: string;
  questionId: number;
}

interface NewQuestionState {
  text: string;
  screenId: string;
  answerImageId: string | number | '';
}



export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('testLevel');
  const [testLevels, setTestLevels] = useState<TestLevel[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  
  

  // Form states
  const [newTestLevel, setNewTestLevel] = useState({ level: "" });
  const [newScreen, setNewScreen] = useState({ screenNumber: "", testLevelId: "" });
  const [newQuestion, setNewQuestion] = useState<NewQuestionState>({ text: "", screenId: "", answerImageId: "" });
  const [newImage, setNewImage] = useState({ url: "", screenId: "" });

  // Edit states
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingQuestionData, setEditingQuestionData] = useState<NewQuestionState | null>(null);
  const [editingImage, setEditingImage] = useState<Image | null>(null);

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tlRes, sRes, qRes, iRes, oRes] = await Promise.all([
        fetch("/api/test-level"),
        fetch("/api/screens"),
        fetch("/api/questions"),
        fetch("/api/images"),
        fetch("/api/options"),
      ]);

      if (tlRes.ok) setTestLevels(await tlRes.json());
      if (sRes.ok) setScreens(await sRes.json());
      if (qRes.ok) setQuestions(await qRes.json());
      if (iRes.ok) setImages(await iRes.json());
      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddTestLevel = async () => {
    try {
      const res = await fetch("/api/test-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: parseInt(newTestLevel.level) }),
      });
      if (res.ok) {
        setMessage("TestLevel added successfully!");
        setNewTestLevel({ level: "" });
        fetchData();
      } else {
        setMessage("Error adding TestLevel");
      }
    } catch (error) {
      setMessage("Error adding TestLevel");
    }
  };

  const handleAddScreen = async () => {
    try {
      const res = await fetch("/api/screens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenNumber: parseInt(newScreen.screenNumber),
          testLevelId: parseInt(newScreen.testLevelId),
        }),
      });
      if (res.ok) {
        setMessage("Screen added successfully!");
        setNewScreen({ screenNumber: "", testLevelId: "" });
        fetchData();
      } else {
        setMessage("Error adding Screen");
      }
    } catch (error) {
      setMessage("Error adding Screen");
    }
  };

  const handleAddQuestion = async () => {
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newQuestion.text,
          screenId: parseInt(newQuestion.screenId),
          answerImageId:newQuestion.answerImageId,
        }),
      });
      if (res.ok) {
        setMessage("Question added successfully!");
        setNewQuestion({ text: "", screenId: "", answerImageId: "" });
        fetchData();
      } else {
        setMessage("Error adding Question");
      }
    } catch (error) {
      setMessage("Error adding Question");
    }
  };

  const handleAddImage = async () => {
    try {
      const res = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newImage.url,
          screenId: parseInt(newImage.screenId),
        }),
      });
      if (res.ok) {
        setMessage("Image added successfully!");
        setNewImage({ url: "", screenId: "" });
        fetchData();
      } else {
        setMessage("Error adding Image");
      }
    } catch (error) {
      setMessage("Error adding Image");
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion({ ...question });
    setEditingQuestionData({
      text: question.text,
      screenId: question.screenId.toString(),
      answerImageId: question.answerImageId,
    });
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion || !editingQuestionData) return;
    try {
      const res = await fetch(`/api/questions/${editingQuestion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: editingQuestionData.text,
          screenId: parseInt(editingQuestionData.screenId),
          answerImageId: editingQuestionData.answerImageId,
        }),
      });
      if (res.ok) {
        setMessage("Question updated successfully!");
        setEditingQuestion(null);
        setEditingQuestionData(null);
        fetchData();
      } else {
        setMessage("Error updating Question");
      }
    } catch (error) {
      setMessage("Error updating Question");
    }
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestion(null);
    setEditingQuestionData(null);
  };

  const handleEditImage = (image: Image) => {
    setEditingImage(image);
  };

  const handleUpdateImage = async () => {
    if (!editingImage) return;
    try {
      const res = await fetch(`/api/images/${editingImage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: editingImage.url,
          screenId: editingImage.screenId,
        }),
      });
      if (res.ok) {
        setMessage("Image updated successfully!");
        setEditingImage(null);
        fetchData();
      } else {
        setMessage("Error updating Image");
      }
    } catch (error) {
      setMessage("Error updating Image");
    }
  };

  const handleCancelEditImage = () => {
    setEditingImage(null);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage("Question deleted successfully!");
        fetchData();
      } else {
        setMessage("Error deleting Question");
      }
    } catch (error) {
      setMessage("Error deleting Question");
    }
  };



  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      {/* Tabs */}
      <div className="flex mb-6">
        <button onClick={() => setActiveTab('testLevel')} className={`px-4 py-2 mr-2 rounded ${activeTab === 'testLevel' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>TestLevel</button>
        <button onClick={() => setActiveTab('screen')} className={`px-4 py-2 mr-2 rounded ${activeTab === 'screen' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Screen</button>
        <button onClick={() => setActiveTab('images')} className={`px-4 py-2 mr-2 rounded ${activeTab === 'images' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Images</button>
        <button onClick={() => setActiveTab('question')} className={`px-4 py-2 rounded ${activeTab === 'question' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Question</button>
      </div>

      {/* Add Forms */}
      {activeTab === 'testLevel' && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Add TestLevel</h2>
          <input
            type="number"
            placeholder="Level"
            value={newTestLevel.level}
            onChange={(e) => setNewTestLevel({ level: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <button onClick={handleAddTestLevel} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Add TestLevel
          </button>
        </div>
      )}

      {activeTab === 'screen' && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Screen</h2>
          <input
            type="number"
            placeholder="Screen Number"
            value={newScreen.screenNumber}
            onChange={(e) => setNewScreen({ ...newScreen, screenNumber: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <select
            value={newScreen.testLevelId}
            onChange={(e) => setNewScreen({ ...newScreen, testLevelId: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Select TestLevel</option>
            {testLevels.map(tl => (
              <option key={tl.id} value={tl.id}>{tl.level}</option>
            ))}
          </select>
          <button onClick={handleAddScreen} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Add Screen
          </button>
        </div>
      )}

      {activeTab === 'question' && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Question</h2>
          <input
            type="text"
            placeholder="Question Text"
            value={newQuestion.text}
            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <select
            value={newQuestion.screenId}
            onChange={(e) => setNewQuestion({ ...newQuestion, screenId: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Select Screen</option>
            {screens.map(s => (
              <option key={s.id} value={s.id}>Screen {s.screenNumber} (Level {testLevels.find(tl => tl.id === s.testLevelId)?.level})</option>
            ))}
          </select>
         
          <AnswerImageSelect
            images={images}
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
            />
          <button onClick={handleAddQuestion} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Add Question
          </button>
        </div>
      )}

      {activeTab === 'images' && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Image</h2>
          <input
            type="text"
            placeholder="Image URL"
            value={newImage.url}
            onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <select
            value={newImage.screenId}
            onChange={(e) => setNewImage({ ...newImage, screenId: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Select Screen</option>
            {screens.map(s => (
              <option key={s.id} value={s.id}>Screen {s.screenNumber} (Level {testLevels.find(tl => tl.id === s.testLevelId)?.level})</option>
            ))}
          </select>
          <button onClick={handleAddImage} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Add Image
          </button>
        </div>
      )}

      {/* Edit Forms */}
      {editingQuestion && editingQuestionData && (
        <div className="bg-yellow-100 p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Question</h2>
          <input
            type="text"
            placeholder="Question Text"
            value={editingQuestionData.text}
            onChange={(e) => setEditingQuestionData({ ...editingQuestionData, text: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <select
            value={editingQuestionData.screenId}
            onChange={(e) => setEditingQuestionData({ ...editingQuestionData, screenId: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Select Screen</option>
            {screens.map(s => (
              <option key={s.id} value={s.id}>Screen {s.screenNumber} (Level {testLevels.find(tl => tl.id === s.testLevelId)?.level})</option>
            ))}
          </select>

           <AnswerImageSelect
            images={images}
            newQuestion={editingQuestionData}
            setNewQuestion={setEditingQuestionData}
            />
          <button onClick={handleUpdateQuestion} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-2">
            Update Question
          </button>
          <button onClick={handleCancelEditQuestion} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
            Cancel
          </button>
        </div>
      )}

      {editingImage && (
        <div className="bg-yellow-100 p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Image</h2>
          <input
            type="text"
            placeholder="Image URL"
            value={editingImage.url}
            onChange={(e) => setEditingImage({ ...editingImage, url: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <select
            value={editingImage.screenId}
            onChange={(e) => setEditingImage({ ...editingImage, screenId: parseInt(e.target.value) })}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Select Screen</option>
            {screens.map(s => (
              <option key={s.id} value={s.id}>Screen {s.screenNumber} (Level {testLevels.find(tl => tl.id === s.testLevelId)?.level})</option>
            ))}
          </select>
          <button onClick={handleUpdateImage} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-2">
            Update Image
          </button>
          <button onClick={handleCancelEditImage} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
            Cancel
          </button>
        </div>
      )}

      {/* Tables */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Existing Data</h2>

        {activeTab === 'testLevel' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">TestLevels</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">ID</th>
                  <th className="border border-gray-300 p-2">Level</th>
                </tr>
              </thead>
              <tbody>
                {testLevels.map(tl => (
                  <tr key={tl.id}>
                    <td className="border border-gray-300 p-2">{tl.id}</td>
                    <td className="border border-gray-300 p-2">{tl.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'screen' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Screens</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">ID</th>
                  <th className="border border-gray-300 p-2">Screen Number</th>
                  <th className="border border-gray-300 p-2">TestLevel</th>
                </tr>
              </thead>
              <tbody>
                {screens.map(s => (
                  <tr key={s.id}>
                    <td className="border border-gray-300 p-2">{s.id}</td>
                    <td className="border border-gray-300 p-2">{s.screenNumber}</td>
                    <td className="border border-gray-300 p-2">{testLevels.find(tl => tl.id === s.testLevelId)?.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'question' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Questions</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">ID</th>
                  <th className="border border-gray-300 p-2">Text</th>
                  <th className="border border-gray-300 p-2">Screen</th>
                  <th className="border border-gray-300 p-2">Answer Image ID</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map(q => (
                  <tr key={q.id}>
                    <td className="border border-gray-300 p-2">{q.id}</td>
                    <td className="border border-gray-300 p-2">{q.text}</td>
                    <td className="border border-gray-300 p-2">{screens.find(s => s.id === q.screenId)?.screenNumber}</td>
                    <td className="border border-gray-300 p-2">{q.answerImageId !== undefined ? q.answerImageId : 'N/A'}</td>
                    <td className="border border-gray-300 p-2">
                      <button onClick={() => handleEditQuestion(q)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Images</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">ID</th>
                  <th className="border border-gray-300 p-2">Image</th>
                  <th className="border border-gray-300 p-2">Screen</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {images.map(i => (
                  <tr key={i.id}>
                    <td className="border border-gray-300 p-2">{i.id}</td>
                    <td className="border border-gray-300 p-2"><img src={i.url} width={50} height={50} alt="" /></td>
                    <td className="border border-gray-300 p-2">{screens.find(s => s.id === i.screenId)?.screenNumber}</td>
                    <td className="border border-gray-300 p-2">
                      <button onClick={() => handleEditImage(i)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
