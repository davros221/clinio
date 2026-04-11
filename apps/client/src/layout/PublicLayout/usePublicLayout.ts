import { useLocation, useOutlet } from "react-router";
import { useEffect, useRef } from "react";

export const usePublicLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  const contentAnimationProps = {
    layout: true,
    initial: isFirstRender.current ? false : { opacity: 0, x: -80 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 80 },
    transition: { duration: 0.2, delay: 0.2 },
  };

  return {
    contentAnimationProps,
    location,
    outlet,
  };
};
