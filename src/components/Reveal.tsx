import React from 'react';
import { motion } from 'framer-motion';

export const Reveal: React.FC<{ 
  children?: React.ReactNode; 
  delay?: number; 
  y?: number; 
  x?: number; 
  scale?: number;
  duration?: number;
}> = ({ children, delay = 0, y = 20, x = 0, scale = 1, duration = 0.8 }) => (
  <motion.div
    initial={{ opacity: 0, y, x, scale }}
    whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration, delay, ease: [0.215, 0.61, 0.355, 1] }}
  >
    {children}
  </motion.div>
);
