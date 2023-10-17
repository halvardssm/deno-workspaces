import { ParsedArgs } from "../cli.ts";
import { extractAndValidateConfigFromConfigFile, filterWorkspaces } from "./config.ts";
import { findConfigFilePath,readConfigFile } from "./fs.ts";

export async function initDenoWorkspace(args:ParsedArgs){
    const configFilePath =  findConfigFilePath(args.cwd)

    const configFileContent = await readConfigFile(configFilePath)

    const config = extractAndValidateConfigFromConfigFile(configFileContent)

    const filteredWorkspaces = filterWorkspaces(config.workspaces,{include:args.include,exclude:args.exclude})

    if(args.topLevelCommand==="workspaces" && args.args[0]==='list'){
        console.info(JSON.stringify(filteredWorkspaces))
        Deno.exit(1)
    }

    if(args.topLevelCommand==="workspace")
    console.log(config,filteredWorkspaces)
}