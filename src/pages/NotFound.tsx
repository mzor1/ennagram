import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-xl text-gray-600 mb-6">Sayfa Bulunamadı</p>
      <Link 
        to="/dashboard" 
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
};

export default NotFound;