import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-card-light dark:bg-card-dark/60 dark:backdrop-blur-xl border border-border-light dark:border-white/10 rounded-[32px] shadow-lg shadow-black/5 dark:shadow-primary/10 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;