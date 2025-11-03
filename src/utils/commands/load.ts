import fs from "fs";
import path from "path";

export const loadFilesRecursively = (dir: string): string[] => {
  let files: string[] = [];
  if (!fs.existsSync(dir)) return [];

  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(loadFilesRecursively(fullPath));
    } else if (file.endsWith(".ts") || file.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
};
