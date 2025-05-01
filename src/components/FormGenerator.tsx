import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { supabase } from '../lib/supabase';
import { Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export function FormGenerator() {
  const [formData, setFormData] = useState({});
  const [questions, setQuestions] = useState([
    { id: 1, text: 'Question 1' },
    { id: 2, text: 'Question 2' },
  ]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
      console.log("Fetched userId:", session?.user?.id); // Debugging: Check userId value
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (userId) {
      checkAdminStatus();
    }
  }, [userId]); // checkAdminStatus when userId changes

  const checkAdminStatus = async () => {
    if (!userId) {
      console.warn("User ID is null, cannot check admin status."); // Debugging: Check if userId is null
      return;
    }
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error); // Debugging: Check for errors
        toast.error(error.message);
        return;
      }

      console.log("Fetched profile:", profile); // Debugging: Check profile data
      setIsAdmin(profile?.role === 'admin');
    } catch (error: any) {
      console.error("Error checking admin status:", error); // Debugging: Check for errors
      toast.error(error.message);
      setIsAdmin(false);
    }
  };

  const handleInputChange = (questionId: number, value: string) => {
    setFormData({
      ...formData,
      [questionId]: value,
    });
  };

  const generateReport = async () => {
    if (!userId) {
      toast.error("User ID not found. Please refresh the page.");
      return;
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add form data to the PDF
    let yOffset = 350;
    for (const question of questions) {
      const answer = formData[question.id] || 'N/A';
      page.drawText(`${question.text}: ${answer}`, {
        x: 50,
        y: yOffset,
        font,
        size: 12,
        color: rgb(0, 0, 0),
      });
      yOffset -= 20;
    }

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // Trigger the browser to download the PDF
    saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'generated-form.pdf');
  };

  const handleAddQuestion = () => {
    const newQuestionId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
    setQuestions([...questions, { id: newQuestionId, text: `Question ${newQuestionId}` }]);
  };

  const handleQuestionChange = (id: number, text: string) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, text } : q)));
  };

  const handleRemoveQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Form Generator</h1>
        {isAdmin && (
          <button
            onClick={toggleSettings}
            className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100"
          >
            <Settings className="h-5 w-5" />
          </button>
        )}
      </div>

      {isAdmin && showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h2 className="text-xl font-semibold mb-3">Form Settings</h2>
          {questions.map(question => (
            <div key={question.id} className="mb-4 flex items-center">
              <label htmlFor={`question-${question.id}`} className="block text-sm font-medium text-gray-700 mr-3">
                Question {question.id}:
              </label>
              <input
                type="text"
                id={`question-${question.id}`}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mr-3"
                value={question.text}
                onChange={e => handleQuestionChange(question.id, e.target.value)}
              />
              <button
                onClick={() => handleRemoveQuestion(question.id)}
                className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={handleAddQuestion}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Add Question
          </button>
        </div>
      )}

      {questions.map((question) => (
        <div key={question.id} className="mb-4">
          <label htmlFor={`question-${question.id}`} className="block text-sm font-medium text-gray-700">
            {question.text}
          </label>
          <input
            type="text"
            id={`question-${question.id}`}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          />
        </div>
      ))}
      <button
        onClick={generateReport}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Generate Report
      </button>
    </div>
  );
}
