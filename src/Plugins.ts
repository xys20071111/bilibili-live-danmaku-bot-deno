const pluginSet: Set<Deno.Process> = new Set()

export async function launchAllPlugins() {
    const pluginsList = await Deno.readDir('./plugins')
    for await (const plugin of pluginsList) {
        if (plugin.name === '.gitkeep') {
            continue
        }
        const pluginProcess = Deno.run({
            cmd: [`./plugins/${plugin.name}/${plugin.name}`, `./plugins/${plugin.name}/config.json`]
        })
        pluginSet.add(pluginProcess)
    }
}

Deno.addSignalListener("SIGTERM", () => {
    for (const pluginProcess of pluginSet) {
        pluginProcess.kill()
    }
    Deno.exit()
})

Deno.addSignalListener("SIGINT", () => {
    for (const pluginProcess of pluginSet) {
        pluginProcess.kill()
    }
    Deno.exit()
})