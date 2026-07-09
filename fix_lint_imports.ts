import fs from 'fs';

let content = fs.readFileSync('src/components/Cube3D.tsx', 'utf8');

// Move getFaceLocalAxes to the top, under imports
const getFaceLocalAxesStr = `const getFaceLocalAxes = (face: FaceName) => {
  const el00 = document.getElementById(\`sticker-\${face}-0-0\`);
  const el01 = document.getElementById(\`sticker-\${face}-0-1\`);
  const el10 = document.getElementById(\`sticker-\${face}-1-0\`);

  if (el00 && el01 && el10) {
    const r00 = el00.getBoundingClientRect();
    const r01 = el01.getBoundingClientRect();
    const r10 = el10.getBoundingClientRect();

    return {
      xVec: { x: r01.left - r00.left, y: r01.top - r00.top },
      yVec: { x: r10.left - r00.left, y: r10.top - r00.top }
    };
  }
  return { xVec: { x: 1, y: 0 }, yVec: { x: 0, y: 1 } }; // fallback
};`;

content = content.replace(getFaceLocalAxesStr, '');
content = content.replace("import { CubeState, FaceName } from '../types';", "import { CubeState, FaceName } from '../types';\n" + getFaceLocalAxesStr);

// Delete the dead getPhysicalDirectionD code
content = content.replace(/const getPhysicalDirectionD = \([\s\S]*?return 'right';\n};\n\n/, '');

fs.writeFileSync('src/components/Cube3D.tsx', content);
console.log("Fixed import order and removed dead code.");
