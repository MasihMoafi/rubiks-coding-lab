import fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf8');

if (!content.includes("'M' | 'E' | 'S'")) {
    content = content.replace("export interface CubeMove {", "export type SliceName = 'M' | 'E' | 'S';\n\nexport interface CubeMove {");
    content = content.replace("face: FaceName;", "face: FaceName | SliceName;");
    fs.writeFileSync('src/types.ts', content);
    console.log("Updated types.ts");
}
