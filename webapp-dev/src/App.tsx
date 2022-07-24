// What'd we learn? We'll mess around with textures more later, but be sure to save:
// - A local copy of the textures on the server, as they seem to be global (most of them)
// - the primary_albedo_tint, secondary_albedo_tint, and worn_tint for every dye

import './styles.css'

import * as Solid from 'solid-js'
import { Routes, Route } from 'solid-app-router'

import { Callback } from './paths/Callback'
import { UserHome } from './paths/UserHome'
import { CharacterPage } from './paths/CharacterPage/CharacterPage'

export function App(): Solid.JSXElement {

    Solid.onMount(() => {
        localStorage.clear()
    })

    async function LoginButton() {
        window.open('https://www.bungie.net/en/OAuth/Authorize?client_id=40744&response_type=code', '_self')
    }

    return (<>
        <Routes>
            <Route path='/callback' component={Callback}/>
            <Route path='/users/:type/:id' component={UserHome}/>
            <Route path='/users/:type/:id/character/:characterId' component={CharacterPage}/>
        </Routes>
        <div class='no-overflow'>
            <button class='base-button' onClick={LoginButton}> login </button>
        </div>
    </>)
}