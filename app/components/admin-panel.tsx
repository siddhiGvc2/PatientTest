"use client";

import { useState, useEffect } from "react";
import { TestLevel, Screen, Question, Image as ImageType, NewQuestionState } from "./admin/types";
import AddTestLevelForm from "./admin/AddTestLevelForm";
import AddScreenForm from "./admin/AddScreenForm";
import AddQuestionForm from "./admin/AddQuestionForm";
import AddImageForm from "./admin/AddImageForm";
import EditQuestionForm from "./admin/EditQuestionForm";
import EditImageForm from "./admin/EditImageForm";
import TestLevelTable from "./admin/TestLevelTable";
import ScreenTable from "./admin/ScreenTable";
import QuestionTable from "./admin/QuestionTable";
import ImageTable from "./admin/ImageTable";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('testLevel');
  const [testLevels, setTestLevels] = useState<TestLevel[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [images, setImages] = useState<ImageType[]>([]);

  // Edit states
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingImage, setEditingImage] = useState<ImageType | null>(null);

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tlRes, sRes, qRes, iRes] = await Promise.all([
        fetch("/api/test-level"),
        fetch("/api/screens"),
        fetch("/api/questions"),
        fetch("/api/images"),
      ]);

      if (tlRes.ok) setTestLevels(await tlRes.json());
      if (sRes.ok) setScreens(await sRes.json());
      if (qRes.ok) setQuestions(await qRes.json());
      if (iRes.ok) setImages(await iRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddTestLevel = async (level: number) => {
    try {
      const res = await fetch("/api/test-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level }),
      });
      if (res.ok) {
        setMessage("TestLevel added successfully!");
        fetchData();
      } else {
        setMessage("Error adding TestLevel");
      }
    } catch (error) {
      setMessage("Error adding TestLevel");
    }
  };

  const handleAddScreen = async (screenNumber: number, testLevelId: number) => {
    try {
      const res = await fetch("/api/screens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenNumber, testLevelId }),
      });
      if (res.ok) {
        setMessage("Screen added successfully!");
        fetchData();
      } else {
        setMessage("Error adding Screen");
      }
    } catch (error) {
      setMessage("Error adding Screen");
    }
  };

  const handleAddQuestion = async (question: NewQuestionState) => {
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: question.text,
          screenId: parseInt(question.screenId),
          answerImageId: question.answerImageId,
        }),
      });
      if (res.ok) {
        setMessage("Question added successfully!");
        fetchData();
      } else {
        setMessage("Error adding Question");
      }
    } catch (error) {
      setMessage("Error adding Question");
    }
  };

  const handleAddImage = async (url: string, screenId: number) => {
    try {
      const res = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, screenId }),
      });
      if (res.ok) {
        setMessage("Image added successfully!");
        fetchData();
      } else {
        setMessage("Error adding Image");
      }
    } catch (error) {
      setMessage("Error adding Image");
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
  };

  const handleUpdateQuestion = async (question: Question, data: NewQuestionState) => {
    try {
      const res = await fetch(`/api/questions/${question.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: data.text,
          screenId: parseInt(data.screenId),
          answerImageId: data.answerImageId,
        }),
      });
      if (res.ok) {
        setMessage("Question updated successfully!");
        setEditingQuestion(null);
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
  };

  const handleEditImage = (image: ImageType) => {
    setEditingImage(image);
  };

  const handleUpdateImage = async (image: ImageType) => {
    try {
      const res = await fetch(`/api/images/${image.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: image.url,
          screenId: image.screenId,
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
        <button onClick={() => setActiveTab('testLevel')} className={`px-4 py-2 mr-2 rounded ${activeTab === 'testLevel' ? 'bg-[var(--button-bg)] text-white' : 'bg-[var(--secondary-bg)] text-[var(--foreground)]'}`}>TestLevel</button>
        <button onClick={() => setActiveTab('screen')} className={`px-4 py-2 mr-2 rounded ${activeTab === 'screen' ? 'bg-[var(--button-bg)] text-white' : 'bg-[var(--secondary-bg)] text-[var(--foreground)]'}`}>Screen</button>
        <button onClick={() => setActiveTab('images')} className={`px-4 py-2 mr-2 rounded ${activeTab === 'images' ? 'bg-[var(--button-bg)] text-white' : 'bg-[var(--secondary-bg)] text-[var(--foreground)]'}`}>Images</button>
        <button onClick={() => setActiveTab('question')} className={`px-4 py-2 rounded ${activeTab === 'question' ? 'bg-[var(--button-bg)] text-white' : 'bg-[var(--secondary-bg)] text-[var(--foreground)]'}`}>Question</button>
      </div>

      {/* Add Forms */}
      {activeTab === 'testLevel' && <AddTestLevelForm onAdd={handleAddTestLevel} />}

      {activeTab === 'screen' && <AddScreenForm testLevels={testLevels} onAdd={handleAddScreen} />}

      {activeTab === 'question' && <AddQuestionForm screens={screens} images={images} testLevels={testLevels} onAdd={handleAddQuestion} />}

      {activeTab === 'images' && <AddImageForm screens={screens} testLevels={testLevels} onAdd={handleAddImage} />}

      {/* Edit Forms */}
      {editingQuestion && (
        <EditQuestionForm
          question={editingQuestion}
          screens={screens}
          images={images}
          testLevels={testLevels}
          onUpdate={handleUpdateQuestion}
          onCancel={handleCancelEditQuestion}
        />
      )}

      {editingImage && (
        <EditImageForm
          image={editingImage}
          screens={screens}
          testLevels={testLevels}
          onUpdate={handleUpdateImage}
          onCancel={handleCancelEditImage}
        />
      )}

      {/* Tables */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Existing Data</h2>

        {activeTab === 'testLevel' && <TestLevelTable testLevels={testLevels} />}

        {activeTab === 'screen' && <ScreenTable screens={screens} testLevels={testLevels} />}

        {activeTab === 'question' && <QuestionTable questions={questions} screens={screens} onEdit={handleEditQuestion} onDelete={handleDeleteQuestion} />}

        {activeTab === 'images' && <ImageTable images={images} screens={screens} onEdit={handleEditImage} />}
      </div>
    </div>
  );
}
