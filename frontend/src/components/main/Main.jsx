import React, { useState, useEffect } from 'react';
import './Main.css';

const HOURS = {
  start: 8,
  end: 15
};

const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const Main = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [attendance, setAttendance] = useState(() => {
    const savedAttendance = localStorage.getItem('attendance');
    return savedAttendance ? JSON.parse(savedAttendance) : {};
  });
  const [isPresent, setIsPresent] = useState(false);
  const [lastPresenceTime, setLastPresenceTime] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  // Логин
  const login = async () => {
    try {
      const response = await fetch('http://10.10.47.98:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loginId, password }),
      });

      const data = await response.json();
      console.log(data.message)
      if (response.ok) {
        const { id, name, role } = data;
        setCurrentUser({ id, name, role });
        setError('');
      } else {
        setError(data.message || 'Неверный логин или пароль');
      }
    } catch (error) {
      setError('Произошла ошибка при подключении к серверу');
    }
  };

  // Обновление посещаемости в localStorage
  const markAttendance = (status, dateStr, studentId = currentUser?.id) => {
    const updatedAttendance = {
      ...attendance,
      [studentId]: {
        ...(attendance[studentId] || {}),
        [dateStr]: status
      }
    };

    setAttendance(updatedAttendance);
    localStorage.setItem('attendance', JSON.stringify(updatedAttendance));
  };

  // Обработка входа и выхода на турникете
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

  // Тема
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Получение дней месяца
  const getMonthlyDays = (monthIndex) => {
    const start = new Date(new Date().getFullYear(), monthIndex, 1);
    const end = new Date(new Date().getFullYear(), monthIndex + 1, 0);
    const daysInMonth = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      daysInMonth.push(new Date(d));
    }
    return daysInMonth;
  };

  // Получение класса для цвета ячейки (зеленая, красная и т.д.)
  const getColorClass = (dateStr) => {
    const id = currentUser?.role === 'admin' ? selectedStudentId : currentUser?.id;
    if (!id || !attendance[id]) return 'square';
    const status = attendance[id][dateStr];
    if (status === 'present') return 'square green';
    if (status === 'absent') return 'square red';
    if (status === 'skipped') return 'square yellow';
    return 'square';
  };

  // Подсчёт посещений за месяц
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

  // Клик по ячейке посещаемости
  const handleSquareClick = (dateStr) => {
    if (currentUser?.role === 'admin' && selectedStudentId) {
      const currentStatus = attendance[selectedStudentId]?.[dateStr];
      const newStatus = currentStatus === 'present' ? 'absent' : 'present';
      markAttendance(newStatus, dateStr, selectedStudentId);
    }
  };

  const monthlyCounts = countMonthlyAttendance();

  return (
    <div className={`container ${isDarkMode ? 'dark' : 'light'}`}>
      {!currentUser ? (
        <div className="login-form">
          <h2>Вход</h2>
          <input
            type="text"
            placeholder="Логин (ID)"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={login}>Войти</button>
          {error && <div className="error">{error}</div>}
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
                {allStudents.map(student => (
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
