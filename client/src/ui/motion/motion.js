/* ================================================
   MOTION SYSTEM - React Animation Components
   ================================================ */

import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import React, { useEffect } from 'react';

/* ================================================
   MICRO-INTERACTIONS
   ================================================ */

// 1. Card Mount Animation
export const CardAppear = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 6, scale: 0.995 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ 
      duration: 0.22, 
      delay, 
      ease: [0.17, 0.84, 0.44, 1] 
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// 2. Slide-over Panel Animation
export const SlideOver = ({ open, children, side = 'right' }) => {
  const variants = {
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' }
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' }
    },
    top: {
      initial: { y: '-100%' },
      animate: { y: 0 },
      exit: { y: '-100%' }
    },
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' }
    }
  };

  const sideStyles = {
    right: { right: 0, top: 0, height: '100%', width: 'min(560px, 92vw)' },
    left: { left: 0, top: 0, height: '100%', width: 'min(560px, 92vw)' },
    top: { top: 0, left: 0, width: '100%', height: 'min(400px, 80vh)' },
    bottom: { bottom: 0, left: 0, width: '100%', height: 'min(400px, 80vh)' }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => e.target === e.currentTarget && open.toggle && open.toggle()}
        >
          <motion.div
            initial={variants[side].initial}
            animate={variants[side].animate}
            exit={variants[side].exit}
            transition={{
              type: 'spring',
              stiffness: 220,
              damping: 26
            }}
            style={{
              position: 'absolute',
              ...sideStyles[side],
              backgroundColor: 'var(--glass)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)',
              borderRadius: side === 'right' || side === 'left' ? '16px 0 0 16px' : '0 0 16px 16px'
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 3. Toast Slide Animation
export const ToastIn = ({ children, className = "" }) => (
  <motion.div
    initial={{ y: 12, opacity: 0, scale: 0.95 }}
    animate={{ y: 0, opacity: 1, scale: 1 }}
    exit={{ y: 12, opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.18, ease: [0.17, 0.84, 0.44, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// 4. KPI Counter Animation
export function CountUp({ value, className = "", duration = 1.2 }) {
  const spring = useSpring(0, { stiffness: 160, damping: 18 });
  
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  
  const rounded = useTransform(spring, v => Math.round(v));
  
  return (
    <motion.span className={className}>
      {rounded}
    </motion.span>
  );
}

// 5. Progress Glide Animation
export const ProgressGlide = ({ value, className = "", max = 100 }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`progress-bar ${className}`}>
      <motion.div
        className="progress-fill"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: [0.17, 0.84, 0.44, 1] }}
      />
    </div>
  );
};

// 6. Stagger Container for Lists
export const StaggerContainer = ({ children, className = "", staggerDelay = 0.1 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// 7. Stagger Item for List Items
export const StaggerItem = ({ children, className = "" }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 }
    }}
    transition={{ duration: 0.3, ease: [0.17, 0.84, 0.44, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// 8. Modal Animation
export const ModalMotion = ({ isOpen, children, className = "" }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30 
          }}
          className={`modal ${className}`}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ================================================
   HOVER EFFECTS
   ================================================ */

// Hover Lift Effect
export const HoverLift = ({ children, className = "", liftHeight = 2 }) => (
  <motion.div
    whileHover={{ y: -liftHeight, scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    transition={{ duration: 0.2, ease: [0.17, 0.84, 0.44, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Button Press Effect
export const ButtonPress = ({ children, className = "", ...props }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.15, ease: [0.17, 0.84, 0.44, 1] }}
    className={className}
    {...props}
  >
    {children}
  </motion.button>
);

/* ================================================
   LAYOUT ANIMATIONS
   ================================================ */

// Page Transition
export const PageTransition = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: [0.17, 0.84, 0.44, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Fade In/Out
export const FadeInOut = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

// Scale Animation
export const ScaleIn = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ 
      duration: 0.3, 
      delay, 
      ease: [0.17, 0.84, 0.44, 1] 
    }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ================================================
   UTILITY HOOKS
   ================================================ */

// Custom hook for scroll-triggered animations
export const useScrollAnimation = (threshold = 0.1) => {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: threshold },
    transition: { duration: 0.5, ease: [0.17, 0.84, 0.44, 1] }
  };
};

// Custom hook for stagger animations
export const useStaggerAnimation = (staggerDelay = 0.1) => {
  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay
        }
      }
    },
    item: {
      hidden: { opacity: 0, y: 10 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.3, ease: [0.17, 0.84, 0.44, 1] }
      }
    }
  };
};

/* ================================================
   PRESETS
   ================================================ */

// Common animation presets
export const animationPresets = {
  // Gentle fade in
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  
  // Slide up from bottom
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.17, 0.84, 0.44, 1] }
  },
  
  // Zoom in
  zoomIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: [0.17, 0.84, 0.44, 1] }
  },
  
  // Slide in from right
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: [0.17, 0.84, 0.44, 1] }
  }
};

/* ================================================
   ACCESSIBILITY
   ================================================ */

// Respects user's motion preferences
export const ResponsiveMotion = ({ children, reduceMotion = false, ...motionProps }) => {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  if (prefersReducedMotion || reduceMotion) {
    return <div>{children}</div>;
  }
  
  return <motion.div {...motionProps}>{children}</motion.div>;
};