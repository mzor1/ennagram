import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { ClipboardCheck, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StudentInfo {
  hasCompletedTest: boolean;
  personalityType?: number;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    hasCompletedTest: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/student/info');
        setStudentInfo(response.data);
        setLoading(false);
      } catch (err) {
        setError('Bilgiler yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchStudentInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Öğrenci Paneli</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="bg-indigo-100 p-3 rounded-full mr-4">
            <User className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Hoş Geldiniz, {user?.name}</h2>
            <p className="text-gray-500">Enneagram kişilik testine hoş geldiniz</p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex items-center mb-2">
            <ClipboardCheck className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700">Test Durumu:</span>
            <span className={`ml-2 ${studentInfo.hasCompletedTest ? 'text-green-600' : 'text-red-500'}`}>
              {studentInfo.hasCompletedTest ? 'Tamamlandı' : 'Tamamlanmadı'}
            </span>
          </div>
          
          {studentInfo.hasCompletedTest && studentInfo.personalityType && (
            <div className="flex items-center mb-4">
              <ClipboardCheck className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-700">Kişilik Tipiniz:</span>
              <span className="ml-2 bg-indigo-100 text-indigo-800 py-1 px-2 rounded-full text-sm font-medium">
                Tip {studentInfo.personalityType}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!studentInfo.hasCompletedTest ? (
          <div className="bg-indigo-50 rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
            <h3 className="text-lg font-semibold text-indigo-700 mb-2">Enneagram Testini Tamamlayın</h3>
            <p className="text-gray-600 mb-4">
              Kişilik tipinizi öğrenmek ve detaylı analizinizi görmek için testi tamamlayın.
            </p>
            <Link 
              to="/test" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-indigo-700 transition duration-200"
            >
              Teste Başla
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-green-700 mb-2">Test Tamamlandı</h3>
            <p className="text-gray-600 mb-4">
              Tebrikler! Enneagram testini tamamladınız. Detaylı sonuçlarınızı görüntüleyebilirsiniz.
            </p>
            <Link 
              to="/results" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-green-700 transition duration-200"
            >
              Sonuçları Görüntüle
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Enneagram Nedir?</h3>
          <p className="text-gray-600 mb-4">
            Enneagram, kişilik tiplerini dokuz farklı kategoride inceleyen bir sistemdir. 
            Her bir tip, belirli düşünce, duygu ve davranış kalıplarını temsil eder.
          </p>
          <p className="text-gray-600">
            Bu test, kişilik özelliklerinizi analiz ederek size en uygun Enneagram tipini belirler 
            ve kişisel gelişiminiz için öneriler sunar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;