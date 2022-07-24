// TODO - cors stuff

import { Application } from "https://deno.land/x/oak@v10.6.0/mod.ts"
import { D2InitDB, D2CloseDB } from './services/d2_db.ts'
import { AssetRoutes } from './routes/asset.ts'
import { ManifestDefinitionRoutes } from './routes/manifest_definition.ts'
import { CharacterInfoRoutes } from './routes/character_info.ts'

await D2InitDB()

const app = new Application()

app.use(AssetRoutes.routes())
app.use(AssetRoutes.allowedMethods())

app.use(ManifestDefinitionRoutes.routes())
app.use(ManifestDefinitionRoutes.allowedMethods())

app.use(CharacterInfoRoutes.routes())
app.use(CharacterInfoRoutes.allowedMethods())

console.log(`API ready at https://localhost:8000`)

await app.listen({ port: 8000 })
D2CloseDB()