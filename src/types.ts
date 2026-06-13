export type FaceName = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

export type CubeColor = 'white' | 'yellow' | 'green' | 'blue' | 'orange' | 'red';

export type CubeState = Record<FaceName, CubeColor[][]>;

export interface CubeMove {
  face: FaceName;
  inverted: boolean; // true if counter-clockwise (e.g. U')
}

export interface LessonChapter {
  id: string;
  title: string;
  shortTitle: string;
  category: 'Basics' | 'Matrix Algebra' | 'Algorithmic Cycles' | 'Creative Solver';
  description: string;
  learningGoal: string;
  explanationMarkdown: string;
  codeTemplate: string;
  initialCode: string;
  activeCubeSetup: 'solved' | 'scrambled' | 'target' | 'checkerboard' | 'custom';
  customSetupMoves?: string[]; // Moves to apply before challenge starts
  solutionChecker: (userCode: string, resultCubeState: CubeState) => {
    success: boolean;
    feedback: string;
    targetCubeState?: CubeState;
  };
  hints: string[];
}
