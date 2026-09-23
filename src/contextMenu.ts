import { Injectable } from '@angular/core'
import { BaseTabComponent, TabContextMenuItemProvider, MenuItemOptions } from 'tabby-core'
import { TerminalContextMenuItemProvider } from 'tabby-terminal'
import { log } from './log'
import { TmuxService } from './tmux.service'

@Injectable()
export class TmuxContextMenu extends TabContextMenuItemProvider {
    weight = 20

    constructor (private tmux: TmuxService) { super() }

    getItems (tab: BaseTabComponent): Promise<MenuItemOptions[]> {
        return buildTmuxItems(this.tmux, tab)
    }
}

/** Right-click menu inside the terminal body */
@Injectable()
export class TmuxTerminalContextMenu extends TerminalContextMenuItemProvider {
    weight = 20

    constructor (private tmux: TmuxService) { super() }

    getItems (tab: BaseTabComponent): Promise<MenuItemOptions[]> {
        return buildTmuxItems(this.tmux, tab)
    }
}

async function buildTmuxItems (tmuxSvc: TmuxService, tab: BaseTabComponent): Promise<MenuItemOptions[]> {
        const t = tab as any
        log(`getItems tab=${tab?.constructor?.name} hasSSH=${!!t.sshSession}`)
        if (!t.sshSession) {
            return []
        }
        try {
            if (!await tmuxSvc.isInstalled(t)) {
                const cmd = await tmuxSvc.buildInstallCommand(t)
                return [{
                    label: 'ControlTm&ux',
                    submenu: [cmd
                        ? { label: 'tmux is not installed — &Install tmux…', click: () => tmuxSvc.install(t, cmd) }
                        : { label: 'tmux is not installed (no supported package manager found)', enabled: false }],
                }]
            }
            const sessions = await tmuxSvc.listSessions(t)
            const list = (fn: (name: string) => void, withInfo: boolean): MenuItemOptions[] => sessions.map((s, i) => ({
                label: `&${i + 1}  ${s.name}${withInfo ? ` (${s.windows} win${s.attached ? ', attached' : ''})` : ''}`,
                click: () => fn(s.name),
            }))
            return [{
                label: 'ControlTm&ux',
                submenu: [
                    {
                        label: '&New session',
                        submenu: [
                            { label: '&Default name', click: () => tmuxSvc.newSession(t) },
                            { label: '&Named…', click: () => tmuxSvc.newNamedSession(t) },
                        ],
                    },
                    { label: '&Attach to existing', enabled: sessions.length > 0, submenu: list(n => tmuxSvc.attach(t, n), true) },
                    { label: '&Detach', click: () => tmuxSvc.detach(t) },
                    { label: '&Close session', click: () => tmuxSvc.closeCurrent(t) },
                    { label: '&Kill session', enabled: sessions.length > 0, submenu: list(n => tmuxSvc.kill(t, n), false) },
                ],
            }]
        } catch (e) {
            log(`error: ${e}`)
            return []
        }
    }
