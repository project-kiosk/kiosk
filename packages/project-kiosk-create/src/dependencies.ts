import { gray, red } from "kolorist";
import { spawn } from "node:child_process";
import { resolvePackageManager } from "./utils";

export function installDependencies( path: string, signal: AbortSignal): Promise<void> {
  const packageManager = resolvePackageManager();

  return new Promise((resolve, reject) => {
    const installProcess = spawn(packageManager, ["install"], {
      env: { ...process.env, NODE_ENV: "production" },
      windowsHide: true,
      argv0: "node",
      cwd: path,
      signal,
    });

    installProcess.stdout.on("data", (chunk) => {
      const lines = chunk
        ?.toString()
        .split("\n")
        .map((line: string) => `  ${line}`)
        .join("\n");

      process.stdout.write(gray(lines));
    });

    installProcess.stderr.on("data", (chunk) => {
      const lines = chunk
        ?.toString()
        .split("\n")
        .map((line: string) => `  ${line}`)
        .join("\n");

      process.stderr.write(red(lines));
    });

    installProcess.on("abort", () =>
      reject(new Error('Aborted'))
    );

    installProcess.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`Exit code ${code}`))
    );
  });
}
