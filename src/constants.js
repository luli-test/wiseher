// WiseHer Constants and Types

export const INTENTS = {
  friendship: {
    id: 'friendship',
    label: 'Friendship',
    description: 'Nurturing mutual care and companionship',
    icon: '🌱',
    color: 'bg-sage-100 text-sage-700 border-sage-200'
  },
  dating: {
    id: 'dating',
    label: 'Dating',
    description: 'Exploring romantic potential and compatibility',
    icon: '💫',
    color: 'bg-terracotta-100 text-terracotta-700 border-terracotta-200'
  },
  unsure: {
    id: 'unsure',
    label: 'Unsure',
    description: 'Observing dynamics to clarify feelings',
    icon: '🌾',
    color: 'bg-sand-200 text-sand-800 border-sand-300'
  },
  distance: {
    id: 'distance',
    label: 'Distance',
    description: 'Preserving energy and emotional boundaries',
    icon: '🛡️',
    color: 'bg-warmamber-100 text-warmamber-700 border-warmamber-200'
  }
};

export const TREE_STAGES = {
  bare: {
    id: 'bare',
    label: 'Bare Branches',
    description: 'Dormancy, tension, or recurring boundary strain',
    color: 'text-sand-500'
  },
  budding: {
    id: 'budding',
    label: 'Budding',
    description: 'Early signs of connection, careful exploration',
    color: 'text-sage-500'
  },
  leafy: {
    id: 'leafy',
    label: 'Leafy',
    description: 'Steady rhythm, grounded communication',
    color: 'text-sage-600'
  },
  blooming: {
    id: 'blooming',
    label: 'Blooming',
    description: 'Deep mutual investment, warmth, and respect',
    color: 'text-terracotta-500'
  },
  flourishing: {
    id: 'flourishing',
    label: 'Blooming with Birds & Butterflies',
    description: 'Abundant emotional safety, shared reciprocity and joy',
    color: 'text-terracotta-600'
  }
};

/**
 * Calculates escalating streak emoji based on check-in count and cadence
 */
export function getStreakInfo(checkIns = []) {
  const count = checkIns.length;
  if (count === 0) return { emoji: '🌱', label: 'New sprout', count: 0 };
  if (count === 1) return { emoji: '🌱', label: 'First check-in', count: 1 };
  if (count === 2) return { emoji: '🌿', label: '2 check-ins', count: 2 };
  if (count === 3) return { emoji: '🪴', label: '3 check-ins', count: 3 };
  if (count <= 5) return { emoji: '🌳', label: `${count} check-ins streak`, count };
  return { emoji: '🌳🔥', label: `${count} check-ins steady streak`, count };
}
