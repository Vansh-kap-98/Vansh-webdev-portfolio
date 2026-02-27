import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollToTop = () => {
    const { pathname } = useLocation();

    // Disable browser's automatic scroll restoration globally
    useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }, []);

    // useLayoutEffect runs synchronously before the browser paints,
    // which is critical to beat Lenis and GSAP race conditions
    useLayoutEffect(() => {
        // Kill all ScrollTrigger instances from the previous page
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());

        // Force scroll to top immediately (before paint)
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Also reset after the first frame
        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        });

        // And again after a delay to beat any async initialization (e.g. Lenis)
        const timer1 = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 0);

        const timer2 = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 100);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [pathname]);

    return null;
};

export default ScrollToTop;
