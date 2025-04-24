import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <nav className="footer__nav">
          <ul className="footer__menu">
            <li><Link to="/">© 2025 Nomad College. Все права защищены.</Link></li>
            <li><Link to="/entry-process">Как это работает?</Link></li>
            <li><Link to="/faq">Ответы на вопросы</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};
export default Footer;