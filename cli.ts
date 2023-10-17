import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import denoConfig from "./deno.json" assert { type: "json" };
import { Runner } from "./lib/runner.ts";
import {
  DenoWorkspacesError,
  ERROR_SOURCE_EXTERNAL_PREFIX,
  ERROR_SOURCE_WORKSPACES_POSTFIX,
} from "./lib/error.ts";

export function cliffySetup() {
  // deno-lint-ignore no-explicit-any
  const shellRunnerOption: Parameters<Command<any>["option"]> = [
    "-s, --shell",
    "Runs the provided args in the shell rather than a deno task.",
  ];
  // deno-lint-ignore no-explicit-any
  const parallelOption: Parameters<Command<any>["option"]> = [
    "-p, --parallel",
    "Runs the workspaces in parallel.",
  ];

  // deno-lint-ignore no-explicit-any
  const forwardArgsOption: Parameters<Command<any>["option"]> = [
    "-f, --forward <arguments:string>",
    "Forwards the given commands. Can be provided multiple times.",
    { collect: true },
  ];

  // deno-lint-ignore no-explicit-any
  const includeOption: Parameters<Command<any>["option"]> = [
    "-i, --include <matcher:string>",
    "Only runs the commands against the workspaces fulfilling the pattern. Can be provided multiple times.",
    { collect: true },
  ];

  // deno-lint-ignore no-explicit-any
  const excludeOption: Parameters<Command<any>["option"]> = [
    "-e, --exclude <matcher:string>",
    "Only runs the commands against the workspaces not fulfilling the pattern. Can be provided multiple times.",
    { collect: true },
  ];

  const command = new Command()
    // Main command.
    .name("Deno Workspaces")
    .version(denoConfig.version)
    .description("Deno Workspace Plugin")
    .globalOption("-d, --debug", "Enable debug output.")
    .globalOption("-c, --cwd <path:string>", "Path to run the command in.", {
      default: Deno.cwd(),
    });

  command
    .action(() => {
      command.showHelp();
    })
    .command("workspace", "Runs a command in a workspace")
    .option(...shellRunnerOption)
    .option(...forwardArgsOption)
    .arguments("<arguments...:string>")
    .action(async (options, ...args) => {
      await new Runner({
        command: "workspace",
        arguments: args,
        ...options,
      }).commandWorkspace();
    })
    .command("workspaces", "Runs a command in the workspaces")
    .option(...shellRunnerOption)
    .option(...forwardArgsOption)
    .option(...includeOption)
    .option(...excludeOption)
    .option(...parallelOption)
    .arguments("<arguments...:string>")
    .action(async (options, ...args) => {
      await new Runner({
        command: "workspaces",
        arguments: args,
        ...options,
      }).commandWorkspaces();
    })
    .command("list", "List workspaces")
    .option(...includeOption)
    .option(...excludeOption)
    .action(async (options, ...args) => {
      await new Runner({
        command: "list",
        arguments: args,
        ...options,
      }).commandList();
    })
    .command("tester", "create your command, and see how its parsed")
    .option(...shellRunnerOption)
    .option(...forwardArgsOption)
    .option(...includeOption)
    .option(...excludeOption)
    .arguments("[arguments...:string]")
    .action((options, ...args) =>
      console.info(
        `Arguments: ${JSON.stringify(args)}\nOptions: ${
          JSON.stringify(options)
        }`,
      )
    );

  return command;
}

export async function main() {
  try {
    const command = cliffySetup();

    await command.parse(Deno.args);
  } catch (e) {
    if (e instanceof DenoWorkspacesError) {
      console.error(e.message + "\n\n" + ERROR_SOURCE_WORKSPACES_POSTFIX);
      Deno.exit(1);
    }

    console.error(ERROR_SOURCE_EXTERNAL_PREFIX);

    throw e;
  }
}

if (import.meta.main) {
  await main();
}
