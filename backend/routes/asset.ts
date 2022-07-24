import { Router, Context, Status } from "https://deno.land/x/oak@v10.6.0/mod.ts"
import { D2GetAssetInfo } from '../services/d2_db.ts'
import { ExtractAssetInfo } from "../services/extract_asset_info.ts"

// GET /asset?id={id}
async function GetAsset({ request, response }: Context) {

    const sId = request.url.searchParams.get('id')

    if(!sId) {
        response.status = Status.BadRequest
        response.body = { 'error': 'No "id" search param given. Format is endpoint?id=(id)' }
        return
    }

    const id = parseInt(sId)

    if(Number.isNaN(id)) {
        response.status = Status.BadRequest
        response.body = { 'error': 'Id given was not convertible to number' }
    }

    const assetInfo = D2GetAssetInfo(id)

    if(!assetInfo) {
        response.status = Status.NotFound
        response.body = { error: `Item with ID ${id} not found` }
        return
    }

    const parsedAssetInfo = await ExtractAssetInfo(assetInfo)

    response.status = Status.OK
    response.body = { 
        assetInfo: assetInfo,
        finalAssetInfo: parsedAssetInfo 
    }
    response.headers.set('Access-Control-Allow-Origin', 'https://127.0.0.1:3000')
}

export const AssetRoutes = new Router()
    .get('/asset', GetAsset)