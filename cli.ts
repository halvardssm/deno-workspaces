import { resolve } from "https://deno.land/std@0.204.0/path/resolve.ts";
import { initDenoWorkspace } from "./lib/mod.ts";
import { parse } from "https://deno.land/std@0.204.0/flags/mod.ts";
import { DenoWorkspacesError } from "./lib/error.ts";

export type ArgCommands = ["workspace", string, string] | [
  "workspaces",
  "foreach",
  string,
] | ["workspaces", "list"];
export type ParsedArgs = {
  cwd: string;
  helpText: string;
  topLevelCommand: "workspace" | "workspaces";
  args: string[];
  forwardArgs: string[];
  include: string[];
  exclude: string[];
};

export function parseArgs(
  { cwd, help, include, exclude, _: commands, "--": forwardArgs }: {
    [x: string]: any;
    _: (string | number)[];
    "--": string[];
  },
) {
  const parsedArgs = {
    cwd,
    helpText: "",
    topLevelCommand: "workspace",
    args: [],
    forwardArgs,
    include,
    exclude,
  } as ParsedArgs;

  if (commands[0] === "workspace") {
    if (help) {
      parsedArgs.helpText = `Command: workspace
Usage: workspace <workspaceName> <commandName> [-- forward args]

Runs a command in a workspace
`;
    } else if (commands.length !== 3) {
      throw new DenoWorkspacesError(
        "The workspace command only takes two arguments, use --help to read more.",
      );
    }
    parsedArgs.topLevelCommand = "workspace";
    parsedArgs.args = commands.slice(1).map((c) => c.toString());
  } else if (commands[0] === "workspaces") {
    const flagsHelpText = `Flags:
--include: Only runs the commands against the workspaces fulfilling the pattern. 
--exclude: Only runs the commands against the workspaces not fulfilling the pattern. 
Note: If both 'include' and 'exclude' is provided, it will only run against the ones matching 'include' that does not match the 'exclude'.`;

    if (!["foreach", "list"].includes(commands[1].toString())) {
      if (help) {
        parsedArgs.helpText = `Command: workspaces
Usage: [flags] workspaces <argName> [<commandName> [commandFlags] [-- forward args]]
-
argName: Can be either 'list' to list the workspaces or 'foreach' to run a command against every workspace

` + flagsHelpText;
      } else {
        throw new DenoWorkspacesError(
          "The workspaces command only allows `foreach` and `list`, use --help to read more.",
        );
      }
    }

    if (commands[1] === "foreach") {
      if (help) {
        parsedArgs.helpText = `Command: workspaces foreach
Usage: [flags] workspaces foreach <commandName> [commandFlags] [-- forward args]

Runs a command in every workspace
-            
` + flagsHelpText;
      } else if (commands.length !== 3) {
        {
          throw new DenoWorkspacesError(
            "The foreach command only takes one argument, use --help to read more.",
          );
        }
      }
      parsedArgs.topLevelCommand = "workspaces";
      parsedArgs.args = commands.slice(1).map((c) => c.toString());
    } else if (commands[1] === "list") {
      if (help) {
        parsedArgs.helpText = `Command: workspaces list
Usage: [flags] workspaces list

Shows all available workspaces
-
` + flagsHelpText;
      } else if (commands.length !== 2) {
        {
          throw new DenoWorkspacesError(
            "The list command takes no arguments, use --help to read more.",
          );
        }
      }
      parsedArgs.topLevelCommand = "workspaces";
      parsedArgs.args = commands.slice(1).map((c) => c.toString());
    }
  } else {
    parsedArgs.helpText = `
Usage: <command>

Commands:
- workspace: Runs a command in a workspace
- workspaces foreach: Runs a command in every workspace
- workspaces list: Lists all workspaces
`;
  }

  return parsedArgs;
}

export async function main() {
  const args = parse(Deno.args, {
    alias: {
      h: "help",
    },
    default: {
      cwd: resolve(Deno.cwd(), "example"),
    },
    "--": true,
    collect: ["include", "exclude"],
    string: ["include", "exclude"],
  });
  console.log(args);

  const parsedArgs = parseArgs(args);

  console.log(parsedArgs);

  const { helpText, cwd } = parsedArgs;

  if (helpText) {
    let outputText = `
Deno Workspaces
---
` + helpText;

    console.info(outputText);
    Deno.exit();
  }

  await initDenoWorkspace(parsedArgs);
}

if (import.meta.main) {
  main();
}
