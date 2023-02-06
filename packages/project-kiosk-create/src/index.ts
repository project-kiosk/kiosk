import { cyan, red } from "kolorist";
import minimist, { ParsedArgs } from "minimist";
import { mkdir, rm } from "node:fs/promises";
import process from "node:process";
import prompts from "prompts";
import { initialize } from "./packageJson";
import { installDependencies } from "./dependencies";
import { canSkipEmptying } from "./utils.js";

export interface Options {
  projectName: string;
  environment: string;
  database: string;
  mail: string;
  storage: string;
  knowledgeGraph: string;
  search: string;
  shouldOverwrite: boolean;
  overwriteChecker: boolean;
}

async function init(): Promise<void> {
  console.log();
  console.log("Kiosk - Digital Library");
  console.log();

  const abortController = new AbortController();
  process.on("SIGINT", () => abortController.abort());

  const argv: ParsedArgs = minimist(process.argv.slice(2), {
    alias: {},
    string: ["_"],
    // all arguments are treated as booleans
    boolean: true,
  });
  const forceOverwrite = argv.force;
  let targetDir = argv._[0];
  const defaultProjectName = !targetDir ? "kiosk" : targetDir;

  const result = await prompts<keyof Options>(
    [
      {
        name: "projectName",
        type: targetDir ? null : "text",
        message: "Project name:",
        initial: defaultProjectName,
        onState: (state) =>
          (targetDir = String(state.value).trim() || defaultProjectName),
      },
      {
        name: "shouldOverwrite",
        type: () =>
          canSkipEmptying(targetDir) || forceOverwrite ? null : "confirm",
        message: () => {
          const dirForPrompt =
            targetDir === "."
              ? "Current directory"
              : `Target directory "${targetDir}"`;

          return `${dirForPrompt} is not empty. Remove existing files and continue?`;
        },
      },
      {
        name: "overwriteChecker",
        type: (prev, values) => {
          if (values.shouldOverwrite === false) {
            throw new Error(`${red("✖")} Operation cancelled`);
          }
          return null;
        },
      },
      {
        name: "environment",
        type: "select",
        message: "Deployment Environment",
        choices: [
          {
            value: "node",
            title: "Node.js",
            description: `Your app is going to be deployed on a ${cyan(
              "server with Node.js"
            )} installed`,
            selected: true,
          },
          {
            value: "cloudflarePages",
            title: "Cloudflare Pages",
            description: `Your app is going to be deployed on ${cyan(
              "Cloudflare Pages"
            )}`,
            selected: false,
          },
          {
            value: "cloudflareWorkers",
            title: "Cloudflare Workers",
            description: `Your app is going to be deployed on ${cyan(
              "Cloudflare Workers"
            )}`,
            selected: false,
          },
          {
            value: "vercel",
            title: "Vercel",
            description: `Your app is going to be deployed on ${cyan(
              "Vercel"
            )}`,
            selected: false,
          },
          {
            value: "netlify",
            title: "Netlify",
            description: `Your app is going to be deployed on ${cyan(
              "Netlify"
            )}`,
            selected: false,
          },
        ],
      },
      {
        name: "database",
        type: "select",
        message: "Database provider",
        choices(prev, answers) {
          return [
            {
              value: "sqlite",
              title: "SQLite",
              disabled: answers.environment !== "node",
              selected: answers.environment === "node",
              description:
                "SQlite database in a local file. Only available for Node.js deployments.",
            },
            {
              value: "postgresql",
              title: "PostgreSQL",
              selected: answers.environment !== "node",
            },
            {
              value: "mysql",
              title: "MySQL/MariaDB",
            },
            {
              value: "sqlserver",
              title: "Microsoft SQL Server",
            },
            {
              value: "mongodb",
              title: "MongoDB (Experimental)",
            },
            {
              value: "cockroachdb",
              title: "CockroachDB (Experimental)",
            },
          ];
        },
      },
      {
        name: "mail",
        type: "select",
        message: "Mailing Adapter",
        choices(prev, answers) {
          return [
            {
              value: "noop",
              title: "No-op",
              description:
                "Dummy adapter: Will print emails to the log instead of sending them.",
            },
            {
              value: "mailgun",
              title: "Mailgun",
            },
            {
              value: "mailjet",
              title: "Mailjet",
            },
            {
              value: "cloudflare",
              title: "Cloudflare via MailChannels integration",
              disabled: !isCloudflare(answers.environment),
              selected: isCloudflare(answers.environment),
              description:
                "Cloudflare offers a free integration with MailChannels, working out of the box",
            },
          ];
        },
        instructions:
          "Select a provider to send emails with. If you don't have one yet, select no-op.",
      },
      {
        name: "storage",
        type: "select",
        message: "Storage Adapter",
        choices(prev, answers) {
          return [
            {
              value: "node",
              title: "Local filesystem",
              disabled: answers.environment !== "node",
            },
            {
              value: "aws",
              title: "AWS S3 Bucket",
            },
            {
              value: "cloudflare",
              title: "Cloudflare R2 Bucket",
              disabled: !isCloudflare(answers.environment),
              selected: isCloudflare(answers.environment),
            },
          ];
        },
      },
      {
        name: "knowledgeGraph",
        type: "select",
        message: "Knowledge Graph Adapter",
        choices(prev, answers) {
          return [
            {
              value: "googleKgSearch",
              title: "Google Knowledge Graph Search",
            },
            {
              value: "googleEnterpriseKg",
              title: "Google Enterprise Knowledge Graph",
            },
            {
              value: "wikidata",
              title: "Wikidata (not implemented yet)",
              disabled: true,
            },
          ];
        },
      },
      {
        name: "search",
        type: "select",
        message: "Search Adapter",
        choices(prev, answers) {
          return [
            {
              value: "algolia",
              selected: true,
              title: "Algolia",
            },
          ];
        },
      },
    ],
    {
      onCancel: (): never => {
        throw new Error(`${red("✖")} Operation cancelled`);
      },
    }
  );

  if (result.shouldOverwrite) {
    await rm(targetDir, {
      recursive: true,
      force: true,
    });
  }

  await mkdir(targetDir, { recursive: true });

  // TODO: Now, you have all settings available.
  //        -> Attempt to connect to the database (?)
  //        -> Build a package.json file from the settings
  initialize(targetDir, result);

  //        -> Install using the user's preferred package manager
  try {
    await installDependencies(targetDir, abortController.signal);
  } catch (error) {
    throw new Error(`Installation failed: ${(error as Error).message}`);
  }

  //        -> Generate the database schema
  //        -> Migrate the database
  //        -> Start the application for the first time
  //        -> Open initial user registration (setup wizard?) in browser

  console.log('Kiosk has been installed')
}

init().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

export {};

function isCloudflare(environment: string): boolean {
  return ["cloudflarePages", "cloudflareWorkers"].includes(environment);
}
