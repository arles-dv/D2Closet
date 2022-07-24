import { Router, Context, Status } from 'https://deno.land/x/oak@v10.6.0/mod.ts'
import { ParseCharacterInventory } from '../services/parse_character_items.ts'

async function GetItemDefinition({ request, response }: Context) {

    // Lots of error checking ahead

    const requiredParams = ['mType', 'mId', 'cId']
    const parsedParams = {} as Record<string, string>

    for(const param of requiredParams) {
        const sId = request.url.searchParams.get(param)

        if(!sId) {
            response.status = Status.BadRequest
            response.body = { 'error': `No "${param}" search param given. Format is endpoint?${param}=${param}` }
            return
        }


        parsedParams[param] = sId
    }

    // The params are good to use; get the character data
    const parsedData = await ParseCharacterInventory(parsedParams.mType, parsedParams.mId, parsedParams.cId)

    response.status = Status.OK
    response.body = parsedData
    response.headers.set('Access-Control-Allow-Origin', 'https://127.0.0.1:3000')
}



export const CharacterInfoRoutes = new Router()
    .get('/character', GetItemDefinition)