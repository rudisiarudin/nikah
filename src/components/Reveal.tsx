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
    initial={{ opacity: 0, y, x, scale, willChange: "transform, opacity" }}
    whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
    animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
    viewport={{ once: true, amount: 0.05 }}
    transition={{ 
      duration: duration * 1.1, 
      delay, 
      ease: [0.22, 1, 0.36, 1] 
    }}
  >
    {children}
  </motion.div>
);
