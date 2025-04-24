import React, { useState } from 'react';
import './EntryProcess.css';
const EntryProcess = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [scanStatus, setScanStatus] = useState('waiting'); 
  const [studentInfo, setStudentInfo] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const simulateScanPass = () => {
    setScanStatus('scanning');
    setTimeout(() => {
      setScanStatus('success');
      setStudentInfo({
        id: '10001',
        name: 'Абдрахманов Ислам',
        group: 'IT-1'
      });
      setCurrentStep(2);
    }, 2000);
  };
  const markAttendance = () => {
    setTimeout(() => {
      setAttendanceMarked(true);
      setCurrentStep(3);
    }, 1500);
  };
  return (
    <div className="entry-process">
      <h2>Процесс входа</h2>
      
      <div className="steps">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Сканирование пропуска</h3>
            {currentStep === 1 && (
              <button 
                className={`scan-button ${scanStatus}`}
                onClick={simulateScanPass}
                disabled={scanStatus === 'scanning'}
              >
                {scanStatus === 'waiting' ? 'Начать сканирование' : 
                 scanStatus === 'scanning' ? 'Сканирование...' : 
                 'Сканирование завершено'}
              </button>
            )}
          </div>
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Распознавание профиля</h3>
            {currentStep === 2 && studentInfo && (
              <div className="student-info">
                <p>ID: {studentInfo.id}</p>
                <p>Имя: {studentInfo.name}</p>
                <p>Группа: {studentInfo.group}</p>
                <button onClick={markAttendance}>Подтвердить</button>
              </div>
            )}
          </div>
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Отметка посещаемости</h3>
            {currentStep === 3 && (
              <div className="attendance-status">
                <p className="success">Посещаемость успешно отмечена!</p>
                <p>Проход разрешен</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EntryProcess;