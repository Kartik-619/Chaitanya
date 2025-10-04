import  { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP,SplitText);

export default function TextSplit(
   { text_name="",children}
){  useGSAP(()=>{
    const text_id=document.querySelector(`. ${text_name}`);
    if(!split) return;
    const hoverText=()=>{
        let split=SplitText.create(text_id,{
            type:"chars, words, lines",
            charsClass:"char"
        });
    
        gsap.from(split.words,{
            y:100,
            autoAlpha:0,
            yoyo:true,
            repeat:-1,
            stragger:{
                amount:0.5,
                from:'random'
            }
        });
    }
    box?.addEventListener("mouseenter",hoverText);
    
    return ()=>{
        //creating the clean up function
        box?.removeEventListener("mouseenter",hoverIn);
        
    }
    

});
        
        return children;
}