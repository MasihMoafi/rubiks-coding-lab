import React, { useState, useRef, useEffect } from 'react';
import { CubeState, FaceName } from '../types';
import { COLOR_MAP } from '../cubeEngine';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownLeft, RefreshCw, Layers, Menu, X } from 'lucide-react';

const getSector = (y: number): number => {
  const norm = ((y % 360) + 360) % 360;
  if (norm >= 315 || norm < 45) return 0;
  if (norm >= 45 && norm < 135) return 1;
  if (norm >= 135 && norm < 225) return 2;
  return 3;
};

const getPhysicalDirectionU = (sector: number, dir: 'left' | 'right' | 'up' | 'down'): 'left' | 'right' | 'up' | 'down' => {
  if (sector === 0) return dir;
  if (sector === 1) {
    if (dir === 'left') return 'down';
    if (dir === 'right') return 'up';
    if (dir === 'up') return 'left';
    return 'right';
  }
  if (sector === 2) {
    if (dir === 'left') return 'right';
    if (dir === 'right') return 'left';
    if (dir === 'up') return 'down';
    return 'up';
  }
  if (dir === 'left') return 'up';
  if (dir === 'right') return 'down';
  if (dir === 'up') return 'right';
  return 'left';
};

const getPhysicalDirectionD = (sector: number, dir: 'left' | 'right' | 'up' | 'down'): 'left' | 'right' | 'up' | 'down' => {
  if (sector === 0) return dir;
  if (sector === 1) {
    if (dir === 'left') return 'up';
    if (dir === 'right') return 'down';
    if (dir === 'up') return 'right';
    return 'left';
  }
  if (sector === 2) {
    if (dir === 'left') return 'right';
    if (dir === 'right') return 'left';
    if (dir === 'up') return 'down';
    return 'up';
  }
  if (dir === 'left') return 'down';
  if (dir === 'right') return 'up';
  if (dir === 'up') return 'left';
  return 'right';
};

interface Cube3DProps {
  cubeState: CubeState;
  onMove?: (moveStr: string) => void;
}

export default function Cube3D({ cubeState, onMove }: Cube3DProps) {
  // Custom camera orientation state (interactive room / background drag & drop space rotation)
  const [rotX, setRotX] = useState<number>(-22);
  const [rotY, setRotY] = useState<number>(38);
  const [zoom, setZoom] = useState<number>(1.0);
  const [stars, setStars] = useState<{ id: number; x: number; y: number; opacity: number; size: number; delay: number }[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Highlight of active line (3 adjacent pieces)
  const [activeLine, setActiveLine] = useState<{
    face: FaceName;
    type: 'row' | 'col';
    index: number; // 0, 1, or 2
  } | null>({
    face: 'F',
    type: 'row',
    index: 0
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Drag and drop variables for rotating the 3D space itself
  const isDraggingBackground = useRef<boolean>(false);
  const bgDragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const bgLastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const bgDragDisplacement = useRef<number>(0);

  // Sticker gesture states
  const isStickerDragging = useRef<boolean>(false);
  const stickerDragStart = useRef<{ face: FaceName; r: number; c: number; x: number; y: number }>({
    face: 'F', r: 0, c: 0, x: 0, y: 0
  });
  const stickerHasMovedThisTouch = useRef<boolean>(false);

  // Twinkling stars backdrop logic for galaxy mode
  useEffect(() => {
    const list = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: Math.random() * 0.75 + 0.25,
      size: Math.random() * 1.6 + 0.6,
      delay: Math.random() * 4
    }));
    setStars(list);
  }, []);

  // Handle zooming using mouse scroll wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(prev => {
        const next = prev - e.deltaY * 0.001;
        return Math.max(0.5, Math.min(2.0, next));
      });
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Snappy plastic tactile click sound with absolutely zero low-end bass
  const playSnapSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2600, ctx.currentTime);
      filter.Q.setValueAtTime(10.0, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.075);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.075);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.022);

      oscGain.gain.setValueAtTime(0.15, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.022);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start();
      osc.start();
      noise.stop(ctx.currentTime + 0.08);
      osc.stop(ctx.currentTime + 0.025);
    } catch (e) {
      // guard rails
    }
  };

  const handleTurn = (moveStr: string) => {
    if (onMove) {
      playSnapSound();
      const moves = moveStr.split(/\s+/).filter(Boolean);
      moves.forEach(m => onMove(m));
    }
  };

  // Keyboard controls rotate active lines (WASD / Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key deselects the line completely
      if (e.key === 'Escape') {
        setActiveLine(null);
        return;
      }

      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
      }

      const key = e.key.toLowerCase();
      if (key === 'a' || e.key === 'ArrowLeft') {
        executeSelectedMove('left');
      } else if (key === 'd' || e.key === 'ArrowRight') {
        executeSelectedMove('right');
      } else if (key === 'w' || e.key === 'ArrowUp') {
        executeSelectedMove('up');
      } else if (key === 's' || e.key === 'ArrowDown') {
        executeSelectedMove('down');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeLine]);

  // General coordinate mapping for high-precision rotations
  const calculateMove = (
    face: FaceName,
    idx: number,
    direction: 'left' | 'right' | 'up' | 'down'
  ): string => {
    if (face === 'F') {
      if (direction === 'left') {
        if (idx === 0) return "U";
        if (idx === 1) return "U' D";
        return "D'";
      }
      if (direction === 'right') {
        if (idx === 0) return "U'";
        if (idx === 1) return "U D'";
        return "D";
      }
      if (direction === 'up') {
        if (idx === 0) return "L'";
        if (idx === 1) return "L R'";
        return "R";
      }
      if (direction === 'down') {
        if (idx === 0) return "L";
        if (idx === 1) return "L' R";
        return "R'";
      }
    }

    if (face === 'U') {
      if (direction === 'left') {
        if (idx === 0) return "B";
        if (idx === 1) return "B' F";
        return "F'";
      }
      if (direction === 'right') {
        if (idx === 0) return "B'";
        if (idx === 1) return "B F'";
        return "F";
      }
      if (direction === 'up') {
        if (idx === 0) return "L'";
        if (idx === 1) return "L R'";
        return "R";
      }
      if (direction === 'down') {
        if (idx === 0) return "L";
        if (idx === 1) return "L' R";
        return "R'";
      }
    }

    if (face === 'R') {
      if (direction === 'left') {
        if (idx === 0) return "U";
        if (idx === 1) return "U' D";
        return "D'";
      }
      if (direction === 'right') {
        if (idx === 0) return "U'";
        if (idx === 1) return "U D'";
        return "D";
      }
      if (direction === 'up') {
        if (idx === 0) return "F'";
        if (idx === 1) return "F B'";
        return "B";
      }
      if (direction === 'down') {
        if (idx === 0) return "F";
        if (idx === 1) return "F' B";
        return "B'";
      }
    }

    if (face === 'L') {
      if (direction === 'left') {
        if (idx === 0) return "U";
        if (idx === 1) return "U' D";
        return "D'";
      }
      if (direction === 'right') {
        if (idx === 0) return "U'";
        if (idx === 1) return "U D'";
        return "D";
      }
      if (direction === 'up') {
        if (idx === 0) return "B'";
        if (idx === 1) return "B F'";
        return "F";
      }
      if (direction === 'down') {
        if (idx === 0) return "B";
        if (idx === 1) return "B' F";
        return "F'";
      }
    }

    if (face === 'D') {
      if (direction === 'left') {
        if (idx === 0) return "F";
        if (idx === 1) return "F' B";
        return "B'";
      }
      if (direction === 'right') {
        if (idx === 0) return "F'";
        if (idx === 1) return "F B'";
        return "B";
      }
      if (direction === 'up') {
        if (idx === 0) return "L'";
        if (idx === 1) return "L R'";
        return "R";
      }
      if (direction === 'down') {
        if (idx === 0) return "L";
        if (idx === 1) return "L' R";
        return "R'";
      }
    }

    if (face === 'B') {
      if (direction === 'left') {
        if (idx === 0) return "U'";
        if (idx === 1) return "U D'";
        return "D";
      }
      if (direction === 'right') {
        if (idx === 0) return "U";
        if (idx === 1) return "U' D";
        return "D'";
      }
      if (direction === 'up') {
        if (idx === 0) return "R'";
        if (idx === 1) return "R L'";
        return "L";
      }
      if (direction === 'down') {
        if (idx === 0) return "R";
        if (idx === 1) return "R' L";
        return "L'";
      }
    }

    return '';
  };

  const executeSelectedMove = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!activeLine) return;
    
    const isHorizontal = direction === 'left' || direction === 'right';
    const currentType = isHorizontal ? 'row' : 'col';

    // Adapt rotation-aware directions for U and D faces
    let targetFace = activeLine.face;
    let targetDir = direction;
    if (targetFace === 'U') {
      const sector = getSector(rotY);
      targetDir = getPhysicalDirectionU(sector, direction);
    } else if (targetFace === 'D') {
      const sector = getSector(rotY);
      targetDir = getPhysicalDirectionD(sector, direction);
    }

    // Auto update type if it changes, calculate and trigger rotation moves
    const moveStr = calculateMove(targetFace, activeLine.index, targetDir);
    if (moveStr) {
      handleTurn(moveStr);
    }
    
    setActiveLine({
      face: activeLine.face,
      type: currentType,
      index: activeLine.index
    });
  };

  // Background Drag/Tumble start (registers click/drag on free/empty space)
  const handleBgStart = (clientX: number, clientY: number, isSticker: boolean) => {
    if (isSticker) return; // ignore sticker clicks

    isDraggingBackground.current = true;
    bgDragStart.current = { x: clientX, y: clientY };
    bgLastPos.current = { x: clientX, y: clientY };
    bgDragDisplacement.current = 0;
  };

  const handleBgMove = (clientX: number, clientY: number) => {
    if (!isDraggingBackground.current) return;

    const dx = clientX - bgLastPos.current.x;
    const dy = clientY - bgLastPos.current.y;
    
    // Accumulate displacement to distinguish simple click/tap vs long drag
    const startDx = clientX - bgDragStart.current.x;
    const startDy = clientY - bgDragStart.current.y;
    bgDragDisplacement.current = Math.sqrt(startDx * startDx + startDy * startDy);

    // Adjust viewpoints smoothly
    setRotY(prev => prev + dx * 0.45);
    setRotX(prev => Math.max(-85, Math.min(85, prev - dy * 0.45)));

    bgLastPos.current = { x: clientX, y: clientY };
  };

  const handleBgEnd = () => {
    if (isDraggingBackground.current) {
      isDraggingBackground.current = false;
      // If user simply clicks/touches the black free grid space (low displacement), deselect activeLine
      if (bgDragDisplacement.current < 5) {
        setActiveLine(null);
      }
    }
  };

  // Sticker selection actions (only select with mouse drag/click)
  const handleStickerStart = (face: FaceName, r: number, c: number, clientX: number, clientY: number) => {
    isStickerDragging.current = true;
    stickerDragStart.current = { face, r, c, x: clientX, y: clientY };
    stickerHasMovedThisTouch.current = false;
  };

  const handleStickerMove = (clientX: number, clientY: number) => {
    if (!isStickerDragging.current) return;

    const dx = clientX - stickerDragStart.current.x;
    const dy = clientY - stickerDragStart.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Once dragging exceeds a small threshold, configure/change selected line orientation
    if (dist > 10) {
      stickerHasMovedThisTouch.current = true;
      const { face, r, c } = stickerDragStart.current;
      const isHorizontal = Math.abs(dx) > Math.abs(dy);

      setActiveLine({
        face,
        type: isHorizontal ? 'row' : 'col',
        index: isHorizontal ? r : c
      });
    }
  };

  const handleStickerEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (isStickerDragging.current) {
      isStickerDragging.current = false;
      
      // If it was a clean click without major dragging, select/toggle row/col segment
      if (!stickerHasMovedThisTouch.current) {
        const { face, r, c } = stickerDragStart.current;
        setActiveLine(prev => {
          if (prev && prev.face === face && prev.index === r && prev.type === 'row') {
            // cycle to column selection at the same point
            return { face, type: 'col', index: c };
          }
          return { face, type: 'row', index: r };
        });
      }
    }
  };

  // Mobile Swipe-to-turn touch gesture implementation:
  // "one must first select the same method I said earlier; and only if their selection is complete they can swipe"
  const handleTouchStartSticker = (face: FaceName, r: number, c: number, e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStickerStart(face, r, c, touch.clientX, touch.clientY);
  };

  const handleTouchMoveSticker = (e: React.TouchEvent) => {
    if (!isStickerDragging.current) return;
    const touch = e.touches[0];
    
    // Check if selection exists on touch face/line
    const dx = touch.clientX - stickerDragStart.current.x;
    const dy = touch.clientY - stickerDragStart.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 25 && activeLine) {
      // Must be already selected on the active face to permit swiping
      const { face, r, c } = stickerDragStart.current;
      const isHorizontal = Math.abs(dx) > Math.abs(dy);

      // Verify touch matches the active selection perfectly before turning
      const selectionMatchesRow = activeLine.face === face && activeLine.type === 'row' && activeLine.index === r;
      const selectionMatchesCol = activeLine.face === face && activeLine.type === 'col' && activeLine.index === c;

      if ((isHorizontal && selectionMatchesRow) || (!isHorizontal && selectionMatchesCol)) {
        isStickerDragging.current = false; // complete gesture
        const dir = isHorizontal ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        executeSelectedMove(dir);
        e.preventDefault();
        return;
      }
    }

    handleStickerMove(touch.clientX, touch.clientY);
  };

  // Global mousemove/mouseup hookups so rotation isn't restricted by frame bounds
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleBgMove(e.clientX, e.clientY);
      handleStickerMove(e.clientX, e.clientY);
    };

    const handleGlobalMouseUp = () => {
      handleBgEnd();
      if (isStickerDragging.current) {
        isStickerDragging.current = false;
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [activeLine]);

  const size = 155;
  const halfSize = size / 2;

  const faceTransforms: Record<FaceName, string> = {
    U: `rotateX(90deg) translateZ(${halfSize}px)`,
    D: `rotateX(-90deg) translateZ(${halfSize}px)`,
    F: `rotateY(0deg) translateZ(${halfSize}px)`,
    B: `rotateY(180deg) translateZ(${halfSize}px)`,
    L: `rotateY(-90deg) translateZ(${halfSize}px)`,
    R: `rotateY(90deg) translateZ(${halfSize}px)`,
  };

  const renderFaceStickers = (face: FaceName) => {
    const faceMatrix = cubeState[face];

    return (
      <div 
        id={`face-${face}`}
        className="absolute w-[155px] h-[155px] grid grid-cols-3 gap-[3.5px] bg-slate-950 p-[4.5px] rounded-2xl select-none shadow-2xl border border-slate-900"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        style={{ 
          transform: faceTransforms[face],
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {faceMatrix.map((row, rIdx) => 
          row.map((color, cIdx) => {
            const isStickerInActiveLine = 
              activeLine !== null &&
              activeLine.face === face && 
              ((activeLine.type === 'row' && rIdx === activeLine.index) || 
               (activeLine.type === 'col' && cIdx === activeLine.index));

            return (
              <div
                key={`${face}-${rIdx}-${cIdx}`}
                id={`sticker-${face}-${rIdx}-${cIdx}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleStickerStart(face, rIdx, cIdx, e.clientX, e.clientY);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleTouchStartSticker(face, rIdx, cIdx, e);
                }}
                onTouchMove={handleTouchMoveSticker}
                onTouchEnd={handleStickerEnd}
                className="cube-sticker w-[46px] h-[46px] rounded-[7px] relative flex items-center justify-center cursor-grab active:cursor-grabbing hover:brightness-105 transition-all duration-200"
                style={{ 
                  backgroundColor: COLOR_MAP[color],
                  boxShadow: 'inset 0 3px 5px rgba(255,255,255,0.2), inset 0 -3px 5px rgba(0,0,0,0.25)' 
                }}
              >
                {/* Physical shine highlight */}
                <div className="absolute inset-x-1 top-1 h-[40%] bg-gradient-to-b from-white/20 to-transparent rounded-t-[5px] pointer-events-none" />
                
                {/* PREMIUM DARK GLOWING TEAL SELECTION COVER (between blue and green as requested) */}
                {isStickerInActiveLine && (
                  <div className="absolute inset-0 rounded-[7px] bg-teal-900/35 border-[3.5px] border-teal-500 shadow-[0_0_14px_rgba(20,184,166,0.9)] animate-pulse pointer-events-none z-10" />
                )}

                {rIdx === 1 && cIdx === 1 && (
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900/30 border border-white/20 flex items-center justify-center font-mono text-[7px] text-white/50 pointer-events-none">
                    {face}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center select-none overflow-hidden touch-none">
      
      {/* Mobile Hamburger Menu Trigger */}
      <div className="absolute top-4 left-4 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-teal-400" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Responsive Left Controls Panel */}
      <div className={`
        flex flex-col items-center gap-3 bg-slate-900/85 backdrop-blur-md p-3 rounded-2xl border border-slate-950/80 w-[124px] shrink-0 shadow-2xl absolute transition-all duration-300 z-30
        ${isMobileMenuOpen 
          ? 'left-4 top-16 opacity-100 scale-100 pointer-events-auto' 
          : 'max-md:-left-42 max-md:opacity-0 max-md:scale-95 max-md:pointer-events-none left-4 top-4'
        }
        md:flex md:left-4 md:top-4 md:opacity-100 md:scale-100 md:pointer-events-auto
      `}>
        
        {/* Compact Click-to-twist Arrow Box */}
        <div className="grid grid-cols-3 gap-1 px-1 justify-items-center">
          
          <div />
          <button
            type="button"
            id="btn-spin-up"
            disabled={!activeLine || activeLine.type !== 'col'}
            onClick={() => executeSelectedMove('up')}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
              activeLine && activeLine.type === 'col'
                ? 'border-teal-500/20 bg-slate-950 hover:bg-teal-500 hover:text-slate-950 text-teal-400 cursor-pointer shadow-[0_0_8px_rgba(20,184,166,0.3)]' 
                : 'border-slate-800/40 bg-slate-955 text-slate-700/40 cursor-not-allowed opacity-15'
            }`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div />

          <button
            type="button"
            id="btn-spin-left"
            disabled={!activeLine || activeLine.type !== 'row'}
            onClick={() => executeSelectedMove('left')}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
              activeLine && activeLine.type === 'row'
                ? 'border-teal-500/20 bg-slate-950 hover:bg-teal-500 hover:text-slate-950 text-teal-400 cursor-pointer shadow-[0_0_8px_rgba(20,184,166,0.3)]' 
                : 'border-slate-800/40 bg-slate-955 text-slate-700/40 cursor-not-allowed opacity-15'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="w-9 h-9 flex items-center justify-center bg-slate-950/40 rounded-lg text-slate-655">
            <Layers className="w-3.5 h-3.5 text-teal-500/60" />
          </div>

          <button
            type="button"
            id="btn-spin-right"
            disabled={!activeLine || activeLine.type !== 'row'}
            onClick={() => executeSelectedMove('right')}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
              activeLine && activeLine.type === 'row'
                ? 'border-teal-500/20 bg-slate-950 hover:bg-teal-500 hover:text-slate-950 text-teal-400 cursor-pointer shadow-[0_0_8px_rgba(20,184,166,0.3)]' 
                : 'border-slate-800/40 bg-slate-955 text-slate-700/40 cursor-not-allowed opacity-15'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div />
          <button
            type="button"
            id="btn-spin-down"
            disabled={!activeLine || activeLine.type !== 'col'}
            onClick={() => executeSelectedMove('down')}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
              activeLine && activeLine.type === 'col'
                ? 'border-teal-500/20 bg-slate-950 hover:bg-teal-500 hover:text-slate-950 text-teal-400 cursor-pointer shadow-[0_0_8px_rgba(20,184,166,0.3)]' 
                : 'border-slate-800/40 bg-slate-955 text-slate-700/40 cursor-not-allowed opacity-15'
            }`}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <div />

        </div>

        {/* Alignment Swapper - Zero texts */}
        <button
          type="button"
          id="toggle-slice-alignment"
          disabled={!activeLine}
          onClick={() => {
            if (activeLine) {
              setActiveLine({
                ...activeLine,
                type: activeLine.type === 'row' ? 'col' : 'row'
              });
            }
          }}
          className={`w-full py-1.5 font-mono text-[9px] uppercase font-black rounded border transition-all flex items-center justify-center gap-1 ${
            activeLine 
              ? 'bg-slate-950 hover:bg-slate-900 text-slate-350 hover:text-white border-slate-800 cursor-pointer' 
              : 'bg-slate-955 border-slate-900 text-slate-700 cursor-not-allowed opacity-35'
          }`}
          title="Toggle alignment"
        >
          <RefreshCw className="w-2.5 h-2.5 text-teal-500" />
          {activeLine ? (activeLine.type === 'row' ? 'Row' : 'Col') : 'Line'}
        </button>

        {/* Angle View Preset - Side-by-Side Clean Square Buttons */}
        <div className="w-full border-t border-slate-850 pt-2 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            id="btn-angle-top"
            onClick={() => {
              setRotX(-85);
              setRotY(0);
            }}
            className="h-[36px] bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white font-mono text-[9px] font-black rounded-lg transition-all text-center cursor-pointer flex items-center justify-center uppercase"
            title="TOP"
          >
            top
          </button>
          <button
            type="button"
            id="btn-angle-3d"
            onClick={() => {
              setRotX(-22);
              setRotY(38);
            }}
            className="h-[36px] bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white font-mono text-[9px] font-black rounded-lg transition-all text-center cursor-pointer flex items-center justify-center uppercase"
            title="3D"
          >
            3D
          </button>
        </div>

      </div>

      {/* Background/Full-screen Sandbox Space */}
      <div 
        ref={canvasRef}
        onMouseDown={(e) => handleBgStart(e.clientX, e.clientY, false)}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handleBgStart(touch.clientX, touch.clientY, false);
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          handleBgMove(touch.clientX, touch.clientY);
        }}
        onTouchEnd={handleBgEnd}
        className="absolute inset-0 w-full h-full flex items-center justify-center select-none overflow-hidden touch-none cursor-grab active:cursor-grabbing z-0"
        style={{ perspective: '800px' }}
      >
        
        {/* GALACTIC MODE space stars backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {stars.map(s => (
            <div
              key={s.id}
              className="absolute bg-slate-100 rounded-full animate-pulse pointer-events-none"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity,
                animationDelay: `${s.delay}s`,
                animationDuration: `${2.5 + (s.id % 5) * 2.5}s`
              }}
            />
          ))}
        </div>

        {/* Interactive CSS3D Rubik core model */}
        <div 
          id="cube-3d-model"
          className="relative w-[155px] h-[155px] z-10"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          style={{
            transformStyle: 'preserve-3d',
            transform: `scale(${zoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transition: isDraggingBackground.current ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {renderFaceStickers('U')}
          {renderFaceStickers('D')}
          {renderFaceStickers('F')}
          {renderFaceStickers('B')}
          {renderFaceStickers('L')}
          {renderFaceStickers('R')}
        </div>
      </div>

    </div>
  );
}
