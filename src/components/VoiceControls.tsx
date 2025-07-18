import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceControlsProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  onToggleListening?: () => void;
  onToggleSpeaking?: () => void;
  onStopSpeaking?: () => void;
  className?: string;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening = false,
  isSpeaking = false,
  onToggleListening,
  onToggleSpeaking,
  onStopSpeaking,
  className
}) => {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Voice Input Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleListening}
        className={cn(
          "transition-all duration-300",
          isListening && "bg-primary text-primary-foreground animate-pulse"
        )}
      >
        {isListening ? (
          <Mic className="h-4 w-4" />
        ) : (
          <MicOff className="h-4 w-4" />
        )}
      </Button>

      {/* Voice Output Controls */}
      {isSpeaking && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onStopSpeaking}
            className="bg-destructive/20 text-destructive hover:bg-destructive/30"
          >
            <Pause className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "transition-all duration-300",
              isMuted && "bg-muted text-muted-foreground"
            )}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="flex items-center space-x-1 text-primary">
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce delay-100" />
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce delay-200" />
          <span className="text-xs ml-2">Speaking...</span>
        </div>
      )}
    </div>
  );
};