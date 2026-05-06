import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇸' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'ki', name: 'Kikuyu', flag: '🇰🇰' },
    { code: 'ka', name: 'Kalenjin', flag: '🇰🇷' },
    { code: 'lu', name: 'Luo', flag: '🇱🇲' },
    { code: 'kam', name: 'Kamba', flag: '🇰🇲' },
    { code: 'te', name: 'Teso', flag: '🇹🇬' },
    { code: 'ew', name: 'Embu', flag: '🇰🇪' },
    { code: 'mer', name: 'Meru', flag: '🇰🇲' },
    { code: 'pk', name: 'Pokomo', flag: '🇵🇰' },
    { code: 'gi', name: 'Giriama', flag: '🇰🇬' },
    { code: 'ku', name: 'Kuria', flag: '🇰🇷' },
    { code: 'te', name: 'Taita/Taveta', flag: '🇹🇬' },
    { code: 'ew', name: 'Embu', flag: '🇰🇪' },
    { code: 'de', name: 'German', flag: '🇩🇪' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <button
        onClick={() => changeLanguage('en')}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${language === 'en' ? 'border-blue-500' : 'border-gray-200'} hover:border-blue-600 transition-colors`}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {currentLanguage ? currentLanguage.name : 'Language'}
        </span>
        <ChevronDown className="w-3 h-4" />
      </button>
      
      {currentLanguage && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Language</h3>
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-3 py-2 rounded-md border ${language === lang.code ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} hover:border-blue-600 transition-colors`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
