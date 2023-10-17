import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const Config = z.object({
  workspaces: z.string().array(),
});
type Config = z.infer<typeof Config>;

const ConfigFile = z.object({
    "@halvardssm/deno-workspaces": Config,
  });
  type ConfigFile = z.infer<typeof ConfigFile>;

export function extractAndValidateConfigFromConfigFile(config: unknown){
    return ConfigFile.parse(config)["@halvardssm/deno-workspaces"]
}

/**
 * Filters workspaces on the provided include and exclude.
 * 
 * TODO: Optimize
 */
export function filterWorkspaces(workspaces:string[],options?:{include?:string[],exclude?:string[]}){
    let result = [...workspaces]
    
    if(options?.include?.length){
        result=result.filter((w)=>options.include!.some(i=>new RegExp(i).test(w)))
    }

    if(options?.exclude?.length){
        result=result.filter((w)=>!options.exclude!.some(i=>new RegExp(i).test(w)))
    }

    return result
}