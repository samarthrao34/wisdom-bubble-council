import React from 'react';
import { Advisor } from '@/types/advisor';
import { cn } from '@/lib/utils';

interface AdvisorBubbleProps {
  advisor: Advisor;
  onClick: () => void;
  isActive?: boolean;
  delay?: number;
}

export const AdvisorBubble: React.FC<AdvisorBubbleProps> = ({ 
  advisor, 
  onClick, 
  isActive = false, 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "floating-bubble floating-animation transition-all duration-500",
        isActive && "ring-4 ring-magic-glow ring-opacity-60",
        !isVisible && "opacity-0 scale-0",
        "hover:scale-110"
      )}
      onClick={onClick}
      style={{
        animationDelay: `${delay}ms`,
        background: `linear-gradient(135deg, hsl(var(--sky-blue)) 0%, hsl(var(--wisdom-purple)) 100%)`
      }}
    >
      {/* Sparkle effects */}
      <div className="sparkle top-2 right-2 w-2 h-2 bg-magic-glow rounded-full" 
           style={{ animationDelay: '0s' }} />
      <div className="sparkle bottom-3 left-3 w-1 h-1 bg-magic-glow rounded-full" 
           style={{ animationDelay: '0.7s' }} />
      <div className="sparkle top-3 left-2 w-1.5 h-1.5 bg-magic-glow rounded-full" 
           style={{ animationDelay: '1.4s' }} />
      
      {/* Content */}
      <div className="text-center text-white relative z-10">
        <div className="text-4xl mb-2 animate-pulse">
          {advisor.emoji}
        </div>
        <div className="text-sm font-semibold tracking-wide">
          {advisor.name.split(' ')[0]}
        </div>
        <div className="text-xs opacity-90 mt-1">
          {advisor.title.replace('The ', '')}
        </div>
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};