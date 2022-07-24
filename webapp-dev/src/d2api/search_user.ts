import { D2APIRequest } from './base_request'

export async function GetUserFromName(query: string)
{
    const [name, code] = query.split('#')

    if(!code) {
        return null
    }

    let page = 0
    let req = await D2APIRequest(`/User/Search/GlobalName/${page}`, {
        method: 'POST',
        body: JSON.stringify({ displayNamePrefix: name })
    })
    while(true) {

        for(const result of req.Response.searchResults) {
            if(result.bungieGlobalDisplayNameCode.toString() == code) {
                return result
            }
        }

        if(!req.Response.hasMore)
            break

        req = await D2APIRequest(`/User/Search/GlobalName/${++page}`, {
            method: 'POST',
            body: JSON.stringify({ displayNamePrefix: name })
        })
    }

    return null
}