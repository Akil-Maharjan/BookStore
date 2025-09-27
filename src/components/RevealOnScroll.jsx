import React from 'react';
import { motion } from 'framer-motion';

const directionOffsets = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: {},
};

const RevealOnScroll = ({
  as = 'div',
  direction = 'up',
  delay = 0,
  duration = 1,
  className = '',
  children,
  ...rest
}) => {
  const MotionComponent = motion[as] || motion.div;
  const offset = directionOffsets[direction] || directionOffsets.up;

  return (
    <MotionComponent
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
      className={className}
      {...rest}
    >
      {children}
    </MotionComponent>
  );
};

export default RevealOnScroll;
