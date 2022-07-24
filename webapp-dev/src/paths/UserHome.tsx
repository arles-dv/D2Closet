import '../styles.css'

import * as Solid from 'solid-js'
import { useParams, useNavigate, NavigateOptions } from 'solid-app-router'

import { D2APIRequest } from '../d2api/base_request'

interface CharacterBrief {
    id: string,
    emblemPath: string,
    className: string,
    raceName: string,
    isFemale: boolean,
    displayGifUrl: string,
    guardianName: string
}

interface LoadedParams {
    type: number,
    id: number
}

export function UserHome() {

    const [charactersBrief, setCharactersBrief] = Solid.createSignal<CharacterBrief[]>([])

    const navigate = useNavigate()
    const { type, id } = useParams()

    Solid.onMount(async () => {

        // Get all of the characters present on the account (specifically their ids and class types)
        // We don't care about the inventories, as these will be managed on the backend
        const characters = await D2APIRequest(`/Destiny2/${type}/Profile/${id}?components=Profiles,Characters`)

        console.log(characters.Response)

        const characterIds = Object.keys(characters.Response.characters.data)

        const parsed: CharacterBrief[] = []

        // Please god change where these are hosted later...
        const classMap = [ 'Titan', 'Hunter', 'Warlock' ]
        const raceMap = [ 'Human', 'Awoken', 'Exo' ]
        const classDisplays = [
            'https://cdn.discordapp.com/attachments/933863656750473267/999175867810992138/titan-final.gif',
            'https://cdn.discordapp.com/attachments/933863656750473267/999175868461105202/hunter-final.gif',
            'https://cdn.discordapp.com/attachments/933863656750473267/999175868146528296/warlock-final.gif'
        ]

        // We need the emblem, class, gender
        characterIds.forEach((characterId) => {
            const currentCharacter = characters.Response.characters.data[characterId]

            parsed.push({
                id: characterId,
                emblemPath: 'https://bungie.net' + currentCharacter.emblemBackgroundPath,
                className: classMap[currentCharacter.classType],
                raceName: raceMap[currentCharacter.raceType],
                isFemale: Boolean(currentCharacter.genderType),
                displayGifUrl: classDisplays[currentCharacter.classType],
                guardianName: characters.Response.profile.data.userInfo.bungieGlobalDisplayName
            })            
        })

        setCharactersBrief(parsed)

    })

    function OnCharacterSelect(e: MouseEvent) {

        const target = e.target as HTMLElement

        const className = target.attributes['data-class'].value

        const character = charactersBrief().find((val: CharacterBrief) => val.className === className)!

        // Navigate to /users/:type/:id/:characterId
        navigate(`/users/${type}/${id}/character/${character.id}?f=${character.isFemale}`, {
            resolve: true,
        })
    }


    return <>
        <p> { (charactersBrief().length < 1) ? 'Loading...' : 'Loaded' } </p>
        <div class='center-center'>
            <div class='flex-horizontal gap-1em cursor-pointer'>
                <Solid.For each={charactersBrief()}>{(character) =>
                    <div
                        data-class={character.className}
                        class='flex-vertical'
                        onClick={OnCharacterSelect}
                    >
                        <div
                            data-class={character.className}
                            style={{ 
                                'width': '17em',
                                'height': '3.4em',
                                'background-image': `url(${character.emblemPath})`,
                                'background-size': 'contain'
                            }}
                        >
                            <p data-class={character.className} class='color-white guardian-name-text'> { character.guardianName } </p>
                            <p data-class={character.className} class='color-white guardian-description-text'>
                                    { character.raceName } { character.className }
                            </p>
                        </div>

                        <img
                            data-class={character.className}
                            src={character.displayGifUrl}
                            loading={'lazy'}
                        ></img>
                    </div>
                }</Solid.For>
            </div>
        </div>

    </>
}