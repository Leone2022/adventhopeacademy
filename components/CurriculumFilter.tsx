'use client';

import { BookOpen } from 'lucide-react';

interface CurriculumFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function CurriculumFilter({ value, onChange }: CurriculumFilterProps) {
  const curricula = [
    { value: '', label: 'All Curricula', icon: '📚' },
    { value: 'ZIMSEC', label: 'ZIMSEC Only', icon: '🇿🇼' },
    { value: 'CAMBRIDGE', label: 'Cambridge Only', icon: '🌐' },
  ];

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <BookOpen className="h-4 w-4 text-blue-600" />
        Curriculum
      </label>
      
      <div className="grid grid-cols-1 gap-2">
        {curricula.map((curr) => (
          <label
            key={curr.value}
            className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <input
              type="radio"
              name="curriculum"
              value={curr.value}
              checked={value === curr.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-lg">{curr.icon}</span>
            <span className="text-sm font-medium text-slate-700">{curr.label}</span>
          </label>
        ))}
      </div>

      {/* Curriculum Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700 font-medium">
          {value === 'ZIMSEC' && '🇿🇼 ZIMSEC (Zimbabwe) - Grades 1-7 scale'}
          {value === 'CAMBRIDGE' && '🌐 Cambridge - A*-U letter grades'}
          {!value && '📚 Select a curriculum to filter students'}
        </p>
      </div>
    </div>
  );
}
