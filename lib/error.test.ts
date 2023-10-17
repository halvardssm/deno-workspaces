import { describe, it } from "https://deno.land/std@0.204.0/testing/bdd.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.204.0/assert/mod.ts";
import { DenoWorkspacesError } from "./error.ts";

describe("error", () => {
  describe("DenoWorkspacesError", () => {
    it("should construct", () => {
      const err = new DenoWorkspacesError("Test error");
      assertInstanceOf(err, DenoWorkspacesError);
      assertEquals(err.message, "Test error");
      assertEquals(err.name, "DenoWorkspacesError");
    });

    it("should throw correctly", () => {
      try {
        throw new DenoWorkspacesError("Test error");
      } catch (err) {
        assertInstanceOf(err, DenoWorkspacesError);
        assertObjectMatch(err, {
          message: "Test error",
          name: "DenoWorkspacesError",
        });
      }
    });
  });
});
