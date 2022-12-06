import { printErr } from "./utils/PrintLog.ts"

const pluginSet: Set<Deno.Process> = new Set()

export async function launchAllPlugins() {
    const pluginsList = await Deno.readDir('./plugins')
    for await (const plugin of pluginsList) {
        if (plugin.name === '.gitkeep') {
            continue
        }
        try {
            const pluginProcess = Deno.run({
                cmd: [`./plugins/${plugin.name}/main`, `./plugins/${plugin.name}/config.json`]
            })
            pluginSet.add(pluginProcess)
        } catch {
            printErr('主程序', `启动插件${plugin.name}失败`)
        } 
    }
}

function stopAllPlugins() {
    for (const pluginProcess of pluginSet) {
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