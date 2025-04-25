  
import React, { useState, useEffect } from 'react';
import './Main.css';
const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const Main = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [attendance, setAttendance] = useState(() => {
    const savedAttendance = localStorage.getItem('attendance');
    return savedAttendance ? JSON.parse(savedAttendance) : {};
  });
  const [turnstileStatus, setTurnstileStatus] = useState(() => {
    const savedStatus = localStorage.getItem('turnstileStatus');
    return savedStatus || '';
  });
  const [turnstileEntryTime, setTurnstileEntryTime] = useState(() => {
    const savedEntryTime = localStorage.getItem('turnstileEntryTime');
    return savedEntryTime ? new Date(savedEntryTime) : null;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [error, setError] = useState('');
  const [lastAction, setLastAction] = useState(null);
  const [monthlyCounts, setMonthlyCounts] = useState(() => {
    const savedCounts = localStorage.getItem('monthlyCounts');
    return savedCounts ? JSON.parse(savedCounts) : {};
  });
  // Функция для определения статуса посещения на основе времени
  const determineAttendanceStatus = (entryTime) => {
    const hour = entryTime.getHours();
    if (hour < 9) return 'present';
    if (hour < 10) return 'late';
    return 'absent';
  };
  // Обновленная функция входа
  const login = async () => {
    try {
      const response = await fetch('http://10.10.51.82:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId }),
      });
      
      const data = await response.json();
      if (response.ok) {
        const { id, name, role, attendance: userAttendance } = data;
        const user = { id, name, role };
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        
        const updatedAttendance = {
          ...attendance,
          [id]: userAttendance,
        };
        localStorage.setItem('attendance', JSON.stringify(updatedAttendance));
        setAttendance(updatedAttendance);
        setError('');
      } else {
        setError(data.message || 'Неверный логин');
      }
    } catch (error) {
      setError('Произошла ошибка при подключении к серверу');
    }
  };
  // Функция выхода из системы
  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('attendance');
    localStorage.removeItem('turnstileStatus');
    localStorage.removeItem('turnstileEntryTime');
    localStorage.removeItem('monthlyCounts');
    localStorage.removeItem('lastAction');
    setCurrentUser(null);
    setAttendance({});
    setTurnstileStatus('');
    setTurnstileEntryTime(null);
    setMonthlyCounts({});
    setLastAction(null);
  };
  // Функция отметки посещаемости
  const markAttendance = (status, dateStr, studentId = currentUser?.id) => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    let attendanceStatus;
    if (status === 'present') {
      if (hour < 9) {
        attendanceStatus = 'present';
      } else if (hour === 9 && minute <= 15) {
        attendanceStatus = 'present';
      } else if (hour === 9 || (hour === 10 && minute <= 0)) {
        attendanceStatus = 'late';
      } else {
        attendanceStatus = 'absent';
      }
    } else {
      attendanceStatus = status;
    }
    const updatedAttendance = {
      ...attendance,
      [studentId]: {
        ...(attendance[studentId] || {}),
        [dateStr]: {
          status: attendanceStatus,
          time: now.toISOString(),
          details: {
            entryTime: now.toISOString(),
            isLate: attendanceStatus === 'late',
            minutesLate: attendanceStatus === 'late' ? 
              (hour - 9) * 60 + minute : 0
          }
        },
      },
    };
    setAttendance(updatedAttendance);
    localStorage.setItem('attendance', JSON.stringify(updatedAttendance));
    if (attendanceStatus === 'present' || attendanceStatus === 'late') {
      incrementMonthlyAttendance(dateStr);
    }
  };
  // Функция подсчета посещений
  const incrementMonthlyAttendance = (dateStr) => {
    const month = new Date(dateStr).getMonth();
    const updatedCounts = { ...monthlyCounts };
    updatedCounts[month] = (updatedCounts[month] || 0) + 1;
    localStorage.setItem('monthlyCounts', JSON.stringify(updatedCounts));
    setMonthlyCounts(updatedCounts);
  };
  // Функция прохода через турникет
  const handleTurnstilePass = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    if (currentUser?.role === 'student') {
      if (lastAction === 'exit') {
        markAttendance('present', dateStr);
        setTurnstileStatus('green');
        setTurnstileEntryTime(now);
        setLastAction('entry');
        
        localStorage.setItem('turnstileStatus', 'green');
        localStorage.setItem('turnstileEntryTime', now.toISOString());
        localStorage.setItem('lastAction', 'entry');
        
        setTimeout(() => {
          setTurnstileStatus('');
          localStorage.setItem('turnstileStatus', '');
        }, 3000);
      } else {
        setError('Необходимо сначала выйти');
      }
    }
  };
  // Функция выхода через турникет
  const handleTurnstileExit = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    if (currentUser?.role === 'student') {
      if (lastAction !== 'exit') {
        markAttendance('absent', dateStr);
        setTurnstileStatus('red');
        setTurnstileEntryTime(null);
        setLastAction('exit');
        
        localStorage.setItem('turnstileStatus', 'red');
        localStorage.removeItem('turnstileEntryTime');
        localStorage.setItem('lastAction', 'exit');
        
        setTimeout(() => {
          setTurnstileStatus('');
          localStorage.setItem('turnstileStatus', '');
        }, 3000);
      } else {
        setError('Необходимо сначала войти');
      }
    }
  };
  // Вспомогательные функции
  const getMonthlyDays = (monthIndex) => {
    const start = new Date(new Date().getFullYear(), monthIndex, 1);
    const end = new Date(new Date().getFullYear(), monthIndex + 1, 0);
    const daysInMonth = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      daysInMonth.push(new Date(d));
    }
    return daysInMonth;
  };
  const getColorClass = (dateStr) => {
    const id = currentUser?.id;
    if (!id || !attendance[id]) return 'square';
    const record = attendance[id][dateStr];
    if (!record) return 'square';
    
    switch (record.status) {
      case 'present': return 'square green';
      case 'late': return 'square yellow';
      case 'absent': return 'square red';
      default: return 'square';
    }
  };
  const getTodayDateStr = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  // Загрузка последнего действия при монтировании
  useEffect(() => {
    const savedLastAction = localStorage.getItem('lastAction');
    if (savedLastAction) {
      setLastAction(savedLastAction);
    }
  }, []);
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
          <button onClick={login}>Войти</button>
          {error && <div className="error">{error}</div>}
        </div>
      ) : (
        <div>
          <h2 className="Att">Присутствие: {currentUser.name}</h2>
          <button onClick={logout}>Выйти</button>
          
          {currentUser.role === 'student' && (
            <div className="turnstile-controls">
              <button
                className="turnstile-button"
                onClick={handleTurnstilePass}
                data-status={turnstileStatus === 'green' ? 'green' : ''}
              >
                Войти через турникет
              </button>
              <button
                className="turnstile-button"
                onClick={handleTurnstileExit}
                data-status={turnstileStatus === 'red' ? 'red' : ''}
              >
                Выйти через турникет
              </button>
            </div>
          )}
          {currentUser.role === 'admin' && (
            <div className="admin-panel">
              <h3>Панель администратора</h3>
              <div className="admin-controls">
                <button onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? 'Светлая тема' : 'Темная тема'}
                </button>
              </div>
            </div>
          )}
          <div className="months-container">
            {months.map((month, index) => (
              <div key={month} className="month">
                <h3>{month}</h3>
                <div className="month-grid">
                  {getMonthlyDays(index).map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    return (
                      <div
                        key={dateStr}
                        className={`${getColorClass(dateStr)} ${
                          dateStr === getTodayDateStr() ? 'today' : ''
                        }`}
                        title={dateStr}
                      />
                    );
                  })}
                </div>
                <div className="month-stats">
                  Посещений: {monthlyCounts[index] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default Main;