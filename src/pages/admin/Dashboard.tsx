import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Users, UserCheck, BarChart } from 'lucide-react';

interface Stats {
  totalDealers: number;
  totalStudents: number;
  completedTests: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalDealers: 0,
    totalStudents: 0,
    completedTests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/stats');
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Paneli</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Hoş Geldiniz, {user?.name}</h2>
        <p className="text-gray-600">
          Bu panelden tüm bayileri ve öğrencileri yönetebilir, sistem istatistiklerini görüntüleyebilirsiniz.
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
            <p className="text-gray-500 text-sm">Toplam Bayi</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalDealers}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Toplam Öğrenci</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <BarChart className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Tamamlanan Test</p>
            <p className="text-2xl font-bold text-gray-800">{stats.completedTests}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Hızlı Erişim</h3>
          <div className="space-y-2">
            <a 
              href="/admin/dealers" 
              className="block bg-indigo-50 hover:bg-indigo-100 p-3 rounded-lg text-indigo-700 transition duration-200"
            >
              Bayileri Yönet
            </a>
            <a 
              href="/admin/students" 
              className="block bg-indigo-50 hover:bg-indigo-100 p-3 rounded-lg text-indigo-700 transition duration-200"
            >
              Tüm Öğrencileri Görüntüle
            </a>
            <a 
              href="/admin/test-results" 
              className="block bg-indigo-50 hover:bg-indigo-100 p-3 rounded-lg text-indigo-700 transition duration-200"
            >
              Test Sonuçlarını Analiz Et
            </a>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Sistem Bilgileri</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Enneagram Tipleri:</span>
              <span className="font-medium">9 Tip</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Toplam Soru Sayısı:</span>
              <span className="font-medium">45 Soru</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Son Güncelleme:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;