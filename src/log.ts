import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

export function log (msg: string): void {
    try {
        fs.appendFileSync(path.join(os.homedir(), 'tabby-control-tmux.log'), `${new Date().toISOString()} ${msg}\n`)
    } catch { }
}
