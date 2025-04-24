import React from 'react';
import './FAQ.css';
const faqData = [
  {
    id: 1,
    question: "А если я не использую пропускной?",
    answer: "Ты будешь отмечен как прогулявший. Красным цветом"
  },
  {
    id: 2,
    question: "А если я использую чужой пропускной?",
    answer: "Это строго запрещено. За использование чужого пропускного предусмотрены дисциплинарные меры"
  },
  {
    id: 3,
    question: "А если я опаздаю?",
    answer: "Ты будешь отмечен как опоздавший. Желтым цветом"
  },
  {
    id: 4,
    question: "Как работает система турникета?",
    answer: "Система турникета автоматически регистрирует время вашего прихода и ухода, используя ваш персональный пропускной"
  },
  {
    id: 5,
    question: "Что делать если я забыл пропускной?",
    answer: "Необходимо обратиться к администратору для получения временного пропуска"
  }
];
const FAQ = () => {
  const [activeId, setActiveId] = React.useState(null);
  const toggleAnswer = (id) => {
    setActiveId(activeId === id ? null : id);
  };
  return (
    <div className="faq-container">
      <h1>Часто задаваемые вопросы</h1>
      <div className="faq-list">
        {faqData.map((item) => (
          <div key={item.id} className="faq-item">
            <div 
              className={`faq-question ${activeId === item.id ? 'active' : ''}`}
              onClick={() => toggleAnswer(item.id)}
            >
              {item.question}
              <span className="faq-icon">{activeId === item.id ? '−' : '+'}</span>
            </div>
            <div className={`faq-answer ${activeId === item.id ? 'active' : ''}`}>
              {item.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default FAQ;