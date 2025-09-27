import { useLayoutEffect } from "react";

export const useBodyLock = (lock: boolean) => {
  useLayoutEffect(() => {
    const b = document.body;
    const prev = b.style.overflow, 
          prevTO = b.style.touchAction, 
          prevOB = b.style.overscrollBehavior;
    
    if (lock) { 
      b.style.overflow = "hidden"; 
      b.style.touchAction = "none"; 
      b.style.overscrollBehavior = "contain"; 
    }
    
    return () => { 
      b.style.overflow = prev; 
      b.style.touchAction = prevTO; 
      b.style.overscrollBehavior = prevOB; 
    };
  }, [lock]);
};