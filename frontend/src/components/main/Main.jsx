import React, { useState, useEffect } from 'react';
import './Main.css';

const HOURS = {
  start: 8,
  end: 15
};

const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const emp = {
  group: {
    it1: [
      { name: 'Абдрахманов Ислам', id: '10001', password: '10001' },
      { name: 'Акматалыева Альбина', id: '10002', password: '10002' },
      { name: 'Асангалыева Сабина', id: '10003', password: '10003' },
      { name: 'Асмат Махнур', id: '10004', password: '10004' },
      { name: 'Ашимова Сайкал', id: '10005', password: '10005' },
      { name: 'Аюпов Дильяр', id: '10006', password: '10006' },
      { name: 'Докдурбаев Адилет', id: '11488', password: '11488' },
      { name: 'Кочкуров Богдан', id: '10008', password: '10008' },
      { name: 'Люцкан Сахиб', id: '10009', password: '10009' },
      { name: 'Мендибаев Марсель', id: '17777', password: '17777' }
    ],
    it2: [
      { name: 'Назарбеков Тилек', id: '10011', password: '10011' },
      { name: 'Русланов Данияр', id: '10012', password: '10012' },
      { name: 'Сабиров Азим', id: '10013', password: '10013' },
      { name: 'Сабыркулов Атабек', id: '14444', password: '14444' },
      { name: 'Сайдинов Баэл', id: '10015', password: '10015' },
      { name: 'Тогузбаев Даниэль', id: '10016', password: '10016' },
      { name: 'Торомырзаева Тахмина', id: '10017', password: '10017' },
      { name: 'Туратбеков Атлант', id: '10018', password: '10018' },
      { name: 'Хабибрахманов Руфат', id: '15051', password: '15051' },
      { name: 'Эшеналиева Софи', id: '10020', password: '10020' }
    ]
  }
};

const admins = [
  { id: 'admin', password: 'admin123', name: 'Админ' }
];

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

  const allStudents = [...emp.group.it1, ...emp.group.it2];

  const login = () => {
    const admin = admins.find(a => a.id === loginId && a.password === password);
    if (admin) {
      setCurrentUser({ id: admin.id, name: admin.name, role: 'admin' });
      setError('');
      return;
    }
    const student = allStudents.find(s => s.id === loginId && s.password === password);
    if (student) {
      setCurrentUser({ id: student.id, name: student.name, role: 'student' });
      setError('');
    } else {
      setError('Неверный логин или пароль');
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
    const updatedAttendance = {
      ...attendance,
      [studentId]: {
        ...(attendance[studentId] || {}),
        [dateStr]: status
      }
    };

    // Сохраняем обновленную посещаемость в localStorage
    setAttendance(updatedAttendance);
    localStorage.setItem('attendance', JSON.stringify(updatedAttendance));
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
