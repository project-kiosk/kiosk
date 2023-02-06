import { writeFileSync } from "node:fs";
import { Options } from "./index";
import { toValidPackageName } from "./utils";

interface PackageJson {
  name: string;
  version?: string;
  description?: string;
  homepage?: string;
  license?: string;
  keywords?: string[];
  type?: "module" | "commonjs";
  bugs?: {
    url?: string;
    email?: string;
  };
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts: Record<string, string>;
}

export function write(directory: string, packageJson: PackageJson): void {
  writeFileSync(
    `${directory}/package.json`,
    JSON.stringify(packageJson, null, 4)
  );
}

export function generate(options: Options): PackageJson {
  return {
    name: toValidPackageName(options.projectName),
    description: "A Kiosk installation",
    keywords: ["kiosk", "ebooks", "library", "web-app"],
    homepage: "https://kiosk.9dev.de",
    license: "MIT",
    type: "module",
    dependencies: {
      "@sveltejs/kit": "^1.3.3",
    },
    author: {
      name: "Moritz Friedrich",
      email: "kiosk@moritzfriedrich.com",
      url: "https://moritzfriedrich.com",
    },
    bugs: {
      url: "https://github.com/radiergummi/kiosk/issues",
    },
    scripts: {
      start: "node bin/server",
    },
  };
}

export function initialize(directory: string, options: Options): PackageJson {
  const packageJson = generate(options);
  write(directory, packageJson);

  return packageJson;
}
