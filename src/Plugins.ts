import { printErr } from "./utils/PrintLog.ts"

const plugins: Map<Deno.Command, Deno.ChildProcess> = new Map()

export async function launchAllPlugins() {
    const pluginsList = await Deno.readDir('./plugins')
    for await (const plugin of pluginsList) {
        if (plugin.name === '.gitkeep') {
            continue
        }
        try {
            const pluginCommand = new Deno.Command(`./plugins/${plugin.name}/main`,{args:[`./plugins/${plugin.name}/config.json`]})
            const pluginProcess = pluginCommand.spawn()
            plugins.set(pluginCommand, pluginProcess)
        } catch {
            printErr('主程序', `启动插件${plugin.name}失败`)
        } 
    }
}

function stopAllPlugins() {
    for (const pluginProcess of plugins.values()) {
        pluginProcess.kill()
    }
    Deno.exit()
}

Deno.addSignalListener('SIGTERM', () => {
    stopAllPlugins()
    Deno.exit()
})

Deno.addSignalListener('SIGINT', () => {
    stopAllPlugins()
    Deno.exit()
})