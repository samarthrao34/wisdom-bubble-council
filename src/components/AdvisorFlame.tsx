import React from 'react';
import { cn } from '@/lib/utils';

interface AdvisorFlameProps {
  advisor: {
    name: string;
    emoji: string;
    color: string;
  };
  isActive?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

export const AdvisorFlame: React.FC<AdvisorFlameProps> = ({ 
  advisor, 
  isActive = false, 
  isSpeaking = false,
  className 
}) => {
  return (
    <div className={cn(
      "relative w-16 h-20 mx-auto transition-all duration-500",
      isActive && "scale-110",
      className
    )}>
      {/* Flame Body */}
      <div className={cn(
        "absolute inset-0 rounded-full transition-all duration-300",
        "bg-gradient-to-t from-flame-core via-flame-outer to-sky-blue",
        "animate-flame-flicker",
        isSpeaking && "animate-pulse"
      )}>
        {/* Inner Glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-t from-magic-glow/80 to-transparent" />
        
        {/* Outer Aura */}
        <div className={cn(
          "absolute -inset-2 rounded-full opacity-60 blur-sm",
          "bg-gradient-to-t from-cosmic-purple/40 via-sky-blue/30 to-wisdom-purple/20",
          isActive && "opacity-100 animate-glow"
        )} />
      </div>
      
      {/* Eyes */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <div className={cn(
          "w-2 h-2 rounded-full bg-foreground transition-all duration-200",
          isSpeaking && "animate-bounce"
        )} />
        <div className={cn(
          "w-2 h-2 rounded-full bg-foreground transition-all duration-200",
          isSpeaking && "animate-bounce delay-100"
        )} />
      </div>
      
      {/* Mouth */}
      <div className={cn(
        "absolute top-10 left-1/2 transform -translate-x-1/2",
        "w-3 h-1.5 bg-foreground rounded-full transition-all duration-200",
        isSpeaking ? "scale-y-150" : "scale-y-50"
      )} />
      
      {/* Advisor Emoji */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-lg">
        {advisor.emoji}
      </div>
      
      {/* Sparkles */}
      {isActive && (
        <>
          <div className="sparkle top-2 left-2 text-magic-glow">✨</div>
          <div className="sparkle top-4 right-1 text-sky-blue delay-300">⭐</div>
          <div className="sparkle bottom-6 left-1 text-wisdom-purple delay-700">✦</div>
        </>
      )}
    </div>
  );
};