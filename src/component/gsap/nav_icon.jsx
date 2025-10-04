import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
//we'll try to animate the icon over the hovering
export default function Hover_Animate({
    div_name="",children
}){

    useGSAP(()=>{
        const box=document.querySelector(`.${div_name}`);
        if(!box) return;

        //animates over the hover
        const hoverIn=()=>{
            gsap.to(box,{
                filter:"drop-shadow(0 3px rgba(242, 243, 241, 0.8))",
                duration:0.5,
                repeat:0,
                ease:'back.out(1.2)'
            });
        }
        //normal state upon hovering out
        const hoverOut=()=>{
            gsap.to(box,{
                 filter:"drop-shadow(0 0 20px  rgba(0, 0, 0, 0))",
                duration:0,
                ease:"power2.out"
            });
        }

        //adding events
        box?.addEventListener("mouseenter",hoverIn);
        box?.addEventListener("mouseleave",hoverOut);
        return ()=>{
            //creating the clean up function
            box?.removeEventListener("mouseenter",hoverIn);
            box?.removeEventListener("mouseleave",hoverOut);
        }
        });//no dependency array because it only runs when we we trigger the dom event

    return children;
}