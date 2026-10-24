import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import { routeEnter } from '../../lib/motion';

/**
 * Lightweight route continuity. Deliberately NOT a full-screen overlay
 * (removed in an earlier polish pass): the page content does a short
 * rise + fade keyed on pathname so navigation feels like one production.
 * Reduced motion is handled by `MotionConfig reducedMotion="user"`.
 */
export default function PageTransition({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="site-route" style={{ position: 'relative' }}>
      <motion.div key={pathname} {...routeEnter} className="site-route-content">
        {children}
      </motion.div>
    </div>
  );
}
