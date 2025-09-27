import { useLayoutEffect } from "react";

export function useLockBodyScroll(locked: boolean) {
  useLayoutEffect(() => {
    const body = document.body;
    const prevTA = body.style.touchAction;
    const prevOB = body.style.overscrollBehavior;
    
    if (locked) {
      body.style.touchAction = "none";
      body.style.overscrollBehavior = "contain";
    }
    
    return () => {
      body.style.touchAction = prevTA;
      body.style.overscrollBehavior = prevOB;
    };
  }, [locked]);
}