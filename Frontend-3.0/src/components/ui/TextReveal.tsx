import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { Badge } from './UIComponents';

interface TextRevealProps {
  text: string;
  className?: string;
  badgeText?: string;
}

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: React.FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative inline-block mr-[0.28em] my-[0.05em]">
      {/* Dim unrevealed base text */}
      <span className="text-zinc-300/90 font-semibold select-none">
        {children}
      </span>
      {/* Revealed text on top */}
      <motion.span
        style={{ opacity }}
        className="absolute inset-0 text-zinc-950 font-bold select-none"
      >
        {children}
      </motion.span>
    </span>
  );
};

export const ScrollTextReveal: React.FC<TextRevealProps> = ({
  text,
  className = '',
  badgeText = 'ABOUT US'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const words = text.split(' ');

  return (
    <section
      id="about"
      ref={containerRef}
      className={`relative h-[220vh] ${className}`}
    >
      {/* Sticky container that stays fixed in viewport while scrolling through parent height */}
      <div className="sticky top-[28vh] flex flex-col justify-center items-center bg-transparent text-zinc-900 z-10 px-4">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-6 text-center">
          {/* Badge Pill */}
          <div className="flex justify-center">
            <Badge variant="primary">{badgeText}</Badge>
          </div>

          {/* Scroll Triggered Text Reveal - Styled as H2 */}
          <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-semibold tracking-tight leading-[1.35] flex flex-wrap justify-center text-center select-none text-zinc-950">
            {words.map((word, i) => {
              const start = i / words.length;
              const end = start + 1 / words.length;
              return (
                <Word key={i} progress={scrollYProgress} range={[start, end]}>
                  {word}
                </Word>
              );
            })}
          </h2>
        </div>
      </div>
    </section>
  );
};

