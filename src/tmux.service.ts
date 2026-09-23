import { Injectable } from '@angular/core'
import { log } from './log'

type SSHTabComponent = any

export interface TmuxSessionInfo { name: string, windows: number, attached: boolean }

const INSTALL_CMDS: [string, string][] = [
    ['apt-get', 'apt-get update && apt-get install -y tmux'],
    ['dnf', 'dnf install -y tmux'],
    ['yum', 'yum install -y tmux'],
    ['apk', 'apk add tmux'],
    ['pacman', 'pacman -Sy --noconfirm tmux'],
    ['zypper', 'zypper --non-interactive install tmux'],
    ['brew', 'brew install tmux'],
]

/** Runs commands on a separate exec channel of the tab's SSH connection */
@Injectable({ providedIn: 'root' })
export class TmuxService {
    async exec (tab: SSHTabComponent, command: string): Promise<{ out: string, ok: boolean }> {
        const ssh: any = tab.sshSession?.ssh
        if (!ssh) {
            return { out: '', ok: false }
        }
        const ch = await ssh.activateChannel(await ssh.openSessionChannel())
        const chunks: Uint8Array[] = []
        const done = new Promise<void>(resolve => {
            ch.closed$.subscribe({ complete: resolve, next: resolve })
            ch.eof$.subscribe({ complete: resolve, next: resolve })
            setTimeout(resolve, 8000)
        })
        ch.data$.subscribe((d: Uint8Array) => chunks.push(d))
        await ch.requestExec(command)
        await done
        log(`exec ${command.slice(0, 60)} -> ${Buffer.concat(chunks).toString().slice(0, 100)}`)
        return { out: Buffer.concat(chunks).toString(), ok: true }
    }

    async isInstalled (tab: SSHTabComponent): Promise<boolean> {
        const r = await this.exec(tab, 'command -v tmux >/dev/null 2>&1 && echo yes || echo no')
        return r.out.trim() === 'yes'
    }

    async listSessions (tab: SSHTabComponent): Promise<TmuxSessionInfo[]> {
        const r = await this.exec(tab, "tmux ls -F '#{session_name}\t#{session_windows}\t#{session_attached}' 2>/dev/null")
        return r.out.split('\n').filter(l => l.trim()).map(l => {
            const [name, windows, attached] = l.split('\t')
            return { name, windows: +windows, attached: +attached > 0 }
        })
    }

    /** Detects the remote package manager and returns a shell line that installs tmux (via sudo when not root) */
    async buildInstallCommand (tab: SSHTabComponent): Promise<string|null> {
        const probe = INSTALL_CMDS.map(([bin]) => `command -v ${bin} >/dev/null 2>&1 && echo ${bin}`).join('; ')
        const r = await this.exec(tab, probe)
        const found = r.out.split('\n')[0]?.trim()
        const entry = INSTALL_CMDS.find(([bin]) => bin === found)
        if (!entry) {
            return null
        }
        const cmd = entry[1]
        return entry[0] === 'brew' ? cmd : `if [ "$(id -u)" -eq 0 ]; then ${cmd}; else sudo sh -c '${cmd}'; fi`
    }

    // Actions run in the interactive terminal so the user sees them (and can type a sudo password)
    private q (s: string): string { return `'${s.replace(/'/g, "'\\''")}'` }
    newSession (tab: SSHTabComponent, name?: string): void { tab.sendInput(`tmux new-session${name ? ' -s ' + this.q(name) : ''}\r`) }
    attach (tab: SSHTabComponent, name: string): void { tab.sendInput(`tmux attach-session -t ${this.q(name)}\r`) }
    /** Types the command prefix without Enter so the user can type a name */
    newNamedSession (tab: SSHTabComponent): void { tab.sendInput('tmux new-session -s ') }
    /** Kills the session this terminal is attached to */
    closeCurrent (tab: SSHTabComponent): void { tab.sendInput('tmux kill-session\r') }
    detach (tab: SSHTabComponent): void { tab.sendInput('tmux detach-client 2>/dev/null\r') }
    async kill (tab: SSHTabComponent, name: string): Promise<void> { await this.exec(tab, `tmux kill-session -t ${this.q(name)}`) }
    install (tab: SSHTabComponent, cmd: string): void { tab.sendInput(cmd + '\r') }
}
