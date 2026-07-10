import fs from 'fs';

let content = fs.readFileSync('src/components/Cube3D.tsx', 'utf8');

const calculateMoveReplace = `
  // General coordinate mapping for high-precision rotations
  const calculateMove = (
    face: FaceName,
    idx: number,
    direction: 'left' | 'right' | 'up' | 'down'
  ): string => {
    if (face === 'F') {
      if (direction === 'left') {
        if (idx === 0) return "U";
        if (idx === 1) return "E'";
        return "D'";
      }
      if (direction === 'right') {
        if (idx === 0) return "U'";
        if (idx === 1) return "E";
        return "D";
      }
      if (direction === 'up') {
        if (idx === 0) return "L'";
        if (idx === 1) return "M'";
        return "R";
      }
      if (direction === 'down') {
        if (idx === 0) return "L";
        if (idx === 1) return "M";
        return "R'";
      }
    }

    if (face === 'U') {
      if (direction === 'left') {
        if (idx === 0) return "B";
        if (idx === 1) return "S";
        return "F'";
      }
      if (direction === 'right') {
        if (idx === 0) return "B'";
        if (idx === 1) return "S'";
        return "F";
      }
      if (direction === 'up') {
        if (idx === 0) return "L'";
        if (idx === 1) return "M'";
        return "R";
      }
      if (direction === 'down') {
        if (idx === 0) return "L";
        if (idx === 1) return "M";
        return "R'";
      }
    }

    if (face === 'R') {
      if (direction === 'left') {
        if (idx === 0) return "U";
        if (idx === 1) return "E'";
        return "D'";
      }
      if (direction === 'right') {
        if (idx === 0) return "U'";
        if (idx === 1) return "E";
        return "D";
      }
      if (direction === 'up') {
        if (idx === 0) return "F'";
        if (idx === 1) return "S";
        return "B";
      }
      if (direction === 'down') {
        if (idx === 0) return "F";
        if (idx === 1) return "S'";
        return "B'";
      }
    }

    if (face === 'L') {
      if (direction === 'left') {
        if (idx === 0) return "U";
        if (idx === 1) return "E'";
        return "D'";
      }
      if (direction === 'right') {
        if (idx === 0) return "U'";
        if (idx === 1) return "E";
        return "D";
      }
      if (direction === 'up') {
        if (idx === 0) return "B'";
        if (idx === 1) return "S'";
        return "F";
      }
      if (direction === 'down') {
        if (idx === 0) return "B";
        if (idx === 1) return "S";
        return "F'";
      }
    }

    if (face === 'D') {
      if (direction === 'left') {
        if (idx === 0) return "F";
        if (idx === 1) return "S'";
        return "B'";
      }
      if (direction === 'right') {
        if (idx === 0) return "F'";
        if (idx === 1) return "S";
        return "B";
      }
      if (direction === 'up') {
        if (idx === 0) return "L'";
        if (idx === 1) return "M'";
        return "R";
      }
      if (direction === 'down') {
        if (idx === 0) return "L";
        if (idx === 1) return "M";
        return "R'";
      }
    }

    if (face === 'B') {
      if (direction === 'left') {
        if (idx === 0) return "U'";
        if (idx === 1) return "E";
        return "D";
      }
      if (direction === 'right') {
        if (idx === 0) return "U";
        if (idx === 1) return "E'";
        return "D'";
      }
      if (direction === 'up') {
        if (idx === 0) return "R'";
        if (idx === 1) return "M'";
        return "L";
      }
      if (direction === 'down') {
        if (idx === 0) return "R";
        if (idx === 1) return "M";
        return "L'";
      }
    }

    return '';
  };
`;

content = content.replace(/const calculateMove = \([\s\S]*?return '';\n  \};/, calculateMoveReplace.trim());

fs.writeFileSync('src/components/Cube3D.tsx', content);
console.log("Updated calculateMove in Cube3D.tsx");
