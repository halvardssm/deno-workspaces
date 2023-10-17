import { describe, it } from "https://deno.land/std@0.204.0/testing/bdd.ts";
import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.204.0/assert/mod.ts";
import {
  extractAndValidateConfigRawFromConfigFile,
  filterWorkspaces,
  transformConfigRawToConfig,
} from "./config.ts";

describe("config", () => {
  describe("transformConfigRawToConfig", () => {
    it("successfully transforms the config", () => {
      const actual = transformConfigRawToConfig("/test", {
        workspaces: ["a", "b/c"],
      });

      assertEquals(actual, {
        workspaces: {
          a: "/test/a",
          "b/c": "/test/b/c",
        },
      });
    });
  });

  describe("extractAndValidateConfigRawFromConfigFile", () => {
    it("successfully validates the config", () => {
      const actual = extractAndValidateConfigRawFromConfigFile({
        "@halvardssm/deno-workspaces": {
          "workspaces": [
            "backend",
            "./frontend",
          ],
        },
      });

      assertEquals(actual, {
        "workspaces": [
          "backend",
          "./frontend",
        ],
      });
    });

    it("fails to validates the config", () => {
      assertThrows(() =>
        extractAndValidateConfigRawFromConfigFile({
          "@halvardssm/denoworkspaces": {
            "workspaces": [
              "backend",
              "./frontend",
            ],
          },
        })
      );

      assertThrows(() =>
        extractAndValidateConfigRawFromConfigFile({
          "workspaces": [
            "backend",
            "./frontend",
          ],
        })
      );

      assertThrows(() =>
        extractAndValidateConfigRawFromConfigFile({
          "@halvardssm/deno-workspaces": {
            "workspacess": [
              "backend",
              "./frontend",
            ],
          },
        })
      );
      assertThrows(() =>
        extractAndValidateConfigRawFromConfigFile({
          "@halvardssm/deno-workspaces": {
            "workspaces": "asdf",
          },
        })
      );
    });
  });

  describe("filterWorkspaces", () => {
    it("successfully filters the workspaces with no include or exclude", () => {
      const actual = filterWorkspaces({
        a: "/test/a",
        "b/c": "/test/b/c",
      });

      assertEquals(actual, {
        a: "/test/a",
        "b/c": "/test/b/c",
      });
    });

    it("successfully filters the workspaces with include", () => {
      const actual = filterWorkspaces({
        a: "/test/a",
        "b/c": "/test/b/c",
      }, { include: ["a", "d"] });

      assertEquals(actual, {
        a: "/test/a",
      });
    });

    it("successfully filters the workspaces with exclude", () => {
      const actual = filterWorkspaces({
        a: "/test/a",
        "b/c": "/test/b/c",
      }, { exclude: ["b/c"] });

      assertEquals(actual, {
        a: "/test/a",
      });
    });

    it("successfully filters the workspaces with include and exclude", () => {
      const actual = filterWorkspaces({
        a: "/test/a",
        "b/c": "/test/b/c",
        "b/d": "/test/b/d",
      }, {
        include: ["b"],
        exclude: ["c"],
      });

      assertEquals(actual, {
        "b/d": "/test/b/d",
      });
    });
  });
});
