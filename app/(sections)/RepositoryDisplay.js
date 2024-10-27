import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function RepositoryDisplay({ username }) {
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const handleLanguageChange = (language) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((lang) => lang !== language)
        : [...prev, language]
    );
  };

  return (
    <>
      {repos.length > 0 && (
        <div className="mt-6 border rounded-xl border-[#242424] p-10">
          {/* ... existing code ... */}
          <div className="flex items-center justify-center flex-wrap space-x-2 space-y-4">
            {/* ... GitHub Pages checkbox ... */}
            {Object.entries(languages).map(([lang, count]) => (
              <div key={lang} className="relative inline-block cursor-pointer">
                <Checkbox
                  id={`lang-${lang}`}
                  checked={selectedLanguages.includes(lang)}
                  onCheckedChange={() => handleLanguageChange(lang)}
                  className="sr-only"
                />
                <Label
                  htmlFor={`lang-${lang}`}
                  className={`px-2 py-1 rounded ${
                    selectedLanguages.includes(lang)
                      ? "bg-[#00D1B2] text-white"
                      : "bg-transparent text-[#00D1B2]"
                  } transition-colors shadow-2xl border border-[#00D1B2] cursor-pointer rounded-[25px] duration-200 ease-in-out`}
                >
                  {lang} ({count})
                </Label>
              </div>
            ))}
          </div>
          {/* ... rest of the component ... */}
        </div>
      )}
    </>
  );
}
