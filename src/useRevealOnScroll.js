import { useEffect, useRef, useState } from 'react';

export default function useRevealOnScroll({ threshold = 0.1, rootMargin = '0px 0px -40px 0px', repeat = false } = {}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer;

    const reveal = () => {
      setRevealed(true);
      if (!repeat) observer?.disconnect();
    };
    const observe = () => {
      observer?.disconnect();
      if (typeof window.IntersectionObserver !== 'function') {
        reveal();
        return;
      }
      observer = new IntersectionObserver((entries) => {
        if (motionPreference.matches) return;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) reveal();
          // Keep partly visible text revealed; fully clipped panels reset too.
          else if (repeat && (!entry.isIntersecting || entry.intersectionRatio === 0)) setRevealed(false);
        }
      }, { threshold: repeat ? [0, threshold] : threshold, rootMargin });
      observer.observe(element);
    };
    const handleMotionPreference = (event) => {
      setReducedMotion(event.matches);
      if (event.matches) {
        observer?.disconnect();
        setRevealed(true);
      } else if (repeat) {
        setRevealed(false);
        observe();
      }
    };

    motionPreference.addEventListener('change', handleMotionPreference);

    setReducedMotion(motionPreference.matches);
    if (motionPreference.matches || typeof window.IntersectionObserver !== 'function') {
      reveal();
    } else {
      observe();
    }

    return () => {
      observer?.disconnect();
      motionPreference.removeEventListener('change', handleMotionPreference);
    };
  }, [threshold, rootMargin, repeat]);

  return { ref, revealed, reducedMotion };
}
