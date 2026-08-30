// ============================================================
// Her Universe — TreasureHunt Master 3D Component
// ============================================================
// Manages hidden 3D space treasures in the solar system, hover
// states, and discovery triggers.
// ============================================================

import { TREASURES, type TreasureConfig } from '../../data/treasures';
import { TreasureObject } from './TreasureObject';

interface TreasureHuntProps {
  discoveredIds: string[];
  focusedTreasureId: string | null;
  onSelectTreasure: (treasure: TreasureConfig) => void;
  onHoverTreasure: (treasure: TreasureConfig | null) => void;
}

export function TreasureHunt({
  discoveredIds,
  focusedTreasureId,
  onSelectTreasure,
  onHoverTreasure,
}: TreasureHuntProps) {
  return (
    <group>
      {TREASURES.map((treasure) => {
        const isDiscovered = discoveredIds.includes(treasure.id);
        const isFocused = focusedTreasureId === treasure.id;

        return (
          <TreasureObject
            key={treasure.id}
            treasure={treasure}
            isDiscovered={isDiscovered}
            isFocused={isFocused}
            onSelectTreasure={onSelectTreasure}
            onHoverTreasure={onHoverTreasure}
          />
        );
      })}
    </group>
  );
}
