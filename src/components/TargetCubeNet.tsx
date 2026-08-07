import { COLOR_MAP } from '../cubeEngine';
import type { CubeState, FaceName } from '../types';

interface TargetCubeNetProps {
  cubeState: CubeState;
}

const NET_FACES: Array<{ face: FaceName; col: number; row: number }> = [
  { face: 'U', col: 2, row: 1 },
  { face: 'L', col: 1, row: 2 },
  { face: 'F', col: 2, row: 2 },
  { face: 'R', col: 3, row: 2 },
  { face: 'B', col: 4, row: 2 },
  { face: 'D', col: 2, row: 3 },
];

export default function TargetCubeNet({ cubeState }: TargetCubeNetProps) {
  return (
    <div
      className="grid w-fit grid-cols-4 grid-rows-3 gap-1 rounded-lg border border-slate-800 bg-black/25 p-2"
      aria-label="Target cube state"
      role="img"
    >
      {NET_FACES.map(({ face, col, row }) => (
        <div
          key={face}
          className="grid grid-cols-3 gap-px"
          style={{ gridColumn: col, gridRow: row }}
          aria-hidden="true"
        >
          {cubeState[face].flat().map((color, index) => (
            <span
              key={`${face}-${index}`}
              className="h-1.5 w-1.5 rounded-[1px] sm:h-2 sm:w-2"
              style={{ backgroundColor: COLOR_MAP[color] }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
