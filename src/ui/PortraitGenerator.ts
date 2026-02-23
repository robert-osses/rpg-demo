/**
 * Generates procedural SVG portrait data URLs for RPG characters and enemies.
 * Each portrait is unique based on the character's name, class, and sprite color.
 */

interface PortraitConfig {
    name: string;
    className: string;
    spriteColor: string;
    isEnemy?: boolean;
}

/** Class icon symbols used in portraits */
const CLASS_ICONS: Record<string, string> = {
    // Characters
    Knight: '⚔️',
    Berserker: '🪓',
    Healer: '✨',
    Guardian: '🛡️',
    Sorceress: '🔮',
    Enchantress: '💫',
    // Enemies
    Rogue: '🗡️',
    Warrior: '⚔️',
    Beast: '🐺',
    Sorcerer: '🔥',
    Dragon: '🐉',
    'Undead Knight': '💀',
};

/**
 * Generates a unique seed number from a string for deterministic randomness.
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

/**
 * Simple seeded pseudo random number generator.
 */
function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return s / 2147483647;
    };
}

/**
 * Converts hex color to HSL components.
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Generates a portrait SVG as a data URL.
 */
export function generatePortrait(config: PortraitConfig): string {
    const { name, className, spriteColor, isEnemy } = config;
    const seed = hashString(name + className);
    const rand = seededRandom(seed);
    const { h, s } = hexToHsl(spriteColor);

    const bgH = Math.round(h);
    const bgS = Math.round(Math.min(s + 10, 80));

    // Unique pattern elements based on seed
    const patternCount = 3 + Math.floor(rand() * 4);
    const icon = CLASS_ICONS[className] || '⭐';

    let patterns = '';
    for (let i = 0; i < patternCount; i++) {
        const cx = 20 + rand() * 120;
        const cy = 20 + rand() * 120;
        const r = 8 + rand() * 25;
        const opacity = 0.05 + rand() * 0.12;
        patterns += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="hsl(${bgH}, ${bgS}%, 70%)" opacity="${opacity}"/>`;
    }

    // Silhouette shape based on enemy vs player
    const silhouetteColor = isEnemy
        ? `hsl(${bgH}, ${bgS}%, 20%)`
        : `hsl(${bgH}, ${bgS}%, 25%)`;

    const shapeVariant = Math.floor(rand() * 3);
    let silhouette = '';
    if (shapeVariant === 0) {
        // Triangular/pointy silhouette
        silhouette = `<polygon points="80,25 120,75 110,140 50,140 40,75" fill="${silhouetteColor}" opacity="0.8"/>`;
    } else if (shapeVariant === 1) {
        // Rounded silhouette
        silhouette = `<ellipse cx="80" cy="85" rx="40" ry="55" fill="${silhouetteColor}" opacity="0.8"/>`;
    } else {
        // Broad silhouette
        silhouette = `<rect x="40" y="35" width="80" height="105" rx="20" fill="${silhouetteColor}" opacity="0.8"/>`;
    }

    // Head circle
    const headY = 50 + Math.floor(rand() * 5);
    const headR = 22 + Math.floor(rand() * 6);

    // Accent glow behind character
    const glowColor = isEnemy
        ? `hsl(${(bgH + 180) % 360}, 70%, 50%)`
        : `hsl(${bgH}, 80%, 60%)`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <radialGradient id="bg_${seed}" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="hsl(${bgH}, ${bgS}%, 18%)"/>
      <stop offset="100%" stop-color="hsl(${bgH}, ${bgS}%, 6%)"/>
    </radialGradient>
    <radialGradient id="glow_${seed}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${glowColor}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow_${seed}">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.5)"/>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="160" height="160" rx="12" fill="url(#bg_${seed})"/>
  <!-- Decorative pattern -->
  ${patterns}
  <!-- Glow -->
  <circle cx="80" cy="80" r="55" fill="url(#glow_${seed})"/>
  <!-- Body silhouette -->
  ${silhouette}
  <!-- Head -->
  <circle cx="80" cy="${headY}" r="${headR}" fill="${spriteColor}" opacity="0.9" filter="url(#shadow_${seed})"/>
  <!-- Eyes -->
  <circle cx="72" cy="${headY - 2}" r="2.5" fill="white" opacity="0.9"/>
  <circle cx="88" cy="${headY - 2}" r="2.5" fill="white" opacity="0.9"/>
  <circle cx="72" cy="${headY - 2}" r="1.2" fill="#111"/>
  <circle cx="88" cy="${headY - 2}" r="1.2" fill="#111"/>
  <!-- Icon -->
  <text x="80" y="130" text-anchor="middle" font-size="24" filter="url(#shadow_${seed})">${icon}</text>
  <!-- Border frame -->
  <rect x="2" y="2" width="156" height="156" rx="11" fill="none" stroke="${isEnemy ? 'hsl(0, 50%, 35%)' : 'hsl(210, 50%, 40%)'}" stroke-width="2.5" opacity="0.7"/>
  <!-- Corner accents -->
  <line x1="4" y1="20" x2="4" y2="4" stroke="${spriteColor}" stroke-width="2" opacity="0.6"/>
  <line x1="4" y1="4" x2="20" y2="4" stroke="${spriteColor}" stroke-width="2" opacity="0.6"/>
  <line x1="140" y1="4" x2="156" y2="4" stroke="${spriteColor}" stroke-width="2" opacity="0.6"/>
  <line x1="156" y1="4" x2="156" y2="20" stroke="${spriteColor}" stroke-width="2" opacity="0.6"/>
</svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Cache for generated portrait URLs.
 */
const portraitCache = new Map<string, string>();

/**
 * Gets or generates a portrait URL for a character/enemy.
 */
export function getPortraitUrl(name: string, className: string, spriteColor: string, isEnemy: boolean = false): string {
    const key = `${name}-${className}-${isEnemy}`;
    if (portraitCache.has(key)) {
        return portraitCache.get(key)!;
    }
    const url = generatePortrait({ name, className, spriteColor, isEnemy });
    portraitCache.set(key, url);
    return url;
}
