import { describe, it } from "https://deno.land/std@0.204.0/testing/bdd.ts";
import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.204.0/assert/mod.ts";
import { extractAndValidateConfigFromConfigFile } from "./config.ts";

describe("fs", () => {
  describe("extractAndValidateConfigFromConfigFile", () => {
    it("successfully validates the config", () => {
      const actual = extractAndValidateConfigFromConfigFile({
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
        extractAndValidateConfigFromConfigFile({
          "@halvardssm/denoworkspaces": {
            "workspaces": [
              "backend",
              "./frontend",
            ],
          },
        })
      );

      assertThrows(() =>
        extractAndValidateConfigFromConfigFile({
          "workspaces": [
            "backend",
            "./frontend",
          ],
        })
      );

      assertThrows(() =>
        extractAndValidateConfigFromConfigFile({
          "@halvardssm/deno-workspaces": {
            "workspacess": [
              "backend",
              "./frontend",
            ],
          },
        })
      );
      assertThrows(() =>
        extractAndValidateConfigFromConfigFile({
          "@halvardssm/deno-workspaces": {
            "workspaces": "asdf",
          },
        })
      );
    });
  });
});
