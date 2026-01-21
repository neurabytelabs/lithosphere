/**
 * LITHOSPHERE v7.1 - AI Panel Component
 *
 * Free AI features powered by Gemini API
 * Includes rate limiting indicator for free tier
 */

import React, { useState, useCallback, useEffect } from 'react';
import { GeminiService, MaterialSuggestion } from '../../../services/geminiService';
import './AIPanel.css';

// ============================================================================
// TYPES
// ============================================================================

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentMaterial: string;
  onApplySuggestion?: (suggestion: MaterialSuggestion) => void;
}

type AIMode = 'suggest' | 'explain' | 'random';

// ============================================================================
// COMPONENT
// ============================================================================

export const AIPanel: React.FC<AIPanelProps> = ({
  isOpen,
  onClose,
  currentMaterial,
  onApplySuggestion,
}) => {
  const [mode, setMode] = useState<AIMode>('suggest');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<MaterialSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [applied, setApplied] = useState(false);

  // Check availability on mount
  useEffect(() => {
    if (isOpen && isAvailable === null) {
      GeminiService.checkAvailability().then(setIsAvailable);
    }
  }, [isOpen, isAvailable]);

  // Cooldown timer
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      const remaining = GeminiService.getRateLimitCooldown();
      setCooldown(remaining);
    }, 500);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  // Generate suggestion
  const handleSuggest = useCallback(async () => {
    if (!prompt.trim() || cooldown > 0) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setSuggestion(null);

    const result = await GeminiService.suggestMaterial(prompt);
    
    setLoading(false);
    if (result) {
      setSuggestion(result);
      setResult(`✨ ${result.name}: ${result.description}`);
    } else {
      setError('Could not generate suggestion. Try again.');
    }
  }, [prompt, cooldown]);

  // Get explanation
  const handleExplain = useCallback(async () => {
    if (cooldown > 0) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setSuggestion(null);

    const explanation = await GeminiService.explainMaterial(currentMaterial);
    
    setLoading(false);
    if (explanation && !explanation.includes('error')) {
      setResult(explanation);
    } else {
      setError(explanation || 'Could not generate explanation.');
    }
  }, [currentMaterial, cooldown]);

  // Random idea
  const handleRandom = useCallback(async () => {
    if (cooldown > 0) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setSuggestion(null);

    const idea = await GeminiService.randomMaterialIdea();
    
    setLoading(false);
    if (idea) {
      setSuggestion(idea);
      setResult(`🎲 ${idea.name}: ${idea.description}`);
    } else {
      setError('Could not generate idea. Try again.');
    }
  }, [cooldown]);

  // Apply suggestion
  const handleApply = useCallback(() => {
    if (suggestion && onApplySuggestion) {
      onApplySuggestion(suggestion);
      setApplied(true);
      // Auto-close after applying
      setTimeout(() => {
        onClose();
        setApplied(false);
      }, 1500);
    }
  }, [suggestion, onApplySuggestion, onClose]);

  if (!isOpen) return null;

  const isDisabled = loading || isAvailable === false || cooldown > 0;

  return (
    <div className="ai-panel-overlay" onClick={onClose}>
      <div className="ai-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-panel-header">
          <div className="ai-panel-title">
            <span className="ai-icon">🤖</span>
            <span>AI Studio</span>
            <span className="ai-badge">FREE</span>
          </div>
          <button className="ai-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Availability Notice */}
        {isAvailable === false && (
          <div className="ai-unavailable">
            ⚠️ AI service unavailable. API key may not be configured.
          </div>
        )}

        {/* Cooldown Notice */}
        {cooldown > 0 && (
          <div className="ai-cooldown">
            ⏳ Rate limit: wait {cooldown}s before next request
          </div>
        )}

        {/* Mode Tabs */}
        <div className="ai-tabs">
          <button 
            className={`ai-tab ${mode === 'suggest' ? 'active' : ''}`}
            onClick={() => setMode('suggest')}
          >
            ✨ Suggest
          </button>
          <button 
            className={`ai-tab ${mode === 'explain' ? 'active' : ''}`}
            onClick={() => setMode('explain')}
          >
            📖 Explain
          </button>
          <button 
            className={`ai-tab ${mode === 'random' ? 'active' : ''}`}
            onClick={() => setMode('random')}
          >
            🎲 Random
          </button>
        </div>

        {/* Content */}
        <div className="ai-content">
          {mode === 'suggest' && (
            <div className="ai-suggest-mode">
              <p className="ai-hint">
                Describe a material you'd like to create:
              </p>
              <input
                type="text"
                className="ai-input"
                placeholder="e.g., glowing blue crystal from deep ocean"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSuggest()}
                disabled={isDisabled}
              />
              <button 
                className="ai-action-btn"
                onClick={handleSuggest}
                disabled={isDisabled || !prompt.trim()}
              >
                {loading ? 'Generating...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Generate Material'}
              </button>
            </div>
          )}

          {mode === 'explain' && (
            <div className="ai-explain-mode">
              <p className="ai-hint">
                Learn about the current material:
              </p>
              <div className="ai-current-material">
                Current: <strong>{currentMaterial}</strong>
              </div>
              <button 
                className="ai-action-btn"
                onClick={handleExplain}
                disabled={isDisabled}
              >
                {loading ? 'Thinking...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Explain Material'}
              </button>
            </div>
          )}

          {mode === 'random' && (
            <div className="ai-random-mode">
              <p className="ai-hint">
                Get a creative material idea:
              </p>
              <button 
                className="ai-action-btn"
                onClick={handleRandom}
                disabled={isDisabled}
              >
                {loading ? 'Imagining...' : cooldown > 0 ? `Wait ${cooldown}s` : '🎲 Surprise Me!'}
              </button>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="ai-result">
              <p>{result}</p>
              {suggestion && onApplySuggestion && (
                <button
                  className={`ai-apply-btn ${applied ? 'applied' : ''}`}
                  onClick={handleApply}
                  disabled={applied}
                >
                  {applied ? '✓ Applied!' : 'Apply to Scene'}
                </button>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="ai-error">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="ai-panel-footer">
          <span className="ai-powered">Powered by Gemini 2.0 Flash</span>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
