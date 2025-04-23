import React, { useState, useEffect } from 'react';
import './Main.css';

const HOURS = {
  start: 8,
  end: 15
};

const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const users = [
  { id: 'adil', name: 'Адилет', role: 'student' },
  { id: 'admin', name: 'Админ', role: 'admin' }
];

const Main = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [isPresent, setIsPresent] = useState(false);
  const [lastPresenceTime, setLastPresenceTime] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const login = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPresent && lastPresenceTime) {
        const now = new Date();
        const diff = (now - lastPresenceTime) / 1000 / 60;

        if (diff > 30 && now.getHours() >= HOURS.start && now.getHours() < HOURS.end) {
          markAttendance('skipped', lastPresenceTime.toISOString().split('T')[0]);
          setIsPresent(false);
          setLastPresenceTime(null);
        }
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [isPresent, lastPresenceTime]);

  const markAttendance = (status, dateStr, studentId = currentUser?.id) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [dateStr]: status
      }
    }));
  };

  const handleTurnstileEntry = () => {
    const now = new Date();
    if (currentUser?.role === 'student') {
      markAttendance('present', now.toISOString().split('T')[0]);
      setLastPresenceTime(now);
      setIsPresent(true);
    }
  };

  const handleTurnstileExit = () => {
    const now = new Date();
    if (currentUser?.role === 'student') {
      markAttendance('absent', now.toISOString().split('T')[0]);
      setIsPresent(false);
      setLastPresenceTime(null);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const getYearlyDays = () => {
    const days = [];
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const today = new Date();
    while (start <= today) {
      days.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return days;
  };

  const days = getYearlyDays();

  const getColorClass = (dateStr) => {
    const id = currentUser?.role === 'admin' ? selectedStudentId : currentUser?.id;
    if (!id || !attendance[id]) return 'square';
    const status = attendance[id][dateStr];
    if (status === 'present') return 'square green';
    if (status === 'absent') return 'square red';
    if (status === 'skipped') return 'square yellow';
    return 'square';
  };

  const countMonthlyAttendance = () => {
    const counts = {};
    const studentId = currentUser?.role === 'admin' ? selectedStudentId : currentUser?.id;
    const studentAttendance = attendance[studentId] || {};
    Object.entries(studentAttendance).forEach(([date, status]) => {
      if (status === 'present') {
        const month = new Date(date).getMonth();
        counts[month] = (counts[month] || 0) + 1;
      }
    });
    return counts;
  };

  const monthlyCounts = countMonthlyAttendance();

  const getMonthlyDays = (monthIndex) => {
    const start = new Date(new Date().getFullYear(), monthIndex, 1);
    const end = new Date(new Date().getFullYear(), monthIndex + 1, 0);
    const daysInMonth = [];
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      daysInMonth.push(new Date(d));
    }
    return daysInMonth;
  };

  const handleSquareClick = (dateStr) => {
    if (currentUser?.role === 'admin' && selectedStudentId) {
      const currentStatus = attendance[selectedStudentId]?.[dateStr];
      const newStatus = currentStatus === 'present' ? 'absent' : 'present';
      markAttendance(newStatus, dateStr, selectedStudentId);
    }
  };

  return (
    <div className={`container ${isDarkMode ? 'dark' : 'light'}`}>
      {!currentUser ? (
        <div className="login">
          <button onClick={() => login('adil')}>Войти как студент</button>
          <button onClick={() => login('admin')}>Войти как админ</button>
        </div>
      ) : (
        <div>
          <h2>Присутствие: {currentUser.name}</h2>
          {currentUser.role === 'admin' && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <label htmlFor="student-select">Выберите студента: </label>
              <select
                id="student-select"
                value={selectedStudentId || ''}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="" disabled>-- Студент --</option>
                {users.filter(u => u.role === 'student').map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </div>
          )}
          {currentUser.role === 'student' && (
            <div>
              <button className="turnstile-button" onClick={handleTurnstileEntry}>
                Проход турникета
              </button>
              <button className="turnstile-button" onClick={handleTurnstileExit}>
                Выход из турникета
              </button>
            </div>
          )}
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? 'Светлая тема' : 'Тёмная тема'}
          </button>
          <div className="heatmap-container">
            <div className="heatmap">
              {months.map((month, i) => {
                const monthlyDays = getMonthlyDays(i);
                return (
                  <div key={i} className="month">
                    <h3>{month}</h3>
                    <div className="month-grid">
                      {monthlyDays.map((date, index) => {
                        const dateStr = date.toISOString().split('T')[0];
                        return (
                          <div
                            key={index}
                            title={dateStr}
                            className={getColorClass(dateStr)}
                            onClick={() => handleSquareClick(dateStr)}
                          ></div>
                        );
                      })}
                    </div>
                    <div className="month-stats">
                      {month}: {monthlyCounts[i] || 0} посещений
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
