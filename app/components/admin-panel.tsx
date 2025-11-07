"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { TestLevel, Screen, Question, Image as ImageType, NewQuestionState, ImageLibrary } from "./admin/types";
import AddTestLevelForm from "./admin/AddTestLevelForm";
import AddScreenForm from "./admin/AddScreenForm";
import AddQuestionForm from "./admin/AddQuestionForm";
import AddImageForm from "./admin/AddImageForm";
import AddImageLibraryForm from "./admin/AddImageLibraryForm";
import EditQuestionForm from "./admin/EditQuestionForm";
import EditImageForm from "./admin/EditImageForm";
import EditImageLibraryForm from "./admin/EditImageLibraryForm";
import TestLevelTable from "./admin/TestLevelTable";
import ScreenTable from "./admin/ScreenTable";
import QuestionTable from "./admin/QuestionTable";
import ImageTable from "./admin/ImageTable";
import ImageLibraryTable from "./admin/ImageLibraryTable";

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('imageLibrary');
  const [testLevels, setTestLevels] = useState<TestLevel[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [images, setImages] = useState<ImageType[]>([]);
  const [imageLibraries, setImageLibraries] = useState<ImageLibrary[]>([]);

  // Edit states
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingImage, setEditingImage] = useState<ImageType | null>(null);
  const [editingImageLibrary, setEditingImageLibrary] = useState<ImageLibrary | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState<'question' | 'image' | 'imageLibrary' | null>(null);

  const [message, setMessage] = useState("");
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [showAddImageForm, setShowAddImageForm] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [showAddTestLevelForm, setShowAddTestLevelForm] = useState(false);
  const [showAddScreenForm, setShowAddScreenForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tlRes, sRes, qRes, iRes, ilRes] = await Promise.all([
        fetch("/api/test-level"),
        fetch("/api/screens"),
        fetch("/api/questions"),
        fetch("/api/images"),
        fetch("/api/image-library"),
      ]);

      if (tlRes.ok) setTestLevels(await tlRes.json());
      if (sRes.ok) setScreens(await sRes.json());
      if (qRes.ok) setQuestions(await qRes.json());
      if (iRes.ok) setImages(await iRes.json());
      if (ilRes.ok) setImageLibraries(await ilRes.json());
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

  const handleAddImage = async (file: File | null, screenId: number, imageLibraryId?: number) => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (imageLibraryId) {
        formData.append('imageLibraryId', imageLibraryId.toString());
      }
      formData.append('screenId', screenId.toString());

      const res = await fetch("/api/images", {
        method: "POST",
        body: formData,
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
    setEditType('question');
    setShowEditModal(true);
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
        setShowEditModal(false);
        setEditType(null);
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
    setShowEditModal(false);
    setEditType(null);
  };

  const handleEditImage = (image: ImageType) => {
    setEditingImage(image);
    setEditType('image');
    setShowEditModal(true);
  };

  const handleUpdateImage = async (image: ImageType, file?: File, imageLibraryId?: number) => {
    try {
      const formData = new FormData();
      formData.append('screenId', image.screenId.toString());
      if (file) {
        formData.append('file', file);
      }
      if (imageLibraryId) {
        formData.append('imageLibraryId', imageLibraryId.toString());
      }

      const res = await fetch(`/api/images/${image.id}`, {
        method: "PUT",
        body: formData,
      });
      if (res.ok) {
        setMessage("Image updated successfully!");
        setEditingImage(null);
        setShowEditModal(false);
        setEditType(null);
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
    setShowEditModal(false);
    setEditType(null);
  };

  const handleAddImageLibrary = async (files: File[]) => {
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch("/api/image-library", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }
      setMessage(`${files.length} image${files.length > 1 ? 's' : ''} added to library successfully!`);
      fetchData();
    } catch (error) {
      setMessage("Error adding images to library");
    }
  };

  const handleEditImageLibrary = (imageLibrary: ImageLibrary) => {
    setEditingImageLibrary(imageLibrary);
    setEditType('imageLibrary');
    setShowEditModal(true);
  };

  const handleUpdateImageLibrary = async (imageLibrary: ImageLibrary, file?: File) => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }

      const res = await fetch(`/api/image-library/${imageLibrary.id}`, {
        method: "PUT",
        body: formData,
      });
      if (res.ok) {
        setMessage("Image library item updated successfully!");
        setEditingImageLibrary(null);
        setShowEditModal(false);
        setEditType(null);
        fetchData();
      } else {
        setMessage("Error updating image library item");
      }
    } catch (error) {
      setMessage("Error updating image library item");
    }
  };

  const handleCancelEditImageLibrary = () => {
    setEditingImageLibrary(null);
    setShowEditModal(false);
    setEditType(null);
  };

  const handleDeleteImageLibrary = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image from library? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/image-library/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage("Image deleted from library successfully!");
        fetchData();
      } else {
        setMessage("Error deleting image from library");
      }
    } catch (error) {
      setMessage("Error deleting image from library");
    }
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

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage("Image deleted successfully!");
        fetchData();
      } else {
        setMessage("Error deleting Image");
      }
    } catch (error) {
      setMessage("Error deleting Image");
    }
  };

  const handleDeleteScreen = async (screenId: number) => {
    if (!confirm('Are you sure you want to delete this screen? This action cannot be undone and will also delete all associated questions and images.')) {
      return;
    }
    try {
      const res = await fetch(`/api/screens/${screenId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage("Screen deleted successfully!");
        setSelectedScreen(null);
        fetchData();
      } else {
        setMessage("Error deleting Screen");
      }
    } catch (error) {
      setMessage("Error deleting Screen");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
     
     <div className="flex justify-between">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        <button
        onClick={() => router.push('/')}
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Back to Home
      </button>
      </div>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      {/* Tabs */}
      <div className="flex mb-6 flex-wrap">
        {/* <button onClick={() => setActiveTab('testLevel')} className={`px-4 py-2 mr-2 mb-2 rounded ${activeTab === 'testLevel' ? 'bg-[var(--button-bg)] text-white' : 'bg-[var(--secondary-bg)] text-[var(--foreground)]'}`}>TestLevel</button>
        <button onClick={() => setActiveTab('screen')} className={`px-4 py-2 mr-2 mb-2 rounded ${activeTab === 'screen' ? 'bg-[var(--button-bg)] text-white' : 'bg-[var(--secondary-bg)] text-[var(--foreground)]'}`}>Screen</button> */}
        {/* <button onClick={() => setActiveTab('images')} className={`px-4 py-2 mr-2 mb-2 rounded ${activeTab === 'images' ? 'bg-[var(--button-bg)] text-white' : 'bg-[var(--secondary-bg)] text-[var(--foreground)]'}`}>Images</button>
        <button onClick={() => setActiveTab('question')} className={`px-4 py-2 mr-2 mb-2 rounded ${activeTab === 'question' ? 'bg-[var(--button-bg)] text-white' : 'bg-[var(--secondary-bg)] text-[var(--foreground)]'}`}>Question</button> */}
        <button onClick={() => setActiveTab('imageLibrary')} className={`px-4 py-2 mr-2 mb-2 rounded ${activeTab === 'imageLibrary' ? 'bg-[var(--button-bg)] text-white' : 'bg-[var(--secondary-bg)] text-[var(--foreground)]'}`}>Image Library</button>
        <button onClick={() => setActiveTab('selectScreen')} className={`px-4 py-2 mr-2 mb-2 rounded ${activeTab === 'selectScreen' ? 'bg-[var(--button-bg)] text-white' : 'bg-[var(--secondary-bg)] text-[var(--foreground)]'}`}>Settings</button>
      </div>

      {/* Add Forms */}
      {activeTab === 'testLevel' && <AddTestLevelForm onAdd={handleAddTestLevel} />}

      {activeTab === 'screen' && <AddScreenForm testLevels={testLevels} onAdd={handleAddScreen} />}

      {activeTab === 'question' && <AddQuestionForm screens={screens} images={images} testLevels={testLevels} onAdd={handleAddQuestion} />}

      {activeTab === 'images' && <AddImageForm screens={screens} testLevels={testLevels} imageLibraries={imageLibraries} onAdd={handleAddImage} />}

      {activeTab === 'imageLibrary' && <AddImageLibraryForm onAdd={handleAddImageLibrary} />}

      {activeTab === 'selectScreen' && (
        <div className="mb-6">
          <label htmlFor="screenSelect" className="block text-sm font-medium mb-2">Choose a Screen:</label>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setShowAddTestLevelForm(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Test Level
            </button>
            <button
              onClick={() => setShowAddScreenForm(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Screen
            </button>
          </div>
          <select
            id="screenSelect"
            value={selectedScreen?.id || ''}
            onChange={(e) => {
              const screenId = parseInt(e.target.value);
              const screen = screens.find(s => s.id === screenId) || null;
              setSelectedScreen(screen);
            }}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          >
            <option className="bg-[var(--card-bg)]" value="">Select a screen</option>
            {screens.map((screen) => {
              const testLevel = testLevels.find(tl => tl.id === screen.testLevelId);
              return (
                <option className="bg-[var(--card-bg)]" key={screen.id} value={screen.id}>
                   Test Level {testLevel?.level || 'Unknown'}-Screen {screen.screenNumber}
                </option>
              );
            })}
          </select>
          {selectedScreen && (
            <div className="mt-4">
              <div className="p-4 bg-[var(--card-bg)] rounded mb-4">
                <h3 className="text-lg font-semibold">Selected Screen Details:</h3>
                <p><strong>Test Level:</strong> {testLevels.find(tl => tl.id === selectedScreen.testLevelId)?.level || 'Unknown'}</p>
                <p><strong>Screen Number:</strong> {selectedScreen.screenNumber}</p>
                <button
                  onClick={() => handleDeleteScreen(selectedScreen.id)}
                  className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Delete Screen
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-semibold mb-2">Associated Images:</h4>
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }, (_, index) => {
                    const screenImages = images.filter(img => img.screenId === selectedScreen.id);
                    const image = screenImages[index];
                    return (
                      <div key={index} className="border border-gray-300 p-2 rounded">
                        {image ? (
                          <>
                            <img src={image.url} alt={`Image ${image.id}`} className="w-full h-26 object-content mb-2" />
                            <button onClick={() => handleEditImage(image)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                          </>
                        ) : (
                          <button
                            onClick={() => setShowAddImageForm(true)}
                            className="w-full h-16 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-500 text-sm rounded cursor-pointer transition-colors"
                          >
                            Add Image
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-semibold">Associated Questions:</h4>
                  <button
                    onClick={() => setShowAddQuestionForm(true)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Add Question
                  </button>
                </div>
                {questions.filter(q => q.screenId === selectedScreen.id).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                      <thead>
                        <tr className="bg-[var(--card-bg)]">
                          <th className="px-4 py-2 border-b">ID</th>
                          <th className="px-4 py-2 border-b">Text</th>
                          <th className="px-4 py-2 border-b">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questions.filter(q => q.screenId === selectedScreen.id).map((question,i) => (
                          <tr key={question.id} className="hover:bg-gray-50 bg-[var(--card-bg)]">
                            <td className="px-4 py-2 border-b text-center">{i+1}</td>
                            <td className="px-4 py-2 border-b text-center">{question.text}</td>
                            <td className="px-4 py-2 border-b text-center">
                              <button onClick={() => handleEditQuestion(question)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                              <button onClick={() => handleDeleteQuestion(question.id)} className="text-red-600 hover:text-red-800">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No questions associated with this screen.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            {editType === 'question' && editingQuestion && (
              <EditQuestionForm
                question={editingQuestion}
                screens={screens}
                images={images}
                testLevels={testLevels}
                onUpdate={handleUpdateQuestion}
                onCancel={handleCancelEditQuestion}
              />
            )}
            {editType === 'image' && editingImage && (
              <EditImageForm
                image={editingImage}
                screens={screens}
                testLevels={testLevels}
                imageLibraries={imageLibraries}
                onUpdate={handleUpdateImage}
                onCancel={handleCancelEditImage}
              />
            )}
            {editType === 'imageLibrary' && editingImageLibrary && (
              <EditImageLibraryForm
                imageLibrary={editingImageLibrary}
                onUpdate={handleUpdateImageLibrary}
                onCancel={handleCancelEditImageLibrary}
              />
            )}
          </div>
        </div>
      )}

      {/* Add Image Modal */}
      {showAddImageForm && selectedScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Image to Screen {selectedScreen.screenNumber}</h3>
            <AddImageForm
              screens={screens}
              testLevels={testLevels}
              imageLibraries={imageLibraries}
              initialScreenId={selectedScreen.id}
              onAdd={async (file, screenId, imageLibraryId) => {
                await handleAddImage(file, selectedScreen.id, imageLibraryId);
                setShowAddImageForm(false);
              }}
            />
            <button
              onClick={() => setShowAddImageForm(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestionForm && selectedScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Question to Screen {selectedScreen.screenNumber}</h3>
            <AddQuestionForm
              screens={screens}
              images={images.filter(img => img.screenId === selectedScreen.id)}
              testLevels={testLevels}
              initialScreenId={selectedScreen.id}
              onAdd={async (question) => {
                await handleAddQuestion(question);
                setShowAddQuestionForm(false);
              }}
            />
            <button
              onClick={() => setShowAddQuestionForm(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Test Level Modal */}
      {showAddTestLevelForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Test Level</h3>
            <AddTestLevelForm
              onAdd={async (level) => {
                await handleAddTestLevel(level);
                setShowAddTestLevelForm(false);
              }}
            />
            <button
              onClick={() => setShowAddTestLevelForm(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {showAddScreenForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Screen</h3>
            <AddScreenForm
              testLevels={testLevels}
              onAdd={async (screenNumber, testLevelId) => {
                await handleAddScreen(screenNumber, testLevelId);
                setShowAddScreenForm(false);
              }}
            />
            <button
              onClick={() => setShowAddScreenForm(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && selectedScreen) {
            handleAddImage(file, selectedScreen.id);
          }
          // Reset the input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      />

      {/* Tables */}
      {activeTab !== 'selectScreen' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Existing Data</h2>

          {activeTab === 'testLevel' && <TestLevelTable testLevels={testLevels} />}

          {activeTab === 'screen' && <ScreenTable screens={screens} testLevels={testLevels} />}

          {activeTab === 'question' && <QuestionTable questions={questions} testLevels={testLevels} screens={screens} onEdit={handleEditQuestion} onDelete={handleDeleteQuestion} />}

          {activeTab === 'images' && <ImageTable images={images} testLevels={testLevels} screens={screens} onEdit={handleEditImage} onDelete={handleDeleteImage} />}

          {activeTab === 'imageLibrary' && <ImageLibraryTable imageLibraries={imageLibraries} onDelete={handleDeleteImageLibrary} />}
        </div>
      )}
    </div>
  );
}
