import * as Solid from 'solid-js'
import * as THREE from 'three'

interface Geometry {
    geometry: Record<string, any>,
    textures: Object
}

type Nullable<T> = T | null
interface StageProps {
    geometries: Nullable<Geometry>[],
    isFemale: Nullable<boolean>
}

function FilterGeometryByGender(geometries: Record<string, any>, isFemale: boolean)
{
    const gearJs = geometries['gear.js']
    const geometryHashKey = (isFemale) ? 'female_override_art_arrangement' : 'base_art_arrangement'

    return gearJs.art_content_sets[0].arrangement.gear_set[geometryHashKey].geometry_hashes
}

function TriangulateStrips(indices: number[]) {
    const result = []

    for(let i = 0; i < indices.length - 2; ++i) {
        if(i & 1) {
            result.push(...[
                indices[i + 1],
                indices[i + 0],
                indices[i + 2]
            ])
        } else {
            result.push(...[
                indices[i + 0],
                indices[i + 1],
                indices[i + 2]
            ])
        }
    }

    return result
}

interface ParsedStagePart {
    primitiveType: number,
    groupedIndices: number[][],
    parsedGroupedIndices: number[][]
}

function ParseStageParts(geometryObject: Record<string, any>): ParsedStagePart[]
{
    console.log(geometryObject)

    const indices = geometryObject['0.indexbuffer.tgx'].index_buffer
    const stageParts = geometryObject['render_metadata.js'].render_model.render_meshes[0].stage_part_list

    const grouped = []

    for(const stagePart of stageParts) {
        const indicesInRange = indices.slice(stagePart.start_index, stagePart.start_index + stagePart.index_count)
        // Split the indices every time we encounter 65535
        const res = []

        const parsed = []

        const indicesString: string[] = indicesInRange.toString().split('65535')
        indicesString.forEach((val: string, i: number) => {
            // The first value has a trailing comma, the last value has a leading comma,
            // and every other value has a leading and trailing comma
            if(i === 0) {
                val = val.slice(0, -1)
            } else if(i === indicesString.length - 1) {
                val = val.slice(-1)
            } else {
                val = val.slice(1, -1)
            }

            const indices = val.split(',').map(Number)

            const triangulated = (stagePart.primitive_type === 5) ? TriangulateStrips(indices) : indices
            
            parsed.push(...triangulated)            

            res.push(val.split(',').map(Number))
        })

        // Group these indices by the stage part render mode
        // Please note - there's other information in the stage part that we're ignoring.
        grouped.push({
            primitiveType: stagePart.primitive_type,
            groupedIndices: res,
            parsedGroupedIndices: parsed
        })
    }

    return grouped
}


// Note - can't destructure props, as the effect subscription is bound to the props object...
export function Stage(props: StageProps) {

    Solid.createEffect(() => {
        // Only render once we have all of the information
        if(props.geometries.every((val) => val === null))
            return

        console.log('Ready to render')

        // Filter the geometries by gender
        const filteredGeometries = []
        props.geometries.forEach((val: Geometry) => {
            const toRenderIds = FilterGeometryByGender(val.geometry, props.isFemale)

            console.log(toRenderIds)

            const toRenderGeometries = []

            toRenderIds.forEach((id: string) => {
                toRenderGeometries.push(val.geometry[id])
            })

            filteredGeometries.push({
                geometryObjects: toRenderGeometries,
                gearJs: val.geometry['gear.js']
            })
        })

        // Test render the first object
        console.log(filteredGeometries[0])
        // Test the first geometry of the first object
        const stageParts = ParseStageParts(filteredGeometries[0].geometryObjects[0])
        // The parsedGroupedIndices are our triangulated indices. We can use these for rendering.
        console.log(stageParts)

    })

    let canvasElement: HTMLCanvasElement

    return (
        <canvas ref={canvasElement}/>
    )
}