import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, MessageCircle } from 'lucide-react';
import { AdvisorBubble } from './AdvisorBubble';
import { ChatInterface } from './ChatInterface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { advisors } from '@/data/advisors';
import { geminiService } from '@/services/gemini';
import { Advisor } from '@/types/advisor';
import { cn } from '@/lib/utils';

export const AICouncil: React.FC = () => {
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [quickQuestion, setQuickQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hoveredAdvisor, setHoveredAdvisor] = useState<string | null>(null);
  const { toast } = useToast();

  // Auto-suggestions based on quick question
  const [suggestedAdvisor, setSuggestedAdvisor] = useState<Advisor | null>(null);

  useEffect(() => {
    if (quickQuestion.trim().length > 3) {
      const bestAdvisor = geminiService.selectBestAdvisor(quickQuestion, advisors);
      bestAdvisor.then(setSuggestedAdvisor);
    } else {
      setSuggestedAdvisor(null);
    }
  }, [quickQuestion]);

  const handleQuickAsk = async () => {
    if (!quickQuestion.trim()) return;

    setIsAnalyzing(true);
    try {
      const bestAdvisor = await geminiService.selectBestAdvisor(quickQuestion, advisors);
      setSelectedAdvisor(bestAdvisor);
      toast({
        title: `Connected with ${bestAdvisor.name}`,
        description: `${bestAdvisor.title} is best suited for your question.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze your question. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAdvisorSelect = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    toast({
      title: `Welcome to ${advisor.name}'s chamber`,
      description: advisor.specialty,
    });
  };

  if (selectedAdvisor) {
    return (
      <ChatInterface 
        advisor={selectedAdvisor} 
        onBack={() => setSelectedAdvisor(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 relative overflow-hidden">
      {/* Background floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-blue/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-wisdom-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-magic-glow/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center py-16 px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-blue to-wisdom-purple flex items-center justify-center animate-glow">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                AI Council
              </h1>
              <p className="text-lg text-muted-foreground">
                of Advisors
              </p>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Meet your 10 specialized AI advisors, each with unique expertise to guide you through 
            life's challenges with wisdom, insight, and personalized advice.
          </p>

          {/* Quick Ask Section */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-5 h-5 text-sky-blue" />
                <h3 className="text-lg font-semibold">Quick Ask</h3>
                {suggestedAdvisor && (
                  <Badge variant="secondary" className="animate-pulse">
                    → {suggestedAdvisor.name.split(' ')[0]}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-3">
                <Input
                  value={quickQuestion}
                  onChange={(e) => setQuickQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickAsk()}
                  placeholder="Ask any question and we'll connect you with the right advisor..."
                  className="flex-1 glass-card border-border/30"
                  disabled={isAnalyzing}
                />
                <Button 
                  onClick={handleQuickAsk}
                  disabled={!quickQuestion.trim() || isAnalyzing}
                  className="px-6"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Ask
                    </>
                  )}
                </Button>
              </div>
              
              {suggestedAdvisor && (
                <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border/30">
                  <p className="text-sm text-muted-foreground">
                    Based on your question, <strong>{suggestedAdvisor.name}</strong> ({suggestedAdvisor.title}) 
                    would be the best advisor to help you.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advisors Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 gradient-text">
              Choose Your Advisor
            </h2>
            <p className="text-muted-foreground">
              Click on any advisor's floating chamber to begin your personalized consultation
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
            {advisors.map((advisor, index) => (
              <div
                key={advisor.id}
                className="flex flex-col items-center group"
                onMouseEnter={() => setHoveredAdvisor(advisor.id)}
                onMouseLeave={() => setHoveredAdvisor(null)}
              >
                <AdvisorBubble
                  advisor={advisor}
                  onClick={() => handleAdvisorSelect(advisor)}
                  isActive={hoveredAdvisor === advisor.id || suggestedAdvisor?.id === advisor.id}
                  delay={index * 200}
                />
                
                {/* Advisor Info */}
                <div className={cn(
                  "mt-6 text-center transition-all duration-300 max-w-xs",
                  hoveredAdvisor === advisor.id ? "opacity-100 scale-105" : "opacity-70"
                )}>
                  <h3 className="font-semibold text-lg gradient-text">
                    {advisor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {advisor.title}
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {advisor.expertise.slice(0, 2).map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="secondary" 
                        className="text-xs px-2 py-1"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Expanded info on hover */}
                  {hoveredAdvisor === advisor.id && (
                    <div className="mt-3 p-3 glass-card rounded-lg border border-border/30 animate-fade-in">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {advisor.specialty}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 px-4 border-t border-border/30">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4">
              Each advisor is powered by Google's Gemini AI, specialized with unique expertise and personality
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>✨ Voice Input</span>
              <span>🎯 Smart Routing</span>
              <span>💬 Conversation History</span>
              <span>🌙 Dark Mode</span>
              <span>📱 Mobile Friendly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};