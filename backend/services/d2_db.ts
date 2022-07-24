
// There are two d2 databases that we need to initialize:
// 1. The mobileAssetsDatabase
// 2. The DestinyItemManifest

import { D2APIRequest } from './d2api/base_request.ts'
import { GeometryBody } from '../domain/geometry_body.ts'

import { unZipFromURL } from 'https://deno.land/x/zip@v1.1.0/mod.ts'
import { DB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts"
import { exists } from 'https://deno.land/std@0.73.0/fs/exists.ts'

let jsonWorldContent: { [key: string]: { [key: string]: any } }
let mobileGearAssetDatabase: DB

// Gets the last element of an array
const last = (arr: any[]) => arr[arr.length - 1]

// Initialize the relevant databases
export async function D2InitDB()
{
    const json = await D2APIRequest('/Destiny2/Manifest/')

    console.log(`Loading with manifest version ${json.Response.version}`)

    console.log('Loading world content')
    // Load the world content
    jsonWorldContent = await (await fetch(`https://bungie.net${json.Response.jsonWorldContentPaths['en']}`)).json() as { [key: string]: any }
    // I should probably just save this and replace it when needed...

    // Load the gear content database

    // Unzip and save the sqlite database produced
    console.log('Unzipping and downloading gear asset information')
    
    const mostRecentPath = last(json.Response.mobileGearAssetDataBases).path
    const sqliteDbFilename = last(mostRecentPath.split('/'))

    const hasDbFile = await exists(sqliteDbFilename)

    if(!hasDbFile) {
        // Only download if we don't already have this
        console.log('Download required - downloading db')
        await unZipFromURL(`https://bungie.net${mostRecentPath}`)
    }

    mobileGearAssetDatabase = new DB(sqliteDbFilename)
}

// Query the mobile assets db
export function D2GetAssetInfo(id: number) {
    // d2api IDs are u32s, sqlite stores s32s. Convert our id:
    const s32Id = (new Int32Array([id]))[0]

    // Query normally
    const tableName = 'DestinyGearAssetsDefinition'

    const queryString = `SELECT json FROM ${tableName} WHERE id = ${s32Id}`

    const queryResult = mobileGearAssetDatabase.query(queryString)

    if(queryResult.length < 1)
        return null
    else
        return JSON.parse(String(queryResult[0][0])) as GeometryBody
}

export function D2GetEntityDefinition(id: string) {
    return jsonWorldContent['DestinyInventoryItemDefinition'][id] || null
}

export function D2GetDyeDefinition(id: number) {
    return {
        channel: jsonWorldContent['DestinyArtDyeReferenceDefinition'][id] || null,
        reference: jsonWorldContent['DestinyArtDyeChannelDefinition'][id] || null
    }
}
 
export function D2CloseDB()
{
    mobileGearAssetDatabase.close()  
}
