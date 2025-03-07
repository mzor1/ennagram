import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { usePDF } from 'react-to-pdf';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Star,
  BookOpen,
  Users,
  Briefcase,
  Heart,
  Brain,
  School,
  Home
} from 'lucide-react';

interface TestResult {
  personalityType: number;
  typeName: string;
  summary: string;
  description: string;
  positiveTraits: string[];
  negativeTraits: string[];
  secondaryTypes: {
    type: number;
    typeName: string;
    compatibility: number;
  }[];
  motivatingFactors: string[];
  demotivatingFactors: string[];
  learningEnvironment: string[];
  learningStyle: string[];
  teacherApproach: string[];
  socialLife: string;
  parentAdvice: string[];
  careerTraits: string[];
  suitableCareers: string[];
}

const TestResults: React.FC = () => {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    traits: true,
    secondary: true,
    motivation: true,
    learning: true,
    social: true,
    parent: true,
    career: true
  });
  
  const { toPDF, targetRef } = usePDF({
    filename: 'enneagram-test-sonucu.pdf',
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/student/results');
        setResult(response.data);
        setLoading(false);
      } catch (err) {
        setError('Test sonuçları yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        {error || 'Test sonuçları bulunamadı. Lütfen önce testi tamamlayın.'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Enneagram Test Sonuçları</h1>
        <button
          onClick={() => toPDF()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition duration-200"
        >
          <Download className="h-5 w-5 mr-2" />
          PDF İndir
        </button>
      </div>
      
      <div ref={targetRef} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="text-center mb-8">
          <div className="inline-block bg-indigo-100 text-indigo-800 text-xl font-bold px-4 py-2 rounded-full mb-2">
            Tip {result.personalityType}: {result.typeName}
          </div>
          <p className="text-gray-600 italic">{result.summary}</p>
        </div>
        
        {/* Mizaç Özet Tablosu */}
        <div className="mb-8">
          <div 
            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg cursor-pointer"
            onClick={() => toggleSection('summary')}
          >
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Mizaç Özet Tablosu</h2>
            </div>
            {expandedSections.summary ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          
          {expandedSections.summary && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg">
              <p className="text-gray-700 whitespace-pre-line">{result.description}</p>
            </div>
          )}
        </div>
        
        {/* Olumlu ve Olumsuz Özellikler */}
        <div className="mb-8">
          <div 
            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg cursor-pointer"
            onClick={() => toggleSection('traits')}
          >
            <div className="flex items-center">
              <Star className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Olumlu Potansiyeller ve Olumsuzluğa Yatkın Özellikler</h2>
            </div>
            {expandedSections.traits ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          
          {expandedSections.traits && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-green-800 font-medium mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Olumlu Potansiyeller
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.positiveTraits.map((trait, index) => (
                    <li key={index} className="text-gray-700">{trait}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-red-800 font-medium mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Olumsuzluğa Yatkın Özellikler
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.negativeTraits.map((trait, index) => (
                    <li key={index} className="text-gray-700">{trait}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Yan Mizaç Özellikleri */}
        <div className="mb-8">
          <div 
            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg cursor-pointer"
            onClick={() => toggleSection('secondary')}
          >
            <div className="flex items-center">
              <Users className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Yan Mizaç Özellikleri</h2>
            </div>
            {expandedSections.secondary ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          
          {expandedSections.secondary && (
            <div className="mt-4 space-y-4">
              {result.secondaryTypes.map((type) => (
                <div key={type.type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800">
                      Tip {type.type}: {type.typeName}
                    </h3>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Uyumluluk:</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < type.compatibility ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Motivasyon Faktörleri */}
        <div className="mb-8">
          <div 
            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg cursor-pointer"
            onClick={() => toggleSection('motivation')}
          >
            <div className="flex items-center">
              <Heart className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Motivasyonunu Artıran ve Azaltan Durumlar</h2>
            </div>
            {expandedSections.motivation ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          
          {expandedSections.motivation && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-blue-800 font-medium mb-2">Motivasyonunu Artıran Durumlar</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.motivatingFactors.map((factor, index) => (
                    <li key={index} className="text-gray-700">{factor}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-orange-800 font-medium mb-2">Motivasyonunu Azaltan Durumlar</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.demotivatingFactors.map((factor, index) => (
                    <li key={index} className="text-gray-700">{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Öğrenme ve Çalışma */}
        <div className="mb-8">
          <div 
            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg cursor-pointer"
            onClick={() => toggleSection('learning')}
          >
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Öğrenme, Çalışma ve Eğitim</h2>
            </div>
            {expandedSections.learning ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          
          {expandedSections.learning && (
            <div className="mt-4 space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <School className="h-4 w-4 mr-2 text-indigo-600" />
                  Öğrenme ve Çalışma Ortamı – Tavsiyeler
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.learningEnvironment.map((item, index) => (
                    <li key={index} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-indigo-600" />
                  Öğrenme, Çalışma ve Dikkat Tarzı – Eğitsel Rehberlik
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.learningStyle.map((item, index) => (
                    <li key={index} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-indigo-600" />
                  Eğitimciden Beklediği Yaklaşım - Tavsiyeler
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.teacherApproach.map((item, index) => (
                    <li key={index} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Sosyal Hayat */}
        <div className="mb-8">
          <div 
            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg cursor-pointer"
            onClick={() => toggleSection('social')}
          >
            <div className="flex items-center">
              <Users className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Sosyal Hayatı</h2>
            </div>
            {expandedSections.social ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          
          {expandedSections.social && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg">
              <p className="text-gray-700 whitespace-pre-line">{result.socialLife}</p>
            </div>
          )}
        </div>
        
        {/* Ebeveynlere Öneriler */}
        <div className="mb-8">
          <div 
            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg cursor-pointer"
            onClick={() => toggleSection('parent')}
          >
            <div className="flex items-center">
              <Home className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Ebeveynlere Öneriler</h2>
            </div>
            {expandedSections.parent ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          
          {expandedSections.parent && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg">
              <ul className="list-disc list-inside space-y-1">
                {result.parentAdvice.map((advice, index) => (
                  <li key={index} className="text-gray-700">{advice}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* İş Özellikleri ve Meslekler */}
        <div className="mb-8">
          <div 
            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg cursor-pointer"
            onClick={() => toggleSection('career')}
          >
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">İş Özellikleri ve Yatkın Olduğu Meslekler</h2>
            </div>
            {expandedSections.career ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          
          {expandedSections.career && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">İş Özellikleri</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.careerTraits.map((trait, index) => (
                    <li key={index} className="text-gray-700">{trait}</li>
                  ))}
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Yatkın Olduğu Meslekler</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.suitableCareers.map((career, index) => (
                    <li key={index} className="text-gray-700">{career}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Bu sonuçlar Enneagram kişilik testi analizine dayanmaktadır. 
            Kişisel gelişiminiz için bir rehber olarak kullanabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestResults;