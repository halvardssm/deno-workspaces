import { describe, it } from "https://deno.land/std@0.204.0/testing/bdd.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.204.0/assert/mod.ts";
import { resolve } from "https://deno.land/std@0.204.0/path/mod.ts";
import { findConfigFilePath, readConfigFile, workspaceExists } from "./fs.ts";

describe("fs", () => {
  describe("findConfigFilePath", () => {
    it("finds the jsonc file", () => {
      const actual = findConfigFilePath(resolve(Deno.cwd(), "example"));
      assertEquals(actual, resolve(Deno.cwd(), "example/deno.jsonc"));
    });
  });

  describe("readConfigFile", () => {
    it("reads the file", async () => {
      const actual = await readConfigFile(
        resolve(Deno.cwd(), "example/deno.jsonc"),
      );
      assertEquals(actual, {
        "@halvardssm/deno-workspaces": {
          "workspaces": [
            "a",
            "b/c",
            "b/d",
          ],
        },
      });
    });
  });

  describe("workspaceExists", () => {
    it("finds the workspace", async () => {
      const actual = await workspaceExists(
        resolve(Deno.cwd(), "example/a"),
      );
      assert(actual);
    });

    it("does not find the workspace", async () => {
      const actual = await workspaceExists(
        resolve(Deno.cwd(), "example/d"),
      );
      assert(!actual);
    });
  });
});
