import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareInstagram, faFacebook, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faArrowDown } from '@fortawesome/free-solid-svg-icons';
export default function Social(){
    return(
        <div className="social opacity-80 bg-stone-300 w-16 h-40 rounded-sm p-2 flex items-center justify-center fixed bottom-7 right-5 z-30 shadow-lg">
        <ul className="flex-col gap-4 space-x-2">
          <li><FontAwesomeIcon icon={faSquareInstagram} className="text-black text-2xl hover:scale-110 transition-transform" /></li>
          <li><FontAwesomeIcon icon={faFacebook} className="text-black text-2xl hover:scale-110 transition-transform" /></li>
          <li><FontAwesomeIcon icon={faYoutube} className="text-black text-2xl hover:scale-110 transition-transform" /></li>
          <li><FontAwesomeIcon icon={faEnvelope} className="text-black text-2xl hover:scale-110 transition-transform" /></li>
        </ul>
      </div>
    )
}