import './Header.css'


const Header = () => {
  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          <h1>Turniket.v2</h1>
        </div>
        <nav className="header__nav">
          <ul className="header__menu">
            <li><a href="/">Главная</a></li>
            <li><a href="/attendance">Посещаемость</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
export default Header