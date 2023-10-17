import {
  extractAndValidateConfigRawFromConfigFile,
  filterWorkspaces,
  transformConfigRawToConfig,
} from "./config.ts";
import { DenoWorkspacesError } from "./error.ts";
import { findConfigFilePath, readConfigFile, workspaceExists } from "./fs.ts";

export type RunnerOptions = {
  command: string;
  arguments: string[];
  cwd: string;
  debug?: boolean;
  shell?: boolean;
  parallel?: boolean;
  forward?: string[];
  include?: string[];
  exclude?: string[];
};

export type RunCommandResult = {
  name: string;
  path: string;
  output: Deno.CommandOutput;
};

/**
 * Command runner
 */
export class Runner {
  command: string;
  arguments: string[];
  cwd: string;
  debug = false;
  shell = false;
  parallel = false;
  forward: string[] = [];
  include: string[] = [];
  exclude: string[] = [];

  constructor(options: RunnerOptions) {
    this.command = options.command;
    this.arguments = options.arguments;
    this.cwd = options.cwd;

    if (options.debug) this.debug = options.debug;
    if (options.shell) this.shell = options.shell;
    if (options.parallel) this.parallel = options.parallel;
    if (options.forward) this.forward = options.forward;
    if (options.include) this.include = options.include;
    if (options.exclude) this.exclude = options.exclude;
  }

  /**
   * Commands
   */

  /**
   * Workspace run command
   */
  async commandWorkspace() {
    const workspaces = await this.getWorkspaces();

    const workspaceName = this.arguments[0];

    const workspacePath = workspaces[workspaceName];

    if (!workspaceName || !workspacePath) {
      throw new DenoWorkspacesError(
        `Workspace '${this.arguments[0]}' does not exist in config`,
      );
    }

    const output = await this.runCommand(workspacePath);

    this.outputRunCommandResult({
      name: workspaceName,
      path: workspacePath,
      output,
    });
  }

  /**
   * Workspaces run command
   */
  async commandWorkspaces() {
    const workspaces = await this.getWorkspaces();

    const runCommandResults: RunCommandResult[] = [];

    if (this.parallel) {
      const res = await Promise.all(
        Object.entries(workspaces).map(async ([name, path]) => {
          const output = await this.runCommand(path);
          return <RunCommandResult> {
            name,
            path,
            output,
          };
        }),
      );
      runCommandResults.push(...res);
    } else {
      for (const [name, path] of Object.entries(workspaces)) {
        const output = await this.runCommand(path);
        runCommandResults.push({
          name,
          path,
          output,
        });
      }
    }

    for (const result of runCommandResults) {
      this.outputRunCommandResult(result);
    }
  }

  /**
   * List workspaces command
   */
  async commandList() {
    const workspaces = await this.getWorkspaces();

    console.table(workspaces);
  }

  /**
   * Commands end
   */

  /**
   * Retrieves the workspaces according to config and filters.
   */
  async getWorkspaces() {
    const configFilePath = findConfigFilePath(this.cwd);

    if (this.debug) {
      console.debug(`Config file path: '${configFilePath}'`);
    }

    const configFileContent = await readConfigFile(configFilePath);

    if (this.debug) {
      console.debug(`Config file content (raw): '${configFileContent}'`);
    }

    const configRaw = extractAndValidateConfigRawFromConfigFile(
      configFileContent,
    );

    if (this.debug) {
      console.debug(`Config (raw): '${configRaw}'`);
    }

    const config = transformConfigRawToConfig(this.cwd, configRaw);

    if (this.debug) {
      console.debug(`Config (raw): '${config}'`);
    }

    const missingWorkspaces: [string, string][] = [];
    for (const [workspaceName, path] of Object.entries(config.workspaces)) {
      const exists = await workspaceExists(path);
      if (!exists) {
        missingWorkspaces.push([workspaceName, path]);
      }
    }
    if (missingWorkspaces.length) {
      throw new DenoWorkspacesError(
        `The following workspaces does not exists in ${this.cwd}:\n${
          missingWorkspaces.map((v) => `${v[0]} (at ${v[1]})`).join("\n")
        }`,
      );
    }

    const filteredWorkspaces = filterWorkspaces(config.workspaces, {
      include: this.include,
      exclude: this.exclude,
    });

    if (this.debug) {
      console.debug(`Filtered Workspaces: '${filteredWorkspaces}'`);
    }

    return filteredWorkspaces;
  }

  /**
   * Command runner for deno task.
   *
   * Don't use directly, use `runCommand` instead
   */
  async runDenoTaskCommand(path: string) {
    const slicedArguments = this.command === "workspace"
      ? this.arguments.slice(1)
      : this.arguments;
    const args = ["task", ...slicedArguments, ...this.forward];
    const command = new Deno.Command(Deno.execPath(), {
      args,
      cwd: path,
    });

    return await command.output();
  }

  /**
   * Command runner for shell.
   *
   * Don't use directly, use `runCommand` instead
   */
  async runShellCommand(path: string) {
    const [commandPath, ...commandArgs] = this.arguments;

    const args = [...commandArgs, ...this.forward];

    const command = new Deno.Command(commandPath, {
      args,
      cwd: path,
    });

    return await command.output();
  }

  /**
   * Top level command runner
   */
  async runCommand(path: string) {
    let output: Deno.CommandOutput;

    if (this.shell) {
      output = await this.runShellCommand(path);
    } else {
      output = await this.runDenoTaskCommand(path);
    }

    return output;
  }

  /**
   * Outputs the results of a run command to the console
   */
  outputRunCommandResult({ name, path, output }: RunCommandResult) {
    const { code, stdout, stderr, success } = output;

    const stdoutText = new TextDecoder().decode(stdout);
    const stderrText = new TextDecoder().decode(stderr);

    const outputText =
      `Workspace '${name}' at '${path}' exited with code '${code}' as '${
        success ? "success" : "fail"
      }'
-
Output:
-
${success ? stdoutText : stderrText}
-
`;

    console.info(outputText);
  }
}
