
import { BrowserRouter ,Route,Routes} from 'react-router-dom'
import Home from './pages/home';
import EventPage from './pages/EventPage';

import Hero from './component/hero';

import AboutPage from './pages/AboutPage';
import SponsorsPage from './pages/Sponsors/SponsorsPage';
import ContactPage from './pages/Contact';



function App() {
 
  return (
 <BrowserRouter>
    <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/sponsor" element={<SponsorsPage/>} />
        <Route path="/about" element={<AboutPage/>} />
        <Route path="/events" element={<EventPage/>} />
        <Route path="/contact" element={<ContactPage/>}/>
    
      </Routes>
    
    
    </BrowserRouter>

  )
}

export default App
