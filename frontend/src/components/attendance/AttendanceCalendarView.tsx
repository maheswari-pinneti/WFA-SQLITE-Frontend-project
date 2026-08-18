import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 16 }, (_, i) => (2020 + i).toString()); // 2020 to 2035

export const AttendanceCalendarView: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2026');

  const monthIndex = MONTHS.indexOf(selectedMonth);
  const yearNum = parseInt(selectedYear, 10);

  // Dynamic calculations for days and starting weekday
  const daysInMonth = new Date(yearNum, monthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(yearNum, monthIndex, 1).getDay(); // 0: Sun, 1: Mon, etc.

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: firstDayOfWeek });

  const handlePrevMonth = () => {
    if (monthIndex === 0) {
      setSelectedMonth('December');
      setSelectedYear((prev) => (parseInt(prev, 10) - 1).toString());
    } else {
      setSelectedMonth(MONTHS[monthIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    if (monthIndex === 11) {
      setSelectedMonth('January');
      setSelectedYear((prev) => (parseInt(prev, 10) + 1).toString());
    } else {
      setSelectedMonth(MONTHS[monthIndex + 1]);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setSelectedMonth(MONTHS[today.getMonth()]);
    setSelectedYear(today.getFullYear().toString());
  };

  return (
    <div className="w-full bg-[#0a1124] border border-slate-800/80 rounded-3xl p-6 shadow-2xl font-sans text-slate-200 space-y-6">
      
      {/* Calendar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {/* Prev Button */}
          <button 
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          {/* Next Button */}
          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>

          {/* Month Dropdown Selector */}
          <div className="relative">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-slate-800/60 hover:bg-slate-700/60 border border-slate-800 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Year Dropdown Selector */}
          <div className="relative">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-slate-800/60 hover:bg-slate-700/60 border border-slate-800 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Today Button */}
        <button 
          onClick={handleGoToToday}
          className="px-4 py-2 bg-slate-800/65 hover:bg-slate-700/65 border border-slate-800 text-xs font-bold rounded-xl text-slate-200 transition-colors cursor-pointer"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid Container */}
      <div className="space-y-4">
        
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 tracking-wider">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {/* Empty Slots */}
          {emptySlots.map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square flex items-center justify-center text-sm font-semibold text-slate-700" />
          ))}

          {/* Day numbers */}
          {days.map((day) => {
            const dayOfWeek = (day + firstDayOfWeek) % 7;
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isToday = day === 5 && selectedMonth === 'August' && selectedYear === '2026';
            const isPresent = day === 3 || day === 4 || day === 5;

            let textClass = 'text-slate-400 font-semibold';
            let borderClass = 'border-transparent';
            let bgClass = 'bg-transparent';

            if (isWeekend) {
              textClass = 'text-slate-600 font-medium';
            } else if (isPresent) {
              textClass = 'text-emerald-400 font-bold';
            }

            if (isToday) {
              borderClass = 'border-slate-300/80';
              bgClass = 'bg-slate-800/20';
              textClass = 'text-emerald-400 font-black';
            }

            return (
              <div 
                key={day} 
                className={`aspect-square flex items-center justify-center text-sm rounded-xl border-2 transition-all hover:scale-105 cursor-pointer ${borderClass} ${bgClass} ${textClass}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
