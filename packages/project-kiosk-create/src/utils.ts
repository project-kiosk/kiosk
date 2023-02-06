import {
  existsSync,
  lstatSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
} from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

export function preOrderDirectoryTraverse(
  directory: string,
  onDirectory: (path: string) => unknown,
  onFile: (path: string) => unknown
) {
  for (const filename of readdirSync(directory)) {
    if (filename === ".git") {
      continue;
    }

    const fullPath = resolve(directory, filename);

    if (lstatSync(fullPath).isDirectory()) {
      onDirectory(fullPath);

      // in case the dirCallback removes the directory entirely
      if (existsSync(fullPath)) {
        preOrderDirectoryTraverse(fullPath, onDirectory, onFile);
      }

      continue;
    }

    onFile(fullPath);
  }
}

export function postOrderDirectoryTraverse(
  directory: string,
  onDirectory: (path: string) => unknown,
  onFile: (path: string) => unknown
) {
  for (const filename of readdirSync(directory)) {
    if (filename === ".git") {
      continue;
    }

    const fullPath = resolve(directory, filename);

    if (lstatSync(fullPath).isDirectory()) {
      postOrderDirectoryTraverse(fullPath, onDirectory, onFile);
      onDirectory(fullPath);

      continue;
    }

    onFile(fullPath);
  }
}

export function isValidPackageName(projectName: string): boolean {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  );
}

export function toValidPackageName(projectName: string): string {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z0-9-~]+/g, "-");
}

export function canSkipEmptying(dir: string): boolean {
  if (!existsSync(dir)) {
    return true;
  }

  const files = readdirSync(dir);

  if (files.length === 0) {
    return true;
  }

  return files.length === 1 && files[0] === ".git";
}

export function emptyDirectory(directory: string) {
  if (!existsSync(directory)) {
    return;
  }

  postOrderDirectoryTraverse(
    directory,
    (directory) => rmdirSync(directory),
    (file) => unlinkSync(file)
  );
}

export function resolvePackageManager(): "pnpm" | "yarn" | "npm" {
  // Supported package managers: pnpm > yarn > npm
  const userAgent: string = process.env.npm_config_user_agent ?? "";

  return /pnpm/.test(userAgent)
    ? "pnpm"
    : /yarn/.test(userAgent)
    ? "yarn"
    : "npm";
}
