# Deno Workspaces

This is a Deno Workspace project inspired by Yarn workspaces (without most of
the features).

## Usage

> All examples underneath uses this repo (and the example folder).

List all workspaces:

```sh
deno run cli.ts --cwd example list
```

Run a command for one workspace (Runs the test task in workspace `a`):

```sh
deno run cli.ts --cwd example workspace a test
# OR
deno run cli.ts --cwd example workspaces --include a test
```

Run a command for all workspace:

```sh
deno run cli.ts --cwd example workspaces test
```

Run a command for workspace `a` and `b/c` but not `b/d`:

```sh
deno run cli.ts --cwd example workspaces --include ^a --include ^b --exclude d test
#OR
deno run cli.ts --cwd example workspaces --exclude d test
#OR
deno run cli.ts --cwd example workspaces --include "[ac]" test
```

Run the following to see the current help output

```sh
deno run --allow-read=`pwd` cli.ts
```

```text
Usage:   Deno Workspaces
Version: 0.0.1

Description:

  Deno Workspace Plugin

Options:

  -h, --help             - Show this help.
  -V, --version          - Show the version number for this program.
  -d, --debug            - Enable debug output.
  -c, --cwd      <path>  - Path to run the command in.                (Default: "/Users/halvardm/dev/mix/deno-workspace")

Commands:

  workspace   <workspaceName> <command> [arguments...]  - Runs a command in a workspace
  workspaces  <command> [arguments...]                  - Runs a command in the workspaces
  list                                                  - List workspaces
  tester      [arguments...]                            - create your command, and see how its parsed
```

### Commands

#### list

```text
-i, --include  <matcher>  - Only runs the commands against the workspaces fulfilling the pattern. Can be                                                         
                            provided multiple times.                                                                                                             
-e, --exclude  <matcher>  - Only runs the commands against the workspaces not fulfilling the pattern. Can be                                                     
                            provided multiple times.
```

#### workspace

```text
-s, --shell                 - Runs the provided args in the shell rather than a deno task.
-f, --forward   <arguments>  - Forwards the given commands. Usefull when providing flags. Can be provided
                                multiple times. Will be appended to arguments.
```

#### workspaces

```text
-s, --shell                  - Runs the provided args in the shell rather than a deno task.
-f, --forward   <arguments>  - Forwards the given commands. Usefull when providing flags. Can be provided
                                multiple times. Will be appended to arguments.
-i, --include   <matcher>    - Only runs the commands against the workspaces fulfilling the pattern. Can be
                                provided multiple times.
-e, --exclude   <matcher>    - Only runs the commands against the workspaces not fulfilling the pattern. Can be
                                provided multiple times.
-p, --parallel               - Runs the workspaces in parallel.
```

## Installation

You can either run the script using the url or you can install it globally.

### Run from url

```sh
deno run https://raw.githubusercontent.com/halvardssm/deno-workspaces/main/cli.ts --cwd example list
```

### Install globally

```sh
deno install --allow-read --allow-run --name deno-workspaces https://raw.githubusercontent.com/halvardssm/deno-workspaces/main/cli.ts
deno-workspaces --cwd example list
```

## Configuration

Deno Workspaces expects a `deno.json(c)` file in the working directory with the
following property:

```jsonc
{
  // ...other deno config
  ...
  // unique namescoped property to not collide with potential
  // future deno first party implementation of workspaces
  "@halvardssm/deno-workspaces": {
    // workspaces list with names (paths) relative
    // to the working directory. Cannot start with '.' or '/'.
    // Supports nested folders, but not nested workspaces.
    "workspaces": [
      "a",
      "b/c",
      "b/d"
    ]
  }
}
```
