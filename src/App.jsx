
import Home from './pages/home'
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
gsap.registerPlugin(ScrollTrigger, ScrollSmoother ,useGSAP);
function App() {
  useGSAP(() => {

    let smoother = ScrollSmoother.create({
      wrapper:"#smooth-wrapper",
      content:"#smooth-content",
      smooth: 2,
      effects: true,
      normalizeScroll: true
    });


  }, []);

  return (
  
  <div id="smooth-wrapper">
  <div id="smooth-content">
    <Home />
  </div>
</div>
  )
}

export default App
