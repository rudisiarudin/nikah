import React from 'react';
import { motion } from 'motion/react';

export const Reveal: React.FC<{ 
  children?: React.ReactNode; 
  delay?: number; 
  y?: number; 
  x?: number; 
  scale?: number;
  duration?: number;
  className?: string;
}> = ({ children, delay = 0, y = 10, x = 0, scale = 0.95, duration = 1.2, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y, x, scale }}
    whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
    viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);
