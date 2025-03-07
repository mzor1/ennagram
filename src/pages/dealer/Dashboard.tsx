import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Users, CheckCircle, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DealerStats {
  totalStudents: number;
  completedTests: number;
  personalityTypes: {
    type: number;
    count: number;
  }[];
}

const DealerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DealerStats>({
    totalStudents: 0,
    completedTests: 0,
    personalityTypes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dealer/stats');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError('İstatistikler yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchStats();
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Bayi Paneli</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Hoş Geldiniz, {user?.name}</h2>
        <p className="text-gray-600">
          Bu panelden öğrencilerinizi yönetebilir ve test sonuçlarını görüntüleyebilirsiniz.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-indigo-100 p-3 rounded-full mr-4">
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Toplam Öğrenci</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Tamamlanan Test</p>
            <p className="text-2xl font-bold text-gray-800">{stats.completedTests}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <BarChart2 className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Test Tamamlama Oranı</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalStudents > 0 
                ? `${Math.round((stats.completedTests / stats.totalStudents) * 100)}%` 
                : '0%'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Hızlı Erişim</h3>
          <div className="space-y-2">
            <Link 
              to="/dealer/students" 
              className="block bg-indigo-50 hover:bg-indigo-100 p-3 rounded-lg text-indigo-700 transition duration-200"
            >
              Öğrencileri Yönet
            </Link>
            <Link 
              to="/dealer/add-student" 
              className="block bg-indigo-50 hover:bg-indigo-100 p-3 rounded-lg text-indigo-700 transition duration-200"
            >
              Yeni Öğrenci Ekle
            </Link>
            <Link 
              to="/dealer/test-results" 
              className="block bg-indigo-50 hover:bg-indigo-100 p-3 rounded-lg text-indigo-700 transition duration-200"
            >
              Test Sonuçlarını Görüntüle
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Kişilik Tipi Dağılımı</h3>
          {stats.personalityTypes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Henüz test sonucu bulunmamaktadır.</p>
          ) : (
            <div className="space-y-3">
              {stats.personalityTypes.map((type) => (
                <div key={type.type} className="flex items-center">
                  <div className="w-8 text-gray-700 font-medium">Tip {type.type}</div>
                  <div className="flex-1 mx-2">
                    <div className="bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-indigo-600 h-4 rounded-full" 
                        style={{ 
                          width: `${(type.count / stats.completedTests) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-8 text-right text-gray-700">{type.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealerDashboard;