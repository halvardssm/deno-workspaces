import { describe, it } from "https://deno.land/std@0.204.0/testing/bdd.ts";
import {
  assert,
  assertEquals,
  assertFalse,
  assertInstanceOf,
  assertIsError,
} from "https://deno.land/std@0.204.0/assert/mod.ts";
import { Runner } from "./runner.ts";
import { resolve } from "https://deno.land/std@0.204.0/path/resolve.ts";
import { DenoWorkspacesError } from "./error.ts";

describe("runner", () => {
  describe("Runner", () => {
    it("should construct with defaults", () => {
      const runner = new Runner({
        command: "list",
        arguments: ["a", "b"],
        cwd: "/test",
      });
      assertInstanceOf(runner, Runner);
      assertEquals(runner.arguments, ["a", "b"]);
      assertEquals(runner.cwd, "/test");
      assertFalse(runner.debug);
      assertFalse(runner.shell);
      assertFalse(runner.parallel);
      assertEquals(runner.forward, []);
      assertEquals(runner.include, []);
      assertEquals(runner.exclude, []);
    });

    it("should construct with provided data", () => {
      const actual = new Runner({
        command: "list",
        arguments: ["a", "b"],
        cwd: "/test",
        debug: true,
        shell: true,
        parallel: true,
        forward: ["c"],
        include: ["d"],
        exclude: ["e"],
      });
      assertInstanceOf(actual, Runner);
      assertEquals(actual.arguments, ["a", "b"]);
      assertEquals(actual.cwd, "/test");
      assert(actual.debug);
      assert(actual.shell);
      assert(actual.parallel);
      assertEquals(actual.forward, ["c"]);
      assertEquals(actual.include, ["d"]);
      assertEquals(actual.exclude, ["e"]);
    });

    describe("getWorkspaces", () => {
      it("should succeed with defaults", async () => {
        const cwd = resolve(Deno.cwd(), "example");
        const runner = new Runner({
          command: "list",
          arguments: ["test"],
          cwd,
          debug: false,
          shell: false,
          parallel: false,
          forward: [],
          include: [],
          exclude: [],
        });
        const actual = await runner.getWorkspaces();

        assertEquals(actual, {
          "a": resolve(cwd, "a"),
          "b/c": resolve(cwd, "b/c"),
          "b/d": resolve(cwd, "b/d"),
        });
      });

      it("should succeed with data provided", async () => {
        const cwd = resolve(Deno.cwd(), "example");
        const runner = new Runner({
          command: "list",
          arguments: ["test"],
          cwd,
          debug: false,
          shell: false,
          parallel: false,
          forward: [],
          include: ["a", "b"],
          exclude: ["d"],
        });
        const actual = await runner.getWorkspaces();

        assertEquals(actual, {
          "a": resolve(cwd, "a"),
          "b/c": resolve(cwd, "b/c"),
        });
      });

      it("should fail with missing workspace", async () => {
        const cwd = resolve(Deno.cwd(), "example/b");
        const runner = new Runner({
          command: "list",
          arguments: ["test"],
          cwd,
          debug: false,
          shell: false,
          parallel: false,
          forward: [],
          include: [],
          exclude: [],
        });

        try {
          await runner.getWorkspaces();
          assert(false);
        } catch (e) {
          assertIsError(
            e,
            DenoWorkspacesError,
            `The following workspaces does not exists in ${cwd}:\na (at ${cwd}/a)\nb (at ${cwd}/b)`,
          );
        }
      });
    });
  });
});
