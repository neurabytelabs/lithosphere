/**
 * Material Matcher Service - Lithosphere v7.2.0
 *
 * Matches AI-generated material suggestions to existing materials
 * and applies parameter tweaks for enhanced customization.
 *
 * @author Claude Code for NeuraByte Labs
 * @version 1.0.0
 */

import type { MaterialSuggestion } from './geminiService';
import type { MeshPhysicalMaterial } from 'three';
import { Color } from 'three';

// ============================================================================
// MATERIAL PROFILES
// ============================================================================

interface MaterialProfile {
  id: string;
  keywords: string[];
  isMetallic: boolean;
  isGlowing: boolean;
  isTransparent: boolean;
  baseColor: string; // hex
}

const MATERIAL_PROFILES: MaterialProfile[] = [
  {
    id: 'diamond',
    keywords: ['diamond', 'brilliant', 'sparkle', 'clear', 'white', 'ice', 'crystal', 'pure', 'light'],
    isMetallic: false,
    isGlowing: false,
    isTransparent: true,
    baseColor: '#ffffff',
  },
  {
    id: 'ruby',
    keywords: ['ruby', 'red', 'blood', 'fire', 'crimson', 'scarlet', 'passion', 'warm'],
    isMetallic: false,
    isGlowing: false,
    isTransparent: true,
    baseColor: '#e31b23',
  },
  {
    id: 'emerald',
    keywords: ['emerald', 'green', 'forest', 'nature', 'jade', 'mint', 'leaf', 'grass'],
    isMetallic: false,
    isGlowing: false,
    isTransparent: true,
    baseColor: '#50c878',
  },
  {
    id: 'sapphire',
    keywords: ['sapphire', 'blue', 'ocean', 'sky', 'deep', 'navy', 'azure', 'cobalt', 'sea'],
    isMetallic: false,
    isGlowing: false,
    isTransparent: true,
    baseColor: '#0f52ba',
  },
  {
    id: 'amethyst',
    keywords: ['amethyst', 'purple', 'violet', 'lavender', 'mystic', 'spiritual', 'magic'],
    isMetallic: false,
    isGlowing: false,
    isTransparent: true,
    baseColor: '#9966cc',
  },
  {
    id: 'opal',
    keywords: ['opal', 'rainbow', 'iridescent', 'shimmer', 'pearl', 'moonstone', 'dreamy', 'ethereal'],
    isMetallic: false,
    isGlowing: true,
    isTransparent: true,
    baseColor: '#a8c3bc',
  },
  {
    id: 'alexandrite',
    keywords: ['alexandrite', 'color-change', 'magic', 'shifting', 'chameleon', 'dual', 'transform'],
    isMetallic: false,
    isGlowing: true,
    isTransparent: true,
    baseColor: '#008b8b',
  },
  {
    id: 'obsidian',
    keywords: ['obsidian', 'black', 'dark', 'volcanic', 'glass', 'shadow', 'night', 'void'],
    isMetallic: false,
    isGlowing: false,
    isTransparent: false,
    baseColor: '#1a1a1a',
  },
  {
    id: 'amber',
    keywords: ['amber', 'gold', 'honey', 'warm', 'ancient', 'fossil', 'orange', 'sunset'],
    isMetallic: false,
    isGlowing: true,
    isTransparent: true,
    baseColor: '#ffbf00',
  },
  {
    id: 'moldavite',
    keywords: ['moldavite', 'alien', 'meteor', 'cosmic', 'space', 'extraterrestrial', 'rare', 'unusual'],
    isMetallic: false,
    isGlowing: true,
    isTransparent: true,
    baseColor: '#4a7c3f',
  },
];

// ============================================================================
// MATCHING FUNCTIONS
// ============================================================================

/**
 * Calculate match score between suggestion and material profile
 */
function calculateMatchScore(
  suggestion: MaterialSuggestion,
  profile: MaterialProfile
): number {
  let score = 0;
  const text = `${suggestion.name} ${suggestion.description}`.toLowerCase();

  // Keyword matching (most important)
  for (const keyword of profile.keywords) {
    if (text.includes(keyword)) {
      score += 10;
    }
  }

  // Parameter matching
  const params = suggestion.parameters;

  // Metalness match
  const isMetallic = (params.metalness ?? 0) > 0.5;
  if (isMetallic === profile.isMetallic) score += 5;

  // Glow match
  const isGlowing = (params.emissiveIntensity ?? 0) > 0.3;
  if (isGlowing === profile.isGlowing) score += 5;

  // Color similarity (if colorMid is provided)
  if (params.colorMid) {
    const suggestionColor = rgbToHex(params.colorMid);
    const colorDistance = calculateColorDistance(suggestionColor, profile.baseColor);
    // Lower distance = higher score (max 20 points)
    score += Math.max(0, 20 - colorDistance / 10);
  }

  return score;
}

/**
 * Convert RGB array to hex string
 */
function rgbToHex(rgb: [number, number, number]): string {
  const [r, g, b] = rgb.map(v => Math.round(Math.min(255, Math.max(0, v))));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculate color distance (simple Euclidean in RGB space)
 */
function calculateColorDistance(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

/**
 * Convert hex to RGB object
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 128, g: 128, b: 128 };
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Match an AI suggestion to the best existing material
 */
export function matchSuggestionToMaterial(suggestion: MaterialSuggestion): string {
  let bestMatch = 'diamond';
  let bestScore = -1;

  for (const profile of MATERIAL_PROFILES) {
    const score = calculateMatchScore(suggestion, profile);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = profile.id;
    }
  }

  console.log(`[MaterialMatcher] Matched "${suggestion.name}" to "${bestMatch}" (score: ${bestScore})`);
  return bestMatch;
}

/**
 * Apply AI suggestion parameters to a Three.js material
 */
export function applyParameterTweaks(
  threeMaterial: MeshPhysicalMaterial,
  suggestion: MaterialSuggestion
): void {
  const params = suggestion.parameters;

  // Apply roughness
  if (params.roughness !== undefined) {
    threeMaterial.roughness = Math.max(0, Math.min(1, params.roughness));
  }

  // Apply metalness
  if (params.metalness !== undefined) {
    threeMaterial.metalness = Math.max(0, Math.min(1, params.metalness));
  }

  // Apply emissive intensity
  if (params.emissiveIntensity !== undefined) {
    threeMaterial.emissiveIntensity = Math.max(0, Math.min(5, params.emissiveIntensity));
  }

  // Apply emissive color (from colorGlow)
  if (params.colorGlow) {
    const glowHex = rgbToHex(params.colorGlow);
    threeMaterial.emissive = new Color(glowHex);
  }

  // Apply base color (from colorMid)
  if (params.colorMid) {
    const colorHex = rgbToHex(params.colorMid);
    threeMaterial.color = new Color(colorHex);
  }

  // Mark material for update
  threeMaterial.needsUpdate = true;

  console.log('[MaterialMatcher] Applied parameter tweaks:', {
    roughness: threeMaterial.roughness,
    metalness: threeMaterial.metalness,
    emissiveIntensity: threeMaterial.emissiveIntensity,
  });
}

/**
 * Reset material to default state (call selectMaterial again to reset)
 */
export function getMaterialProfile(materialId: string): MaterialProfile | undefined {
  return MATERIAL_PROFILES.find(p => p.id === materialId);
}

export { rgbToHex, hexToRgb };
