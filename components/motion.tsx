'use client';
import { MotionConfig, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import type { ReactNode } from 'react';
export function MotionProvider({ children }: { children: ReactNode }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const reduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="scroll-progress"
        style={{ scaleX: reduced ? 0 : scaleX }}
        aria-hidden="true"
      />
      {children}
    </MotionConfig>
  );
}
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? {} : { y: [20, 0], opacity: [0.7, 1] }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: reduced ? 0 : 0.65,
        delay: reduced ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
