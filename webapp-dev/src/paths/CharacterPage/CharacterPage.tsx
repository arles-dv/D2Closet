import '../../styles.css'
import './CharacterPage.css'

import * as Solid from 'solid-js'
import { useParams } from 'solid-app-router'

import { Stage } from '../../components/Stage'

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

interface ItemAndOrnament {
    geometry: any,
    item: Item,
    ornament: Item
}

const loadingGifUrl = 'https://scottiestech.info/material_icons/loader.gif'

// Fill the gear info with placeholder items
const placeholder: ItemAndOrnament = {
    item: {
        name: '',
        icon: loadingGifUrl,
        id: 'none',
    },
    ornament: {
        name: '',
        icon: loadingGifUrl,
        id: 'none',
        shader: {
            name: '',
            icon: loadingGifUrl,
            id: 'none'
        }
    },
    geometry: null
}

export function CharacterPage() {

    const { type, id, characterId } = useParams()

    const [isFemale, setIsFemale] = Solid.createSignal<boolean>(false)
    const [gCharacterGearInfo, setGCharacterGearInfo] = Solid.createSignal<ItemAndOrnament[] | null>(null)

    Solid.onMount(async () => {

        // Fill the loading info with blank stuff
        setGCharacterGearInfo([placeholder,placeholder,placeholder,placeholder,placeholder])

        // Send this information to the backend to get the equipment (+ ornaments) and shaders present on all gear
        // The backend will then feed this information into itself to get the render data, along with minimal descriptions of
        // the items in order to create the UI.
        const characterGearInfo = await (await fetch(`http://localhost:8000/character?mType=${type}&mId=${id}&cId=${characterId}`)).json()

        console.log(characterGearInfo)

        setGCharacterGearInfo(characterGearInfo)

        // Get gender info
        // Note that we have to do this after the request to ensure that the window location has changed - this was an issue before.
        const urlParams = new URLSearchParams(window.location.search)
        setIsFemale(Boolean(urlParams.get('f')!))
    })

    return (<>
        <div class='character-page-background center-center'>
            <Solid.Show when={gCharacterGearInfo()}>
                <div class='flex-vertical gap-1em grid-left'>
                    <Solid.For each={gCharacterGearInfo()}>{(gearInfo) =>
                        <div class='flex-horizontal-center-vertical gap-4em grid-item'>
                            <div class='padding-1em'></div>
                            <div class='img-grid-pad'>
                                <img class='img-size-4em' src={gearInfo.item.icon} loading={'eager'}/>
                            </div>
                            <div class='flex-horizontal-center-vertical'>
                                <img class='img-size-3em' src={gearInfo.ornament?.shader?.icon || 'https://www.bungie.net/common/destiny2_content/icons/aeacc06cbe147ec400a10225a4dcd504.png'} loading={'eager'}/>
                                <p class='img-detail-text'> { gearInfo.ornament?.shader?.name || 'Default Shader' } </p>
                            </div>
                            <div class='flex-horizontal-center-vertical'>
                                <img class='img-size-3em' src={gearInfo.ornament?.icon || 'https://www.bungie.net/common/destiny2_content/icons/4c4f01e77d6ffc68e7353a96dc3cb0aa.png'} loading={'eager'}/>
                                <p class='img-detail-text'> { gearInfo.ornament?.name || 'Default Ornament' } </p>
                            </div>
                        </div>
                    }</Solid.For>
                </div>
                <Stage 
                    geometries={gCharacterGearInfo().map((val) => val.geometry)}
                    isFemale={isFemale()}
                />
            </Solid.Show>
        </div>
    </>)
}