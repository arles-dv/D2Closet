import { Router, Context, Status } from 'https://deno.land/x/oak@v10.6.0/mod.ts'
import { D2GetEntityDefinition, D2GetDyeDefinition } from '../services/d2_db.ts'

function GetItemDefinition({ request, response }: Context) {
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
        return
    }

    const itemInfo = D2GetEntityDefinition(id)

    if(!itemInfo) {
        response.status = Status.NotFound
        response.body = { error: `Item with ID ${id} not found` }
        return
    }

    response.status = Status.OK
    response.body = {
        item: itemInfo
    }
    response.headers.set('Access-Control-Allow-Origin', 'https://127.0.0.1:3000')
}

function GetDyeDefinition({ request, response }: Context) {
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

    const itemInfo = D2GetDyeDefinition(id)

    if(!itemInfo) {
        response.status = Status.NotFound
        response.body = { error: `Item with ID ${id} not found` }
        return
    }

    response.status = Status.OK
    response.body = {
        dye: itemInfo
    }
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')
}

export const ManifestDefinitionRoutes = new Router()
    .get('/definition/item', GetItemDefinition)
    .get('/definition/dye', GetDyeDefinition)