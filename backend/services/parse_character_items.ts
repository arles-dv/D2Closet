import { D2GetEntityDefinition, D2GetAssetInfo } from './d2_db.ts'
import { ExtractAssetInfo } from './extract_asset_info.ts'
import { D2APIRequest } from './d2api/base_request.ts'

// This implementation is quite dirty - clean it up later.

interface Shader {
    name: string,
    icon: string,
    id: string
}

interface Item {
    name: string,
    icon: string,
    id: string,
    shader?: Shader,
}

async function GetOrnamentAndShader(mType: string, mId: string, itemInstanceId: string)
{
    let item: Item | null = null
    let shader: Shader | undefined = undefined

    const instanceInfo = await D2APIRequest(`/Destiny2/${mType}/Profile/${mId}/Item/${itemInstanceId}/?components=ItemSockets`)
    for(const socket of instanceInfo.Response.sockets.data.sockets) {
        // Check if the socket is actually an armor piece
        if(!socket.plugHash)
            continue 

        const socketInfo = D2GetEntityDefinition(socket.plugHash)

        if(socketInfo.itemType === 2) {
            // We have an armor piece, which is an ornament
            item = {
                name: socketInfo.displayProperties.name,
                icon: 'https://bungie.net' + socketInfo.displayProperties.icon,
                id: socketInfo.hash
            } as Item
        } else if(socketInfo.itemType === 19 && socketInfo.itemSubType === 21) {
            // Exotic armor or weapon ornament
            item = {
                name: socketInfo.displayProperties.name,
                icon: 'https://bungie.net' + socketInfo.displayProperties.icon,
                id: socketInfo.hash
            } as Item
        } else if(socketInfo.itemType === 19 && socketInfo.itemSubType === 20) {
            // Shader
            shader = {
                name: socketInfo.displayProperties.name,
                icon: 'https://bungie.net' + socketInfo.displayProperties.icon,
                id: socketInfo.hash
            } as Shader
        }
    }

    if(item && shader) {
        item.shader = shader
    }

    return item
}

async function GetItemData(mType: string, mId: string, itemHash: string, itemInstanceId: string)
{
    let baseItem: Item | null = null 
    let ornament: Item | null = null
    const definition = D2GetEntityDefinition(itemHash)
    if(definition.itemType === 2) {
        // Save the base information
        baseItem = {
            name: definition.displayProperties.name,
            icon: 'https://bungie.net' + definition.displayProperties.icon,
            id: itemHash,
        }

        // Look up the instance id
        ornament = await GetOrnamentAndShader(mType, mId, itemInstanceId)
    } else {
        return null
    }

    // Get the geometry data of the armor piece we want to render (either ornament or item)

    const toRender = (!ornament || ornament.name === 'Default Ornament') ? baseItem : ornament

    const info = D2GetAssetInfo(parseInt(toRender.id))
    if(!info) {
        return {
            item: baseItem,
            ornament: ornament,
            geometry: null
        }
    }
    
    const geometry = await ExtractAssetInfo(info)
    return {
        item: baseItem,
        ornament: ornament,
        geometry: geometry
    }
}

export async function ParseCharacterInventory(mType: string, mId: string, cId: string)
{
    // Get the items within the inventory first
    const inventoryItems = await D2APIRequest(`/Destiny2/${mType}/Profile/${mId}/Character/${cId}?components=CharacterEquipment`)

    const items = inventoryItems.Response.equipment.data.items 

    const parsedItems = []

    for(const item of items) {
        const itemData = await GetItemData(mType, mId, item.itemHash, item.itemInstanceId)
        if(itemData) parsedItems.push(itemData)
    }

    return parsedItems
}