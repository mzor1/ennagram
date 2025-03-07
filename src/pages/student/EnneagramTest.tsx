import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  type: number;
}

const EnneagramTest: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/test/questions');
        setQuestions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Sorular yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const getCurrentQuestions = () => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    return questions.slice(startIndex, startIndex + questionsPerPage);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const isPageComplete = () => {
    const currentQuestions = getCurrentQuestions();
    return currentQuestions.every(q => answers[q.id] !== undefined);
  };

  const isTestComplete = () => {
    return questions.every(q => answers[q.id] !== undefined);
  };

  const handleSubmit = async () => {
    if (!isTestComplete()) {
      setError('Lütfen tüm soruları cevaplayınız.');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post('http://localhost:5000/api/test/submit', { answers });
      navigate('/results');
    } catch (err) {
      setError('Test sonuçları gönderilirken bir hata oluştu.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Enneagram Kişilik Testi</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Sayfa {currentPage} / {totalPages}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Object.keys(answers).length} / {questions.length} Soru Cevaplandı
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-6">
          {getCurrentQuestions().map((question) => (
            <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start mb-4">
                <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-2">
                  {question.id}
                </span>
                <p className="text-gray-800">{question.text}</p>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(question.id, value)}
                    className={`py-2 rounded-lg transition-colors ${
                      answers[question.id] === value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Kesinlikle Katılmıyorum</span>
                <span>Kesinlikle Katılıyorum</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`flex items-center px-4 py-2 rounded-lg ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Önceki
          </button>
          
          {currentPage < totalPages ? (
            <button
              onClick={goToNextPage}
              disabled={!isPageComplete()}
              className={`flex items-center px-4 py-2 rounded-lg ${
                !isPageComplete()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Sonraki
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isTestComplete() || submitting}
              className={`flex items-center px-4 py-2 rounded-lg ${
                !isTestComplete() || submitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Testi Tamamla
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Her soruyu dikkatlice okuyun ve size en uygun cevabı seçin. 
              Test sonuçlarınız kişilik tipinizi belirlemek için kullanılacaktır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnneagramTest;