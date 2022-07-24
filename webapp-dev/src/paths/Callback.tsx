// TODO - swap from explicitly using localstorage to a ContextProvider

import * as Solid from 'solid-js'
import { useNavigate } from 'solid-app-router'

import { D2APIRequest } from '../d2api/base_request'

interface AuthTokenResponse {
    access_token: string, 
    token_type: string, 
    expires_in: number, 
    refresh_token: string, 
    refresh_expires_in: number, 
    membership_id: number
}

interface AuthTokenError {
    error: number,
    error_message: string
}

interface ParsedTokenInfo {
    start: number,
    token: string,
    expiresIn: number,
    refresh: string
}

async function GetAuthInfo(code: string): Promise<ParsedTokenInfo> {
    // Get an access token from the auth code
    const tokenResp = await D2APIRequest('/App/OAuth/Token/', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic NDA3NDQ6c2V0RkpvT3c4Rkl4aW5paG9tend3akR2Q2NEcHdtT3ZVVkNpNHkuaGh2NA==',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `client_id=40744&grant_type=authorization_code&code=${code}`
    }) as any as AuthTokenResponse | AuthTokenError // This api response is not like the others... 

    if('error' in tokenResp) {
        console.error('Stale session - login again.')
        return null
    }

    const parsedTokenResp = {
        start: Date.now(),
        token: tokenResp.access_token,
        expiresIn: 3600 * 1000,
        refresh: tokenResp.refresh_token
    }

    // If we got a new token, set the values within localStorage
    localStorage.setItem('authInfo', JSON.stringify(parsedTokenResp))

    return parsedTokenResp
}

export function Callback(): Solid.JSXElement {

    const navigate = useNavigate()

    Solid.onMount(async () => {

        // The URL should have a code querystring param
        const params = new URLSearchParams(window.location.search)

        const code = params.get('code')

        if(!code) {
            console.error('FATAL: Unable to get auth code')
        }

        // Check if a user already has a valid login
        
        const prev = localStorage.getItem('authInfo')

        let tokenResp = null
    
        if(!prev) {
            tokenResp = await GetAuthInfo(code)
        } else {
            const prevAuthInfo = JSON.parse(prev) as ParsedTokenInfo
            if(Date.now() - prevAuthInfo.start > prevAuthInfo.expiresIn) {
                // Refresh later - for now, just generate another token 
                tokenResp = await GetAuthInfo(code)
            } else {
                // Valid token exists now
                tokenResp = prevAuthInfo
            }
        }

        console.log(tokenResp)

        if(!tokenResp) {
            return
        }

        // Use the response to get the membershipId and membershipType, and redirect the user to the next page
        const memberResp = await D2APIRequest('/User/GetMembershipsForCurrentUser/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenResp.token}`
            }
        })

        console.log(memberResp.Response.destinyMemberships[0])
        const memberInfo = { 
            id: memberResp.Response.destinyMemberships[0].membershipId, 
            type: memberResp.Response.destinyMemberships[0].membershipType
        }
        
        // Go to the user home page, and prevent the user from backing into this page on accident (thereby invalidating their session)
        navigate(`/users/${memberInfo.type}/${memberInfo.id}`, { replace: true })
    })

    return <div> yea </div>
}