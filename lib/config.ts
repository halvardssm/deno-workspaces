import { resolve } from "https://deno.land/std@0.204.0/path/resolve.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const ConfigRaw = z.object({
  workspaces: z.string().array(),
});
type ConfigRaw = z.infer<typeof ConfigRaw>;

const ConfigFile = z.object({
  "@halvardssm/deno-workspaces": ConfigRaw,
});
type ConfigFile = z.infer<typeof ConfigFile>;

const Config = z.object({
  workspaces: z.record(z.string()),
});
type Config = z.infer<typeof Config>;

/**
 * Transforms raw config into config with a resolved path
 */
export function transformConfigRawToConfig(
  cwd: string,
  config: ConfigRaw,
): Config {
  const transformedConfig: Config = {
    workspaces: config.workspaces.reduce((previous, current) => {
      return { ...previous, [current]: resolve(cwd, current) };
    }, {} as Config["workspaces"]),
  };

  return transformedConfig;
}

/**
 * Extracts the raw config from the config file
 */
export function extractAndValidateConfigRawFromConfigFile(
  config: unknown,
): ConfigRaw {
  return ConfigFile.parse(config)["@halvardssm/deno-workspaces"];
}

/**
 * Filters workspaces on the provided include and exclude.
 *
 * TODO: Optimize
 */
export function filterWorkspaces(
  workspaces: Config["workspaces"],
  options?: { include?: string[]; exclude?: string[] },
) {
  let filteredWorkspaces = [...Object.keys(workspaces)];

  if (options?.include?.length) {
    filteredWorkspaces = filteredWorkspaces.filter((w) =>
      options.include!.some((i) => new RegExp(i).test(w))
    );
  }

  if (options?.exclude?.length) {
    filteredWorkspaces = filteredWorkspaces.filter((w) =>
      !options.exclude!.some((i) => new RegExp(i).test(w))
    );
  }

  const result: Config["workspaces"] = {};

  for (const w of filteredWorkspaces) {
    result[w] = workspaces[w];
  }

  return result;
}
