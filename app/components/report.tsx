"use client";

import { useEffect, useState } from "react";
import TestLevel from "./test-level";

const patientTerm = process.env.NEXT_PUBLIC_PATIENT || 'Patient';

interface Patient {
  id: number;
  name: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  relation: string;
  address: string | null;
  aadiId: string | null;
  keyWorkerName: string | null;
  caregiverName: string | null;
  score: number;
  user: {
    email: string;
    name: string;
    userType: string;
  };
}

interface ScoreReport {
  id: number;
  patientId: number;
  score: number;
  dateTime: string;
  detailedReport: any[] | null;
}

interface Question {
  id: number;
  text: string;
  screenId:number;
  options: { id: number; text: string }[];
}


interface Screen {
  id: number;
  screenNumber: number;
  testLevelId:number;
}

interface TestLevel {
  id: number;
  level:number;
}

interface ReportProps {
  selectedPatient: Patient | null;
  currentUserId: number;
  onBack: () => void;
}

export default function Report({ selectedPatient, currentUserId, onBack }: ReportProps) {
  const [scoreReports, setScoreReports] = useState<ScoreReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ScoreReport | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [testLevels, setTestLevels] = useState<TestLevel[]>([]);


  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return '';
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return '';
    const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return age.toString();
  };



  useEffect(() => {
    fetchQuestions();
    fetchScreens();
    fetchTestLevels();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchScoreReports();
    }
  }, [selectedPatient, currentUserId, startDate, endDate]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const fetchScreens = async () => {
    try {
      const res = await fetch('/api/screens');
      if (res.ok) {
        const data = await res.json();
        setScreens(data);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const fetchTestLevels = async () => {
    try {
      const res = await fetch('/api/test-level');
      if (res.ok) {
        const data = await res.json();
        setTestLevels(data);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const fetchScoreReports = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/score-reports?patientId=${selectedPatient!.id}&currentUserId=${currentUserId}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setScoreReports(data.scoreReports);
      } else {
        setError('Failed to fetch score reports');
      }
    } catch (err) {
      setError('Error fetching score reports');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetailedReport = (report: ScoreReport) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  if (!selectedPatient) {
    return <div className="text-center">No ${patientTerm} selected for report.</div>;
  }

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{patientTerm} Test Report</h2>
        <button
          onClick={onBack}
          className="bg-[var(--secondary-bg)] text-[var(--foreground)] px-4 py-2 rounded hover:bg-[var(--border-color)]"
        >
          Back to {patientTerm}s
        </button>
      </div>
      <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--border-color)] mb-6">
        <h3 className="text-lg font-semibold mb-4">{patientTerm} Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[var(--foreground)] font-medium">Name</label>
            <p className="text-[var(--foreground)]">{selectedPatient.name}</p>
          </div>
          <div>
            <label className="block text-[var(--foreground)] font-medium">Age</label>
            <p className="text-[var(--foreground)]">{calculateAge(selectedPatient.dateOfBirth)}</p>
          </div>
          <div>
            <label className="block text-[var(--foreground)] font-medium">Address</label>
            <p className="text-[var(--foreground)]">{selectedPatient.address || '-'}</p>
          </div>
          
          <div>
            <label className="block text-[var(--foreground)] font-medium">Aadi ID</label>
            <p className="text-[var(--foreground)]">{selectedPatient.aadiId || '-'}</p>
          </div>
          <div>
            <label className="block text-[var(--foreground)] font-medium">Phone Number</label>
            <p className="text-[var(--foreground)]">{selectedPatient.phoneNumber || '-'}</p>
          </div>
          <div>
            <label className="block text-[var(--foreground)] font-medium">Score</label>
            <p className="text-[var(--foreground)]">{selectedPatient.score}</p>
          </div>
          <div>
            <label className="block text-[var(--foreground)] font-medium">Created By</label>
            <p className="text-[var(--foreground)]">{selectedPatient.user.name}</p>
          </div>
        </div>
      </div>
      <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--border-color)]">
        <h3 className="text-lg font-semibold mb-4">Score Reports</h3>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-[var(--foreground)] font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded bg-[var(--card-bg)] text-[var(--foreground)]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[var(--foreground)] font-medium mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded bg-[var(--card-bg)] text-[var(--foreground)]"
            />
          </div>
        </div>
        {loading && <div className="text-center">Loading score reports...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && scoreReports.length === 0 && <div className="text-center">No score reports found for this patient.</div>}
        {!loading && !error && scoreReports.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[var(--card-bg)] border border-[var(--border-color)]">
              <thead>
                <tr className="bg-[var(--secondary-bg)]">
                  <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">ID</th>
                  <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Score</th>
                  <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Date & Time</th>
                  <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scoreReports.map((report, i) => (
                  <tr key={report.id} className="hover:bg-[var(--secondary-bg)]">
                    <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] text-center">{i + 1}</td>
                    <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] text-center">{report.score}</td>
                    <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] text-center">{new Date(report.dateTime).toLocaleString()}</td>
                    <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] text-center">
                      <button
                        onClick={() => handleViewDetailedReport(report)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        View Detailed Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detailed Report</h3>
              <button
                onClick={closeModal}
                className="text-[var(--foreground)] hover:text-red-500 text-xl"
              >
                ×
              </button>
            </div>
            <div className="mb-4">
              <p className="text-[var(--foreground)]"><strong>Score:</strong> {selectedReport.score}</p>
              <p className="text-[var(--foreground)]"><strong>Date & Time:</strong> {new Date(selectedReport.dateTime).toLocaleString()}</p>
            </div>
            {selectedReport.detailedReport && selectedReport.detailedReport.length > 0 ? (
              <div>
                <h4 className="text-md font-semibold mb-2">Question Details:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-[var(--card-bg)] border border-[var(--border-color)]">
                    <thead>
                      <tr className="bg-[var(--secondary-bg)]">
                        <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Question</th>
                        <th className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)]">Correct</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.detailedReport.map((item: any, index: number) => (
                        <tr key={index} className="hover:bg-[var(--secondary-bg)]">
                          <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] text-left">
                            <div className="mb-2">
                              {(() => {
                                const question = questions.find(q => q.id === item.questionId);
                                const screen = screens.find(s => s.id === question?.screenId);
                                const testLevel = testLevels.find(t => t.id === screen?.id);

                                return (
                                  <>
                                    <strong>
                                      Test Level {screen?.testLevelId || 'N/A'} Screen {screen?.screenNumber || 'N/A'}:
                                    </strong>{' '}
                                    {question?.text || 'N/A'}
                                  </>
                                );
                              })()}

                            </div>
                            {(() => {
                              const question = questions.find(q => q.id === item.questionId);
                              return question?.options && question.options.length > 0 ? (
                                <div className="text-sm text-gray-600">
                                  <strong>Options:</strong>
                                  <ul className="list-disc list-inside mt-1">
                                    {question.options.map((opt: any) => (
                                      <li key={opt.id} className={opt.id === item.option?.id ? 'font-semibold text-blue-600' : ''}>
                                        {opt.text}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null;
                            })()}
                          </td>
                          <td className="py-2 px-4 border-b border-[var(--border-color)] text-[var(--foreground)] text-center">
                            {item.isCorrect ? (
                              <span className="text-green-500 font-semibold">✓ Correct</span>
                            ) : (
                              <span className="text-red-500 font-semibold">✗ Incorrect</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-[var(--foreground)]">No detailed report available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
