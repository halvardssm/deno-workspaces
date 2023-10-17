import { describe, it } from "https://deno.land/std@0.204.0/testing/bdd.ts";
import {
  assert,
  assertEquals,
  assertFalse,
  assertStringIncludes,
} from "https://deno.land/std@0.204.0/assert/mod.ts";
import { resolve } from "https://deno.land/std@0.204.0/path/resolve.ts";

describe("cli", () => {
  it("should run list command", async () => {
    const cwd = resolve(Deno.cwd(), "example");
    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "-A",
        "cli.ts",
        "-c",
        cwd,
        "list",
      ],
    });

    const { stderr, stdout, success, code } = await command.output();

    const stdoutText = new TextDecoder().decode(stdout);
    const stderrText = new TextDecoder().decode(stderr);

    const errorOutput = `
-------------------
Success: ${success}
Code: ${code}
Stdout: 
-
${stdoutText}
-
Stderr:
-
${stderrText}
-
-------------------
`;

    assert(success, errorOutput);
    assertEquals(code, 0, errorOutput);
    assertStringIncludes(stdoutText, `${cwd}/a`, errorOutput);
    assertStringIncludes(stdoutText, `${cwd}/b/c`, errorOutput);
    assertStringIncludes(stdoutText, `${cwd}/b/d`, errorOutput);
  });

  it("should run workspace command", async () => {
    const cwd = resolve(Deno.cwd(), "example");
    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "-A",
        "cli.ts",
        "-c",
        cwd,
        "workspace",
        "a",
        "test",
      ],
    });

    const { stderr, stdout, success, code } = await command.output();

    const stdoutText = new TextDecoder().decode(stdout);
    const stderrText = new TextDecoder().decode(stderr);

    const errorOutput = `
-------------------
Success: ${success}
Code: ${code}
Stdout: 
-
${stdoutText}
-
Stderr:
-
${stderrText}
-
-------------------
`;

    assert(success, errorOutput);
    assertEquals(code, 0, errorOutput);
    assertStringIncludes(
      stdoutText,
      `Workspace 'a' at '${cwd}/a' exited with code '0' as 'success'`,
      errorOutput,
    );
    assertStringIncludes(stdoutText, `test a`, errorOutput);
  });

  it("should run workspace command on missing workspace", async () => {
    const cwd = resolve(Deno.cwd(), "example");
    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "-A",
        "cli.ts",
        "-c",
        cwd,
        "workspace",
        "missing",
        "test",
      ],
    });

    const { stderr, stdout, success, code } = await command.output();

    const stdoutText = new TextDecoder().decode(stdout);
    const stderrText = new TextDecoder().decode(stderr);

    const errorOutput = `
-------------------
Success: ${success}
Code: ${code}
Stdout: 
-
${stdoutText}
-
Stderr:
-
${stderrText}
-
-------------------
`;

    assertFalse(success, errorOutput);
    assertEquals(code, 1, errorOutput);
    assertStringIncludes(
      stderrText,
      `Workspace 'missing' does not exist in config`,
      errorOutput,
    );
  });

  it("should run workspaces command", async () => {
    const cwd = resolve(Deno.cwd(), "example");
    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "-A",
        "cli.ts",
        "-c",
        cwd,
        "workspaces",
        "test",
      ],
    });

    const { stderr, stdout, success, code } = await command.output();

    const stdoutText = new TextDecoder().decode(stdout);
    const stderrText = new TextDecoder().decode(stderr);

    const errorOutput = `
-------------------
Success: ${success}
Code: ${code}
Stdout: 
-
${stdoutText}
-
Stderr:
-
${stderrText}
-
-------------------
`;

    assert(success, errorOutput);
    assertEquals(code, 0, errorOutput);
    assertStringIncludes(
      stdoutText,
      `Workspace 'a' at '${cwd}/a' exited with code '0' as 'success'`,
      errorOutput,
    );
    assertStringIncludes(stdoutText, `test a`, errorOutput);
    assertStringIncludes(
      stdoutText,
      `Workspace 'b/c' at '${cwd}/b/c' exited with code '0' as 'success'`,
      errorOutput,
    );
    assertStringIncludes(stdoutText, `test b/c`, errorOutput);
    assertStringIncludes(
      stdoutText,
      `Workspace 'b/d' at '${cwd}/b/d' exited with code '0' as 'success'`,
      errorOutput,
    );
    assertStringIncludes(stdoutText, `test b/d`, errorOutput);
  });

  it("should run workspaces command in parallel", async () => {
    const cwd = resolve(Deno.cwd(), "example");
    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "-A",
        "cli.ts",
        "-c",
        cwd,
        "workspaces",
        "-p",
        "test",
      ],
    });

    const { stderr, stdout, success, code } = await command.output();

    const stdoutText = new TextDecoder().decode(stdout);
    const stderrText = new TextDecoder().decode(stderr);

    const errorOutput = `
-------------------
Success: ${success}
Code: ${code}
Stdout: 
-
${stdoutText}
-
Stderr:
-
${stderrText}
-
-------------------
`;

    assert(success, errorOutput);
    assertEquals(code, 0, errorOutput);
    assertStringIncludes(
      stdoutText,
      `Workspace 'a' at '${cwd}/a' exited with code '0' as 'success'`,
      errorOutput,
    );
    assertStringIncludes(stdoutText, `test a`, errorOutput);
    assertStringIncludes(
      stdoutText,
      `Workspace 'b/c' at '${cwd}/b/c' exited with code '0' as 'success'`,
      errorOutput,
    );
    assertStringIncludes(stdoutText, `test b/c`, errorOutput);
    assertStringIncludes(
      stdoutText,
      `Workspace 'b/d' at '${cwd}/b/d' exited with code '0' as 'success'`,
      errorOutput,
    );
    assertStringIncludes(stdoutText, `test b/d`, errorOutput);
  });
});
