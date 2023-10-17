import { resolve } from "https://deno.land/std@0.204.0/path/mod.ts";
import { parse as parseJsonc} from "https://deno.land/std@0.204.0/jsonc/mod.ts";
import { DenoWorkspacesError } from "./error.ts";

/**
 * Finds the config file in a folder. Looks for the following files in priority:
 * 1. deno.jsonc
 * 2. deno.json
 */
export function findConfigFilePath(workingFolder:string):string{
   const folderContent =  [...Deno.readDirSync(resolve(workingFolder))]
    
    if(folderContent.find(e=>e.isFile&&e.name==="deno.jsonc")){
        return resolve(workingFolder,"deno.jsonc")
    } else if(folderContent.find(e=>e.isFile&&e.name==="deno.json")){
        return resolve(workingFolder,"deno.json")
    }

    throw new DenoWorkspacesError("Config file not found. Run the command in the working directory, or provide a path using `--cwd`.")
}

/**
 * Reads and returns the config file
 * @param path Absolute path
 */
export async function readConfigFile(path:string):Promise<any|null>{
    const contentRaw = await Deno.readTextFile(resolve(path))
    if(path.endsWith("/deno.jsonc")){
        return parseJsonc(contentRaw)
    } else if(path.endsWith("/deno.json")){
        return JSON.parse(contentRaw)
    }

    throw new DenoWorkspacesError("Config file not found. Run the command in the working directory, or provide a path using `--cwd`.")
}
