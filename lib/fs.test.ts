import {describe,it} from "https://deno.land/std@0.204.0/testing/bdd.ts"
import {assertEquals} from "https://deno.land/std@0.204.0/assert/mod.ts"
import { resolve } from "https://deno.land/std@0.204.0/path/mod.ts";
import { findConfigFilePath,readConfigFile } from "./fs.ts";

describe("fs",()=>{
    describe("findConfigFilePath",()=>{
        it("finds the jsonc file",()=>{
            const actual = findConfigFilePath(resolve(Deno.cwd(),"example"))
            assertEquals(actual,resolve(Deno.cwd(),"example/deno.jsonc"))
        })
    })

    describe("readConfigFile",()=>{
        it("reads the file",async()=>{
            const actual = await readConfigFile(resolve(Deno.cwd(),"example/deno.jsonc"))
            assertEquals(actual,{
                "@halvardssm/deno-workspaces":{
                  "workspaces":[
                    "backend",
                    "./frontend"
                  ]
                }
              })
        })
    })
})