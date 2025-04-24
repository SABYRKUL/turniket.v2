import Header from './components/header/Header'
import Main from './components/main/Main'
import FAQ from './components/faq/FAQ'
import Footer from './components/footer/Footer'
import EntryProcess from './components/entryProcess/EntryProcess'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
function App() {

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/entry-process" element={<EntryProcess />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}
export default App