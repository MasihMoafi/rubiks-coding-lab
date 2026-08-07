import { COLOR_MAP } from '../cubeEngine';
import type { CubeState, FaceName } from '../types';

interface TargetCubeNetProps {
  cubeState: CubeState;
}

const FACES: FaceName[] = ['U', 'L', 'F', 'R', 'B', 'D'];

export default function TargetCubeNet({ cubeState }: TargetCubeNetProps) {
  return (
    <div
      className="flex items-end gap-1.5"
      aria-label="Target cube state"
      role="img"
    >
      {FACES.map((face) => (
        <div key={face} className="flex flex-col items-center gap-0.5" aria-hidden="true">
          <span className="font-mono text-[7px] font-bold text-slate-600">{face}</span>
          <div className="grid grid-cols-3 gap-px rounded-sm bg-slate-950 p-px">
            {cubeState[face].flat().map((color, index) => (
              <span
                key={`${face}-${index}`}
                className="h-1.5 w-1.5 rounded-[1px]"
                style={{ backgroundColor: COLOR_MAP[color] }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
