
import { BrowserRouter ,Route,Routes} from 'react-router-dom'
import Home from './pages/home';


import Hero from './component/hero';



function App() {
 
  return (
 <BrowserRouter>
    <Routes>
        <Route path="/" element={<Home/>} />
     

     
       { /*<Route path="/contact" element={<Contact />} />*/}
    
      </Routes>
    
    
    </BrowserRouter>

  )
}

export default App
