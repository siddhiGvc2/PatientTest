"use client";

import { useState, useEffect } from "react";

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
  screenId: number;
  answerImageId: number;
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

export default function AdminPanel() {
  const [testLevels, setTestLevels] = useState<TestLevel[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [options, setOptions] = useState<Option[]>([]);

  // Form states
  const [newTestLevel, setNewTestLevel] = useState({ level: "" });
  const [newScreen, setNewScreen] = useState({ screenNumber: "", testLevelId: "" });
  const [newQuestion, setNewQuestion] = useState({ text: "", screenId: "", options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }], answerImageId: "" });
  const [newImage, setNewImage] = useState({ url: "", screenId: "" });

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
      if (oRes.ok) setOptions((await oRes.json()).options);
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
          options: newQuestion.options.filter(opt => opt.text.trim() !== ""),
          answerImageId: parseInt(newQuestion.answerImageId),
        }),
      });
      if (res.ok) {
        setMessage("Question added successfully!");
        setNewQuestion({ text: "", screenId: "", options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }], answerImageId: "" });
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



  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add TestLevel */}
        <div className="bg-white p-4 rounded shadow">
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

        {/* Add Screen */}
        <div className="bg-white p-4 rounded shadow">
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

        {/* Add Question */}
        <div className="bg-white p-4 rounded shadow">
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
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Options:</label>
            {newQuestion.options.map((option, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option.text}
                onChange={(e) => {
                  const updatedOptions = [...newQuestion.options];
                  updatedOptions[index].text = e.target.value;
                  setNewQuestion({ ...newQuestion, options: updatedOptions });
                }}
                className="w-full p-2 border rounded mb-1"
              />
            ))}
          </div>
          <select
            value={newQuestion.answerImageId}
            onChange={(e) => setNewQuestion({ ...newQuestion, answerImageId: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Select Answer Image</option>
            {images.map(img => (
              <option key={img.id} value={img.id}>Image {img.id} ({img.url})</option>
            ))}
          </select>
          <button onClick={handleAddQuestion} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Add Question
          </button>
        </div>

        {/* Add Image */}
        <div className="bg-white p-4 rounded shadow">
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
      </div>

      {/* Tables */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Existing Data</h2>

        {/* TestLevels Table */}
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

        {/* Screens Table */}
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

        {/* Questions Table */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Questions</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">ID</th>
                <th className="border border-gray-300 p-2">Text</th>
                <th className="border border-gray-300 p-2">Screen</th>
                <th className="border border-gray-300 p-2">Answer Image ID</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(q => (
                <tr key={q.id}>
                  <td className="border border-gray-300 p-2">{q.id}</td>
                  <td className="border border-gray-300 p-2">{q.text}</td>
                  <td className="border border-gray-300 p-2">{screens.find(s => s.id === q.screenId)?.screenNumber}</td>
                  <td className="border border-gray-300 p-2">{q.answerImageId !== undefined ? q.answerImageId : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Images Table */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Images</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">ID</th>
                <th className="border border-gray-300 p-2">Image</th>
                <th className="border border-gray-300 p-2">Screen</th>
              </tr>
            </thead>
            <tbody>
              {images.map(i => (
                <tr key={i.id}>
                  <td className="border border-gray-300 p-2">{i.id}</td>
                  <td className="border border-gray-300 p-2"><img src={i.url} width={50} height={50} alt="" /></td>
                  <td className="border border-gray-300 p-2">{screens.find(s => s.id === i.screenId)?.screenNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Options Table */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Options</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">ID</th>
                <th className="border border-gray-300 p-2">Text</th>
                <th className="border border-gray-300 p-2">Question ID</th>
              </tr>
            </thead>
            <tbody>
              {options.map(o => (
                <tr key={o.id}>
                  <td className="border border-gray-300 p-2">{o.id}</td>
                  <td className="border border-gray-300 p-2">{o.text}</td>
                  <td className="border border-gray-300 p-2">{o.questionId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
