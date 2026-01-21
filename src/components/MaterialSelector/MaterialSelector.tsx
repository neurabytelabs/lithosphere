/**
 * LITHOSPHERE v7.1 - Material Selector Component
 *
 * Top-level wrapper that integrates MaterialPicker, GeologicalStoryPanel, and AIPanel.
 * Designed to be dropped into App.tsx as a simple overlay.
 */

import React, { useState, useCallback } from 'react';
import { MaterialPicker } from '../MaterialPicker/MaterialPicker';
import { GeologicalStoryPanel } from '../../features/GeologicalStory/GeologicalStoryPanel';
import type { UseMaterialReturn } from '../../hooks/useMaterial';
import type { MaterialDefinition } from '../../../materials/types';
import './MaterialSelector.css';

// ============================================================================
// TYPES
// ============================================================================

interface MaterialSelectorProps {
  materialHook: UseMaterialReturn;
  onMaterialSelect?: (material: MaterialDefinition) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  materialHook,
  onMaterialSelect,
}) => {
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isStoryPanelOpen, setStoryPanelOpen] = useState(false);

  const {
    currentDefinition,
    allMaterials,
    selectMaterial,
    storyState,
    playStory,
    pauseStory,
    stopStory,
    seekStory,
    setStorySpeed,
    isInitialized,
  } = materialHook;

  // Handle material selection
  const handleSelectMaterial = useCallback((id: string) => {
    selectMaterial(id);
    setPickerOpen(false);

    // Find and notify with definition
    const def = allMaterials.find(m => m.id === id);
    if (def) {
      onMaterialSelect?.(def);
    }
  }, [selectMaterial, allMaterials, onMaterialSelect]);

  // Handle story button click
  const handleStoryClick = useCallback(() => {
    setStoryPanelOpen(true);
    playStory();
  }, [playStory]);


  if (!isInitialized || !currentDefinition) {
    return null;
  }

  return (
    <div className="material-selector">
      {/* Current Material Button */}
      <button
        className="material-selector-button"
        onClick={() => setPickerOpen(!isPickerOpen)}
        title="Select Material"
      >
        <span className="material-icon">{getCategoryIcon(currentDefinition.category)}</span>
        <span className="material-name">{currentDefinition.name}</span>
        <span className="material-chevron">{isPickerOpen ? '▲' : '▼'}</span>
      </button>

      {/* Story Button */}
      <button
        className="story-button"
        onClick={handleStoryClick}
        title="Watch Formation Story"
      >
        <span className="story-icon">📜</span>
        <span className="story-text">Story</span>
      </button>


      {/* Material Picker Dropdown */}
      <div className="material-picker-dropdown">
        <MaterialPicker
          currentMaterialId={currentDefinition.id}
          onMaterialSelect={handleSelectMaterial}
          onClose={() => setPickerOpen(false)}
          isOpen={isPickerOpen}
          userTier="free"
        />
      </div>

      {/* Geological Story Panel */}
      {currentDefinition.geologicalStory && storyState && (
        <GeologicalStoryPanel
          story={currentDefinition.geologicalStory}
          state={storyState}
          isOpen={isStoryPanelOpen}
          onClose={() => {
            setStoryPanelOpen(false);
            stopStory();
          }}
          onPlay={playStory}
          onPause={pauseStory}
          onStop={stopStory}
          onSeek={seekStory}
          onSpeedChange={setStorySpeed}
        />
      )}

    </div>
  );
};

// ============================================================================
// HELPERS
// ============================================================================

function getCategoryIcon(category: string): string {
  switch (category) {
    case 'gemstone': return '💎';
    case 'volcanic': return '🌋';
    case 'crystalline': return '🔮';
    case 'organic': return '🌿';
    case 'exotic': return '✨';
    default: return '🪨';
  }
}

export default MaterialSelector;
