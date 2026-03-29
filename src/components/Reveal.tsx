import React from 'react';
import { motion } from 'motion/react';

export const Reveal: React.FC<{ 
  children?: React.ReactNode; 
  delay?: number; 
  y?: number; 
  x?: number; 
  scale?: number;
  duration?: number;
}> = ({ children, delay = 0, y = 20, x = 0, scale = 1, duration = 0.8 }) => (
  <motion.div
    initial={{ opacity: 0, y, x, scale, filter: 'blur(10px)' }}
    whileInView={{ opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' }}
    viewport={{ once: true }}
    transition={{ duration, delay, ease: [0.21, 0.45, 0.32, 0.9] }}
  >
    {children}
  </motion.div>
);
