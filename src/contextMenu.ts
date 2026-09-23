import { Injectable } from '@angular/core'
import { BaseTabComponent, TabContextMenuItemProvider, MenuItemOptions } from 'tabby-core'
import { TmuxService } from './tmux.service'

@Injectable()
export class TmuxContextMenu extends TabContextMenuItemProvider {
    // just above 'Save as profile' (weight 0); the menu adds dividers around each provider's section
    weight = -0.5

    constructor (private tmux: TmuxService) { super() }

    getItems (tab: BaseTabComponent): Promise<MenuItemOptions[]> {
        return buildTmuxItems(this.tmux, tab)
    }
}

async function buildTmuxItems (tmuxSvc: TmuxService, tab: BaseTabComponent): Promise<MenuItemOptions[]> {
        const t = tab as any
        if (!t.sshSession) {
            return []
        }
        try {
            if (!await tmuxSvc.isInstalled(t)) {
                const cmd = await tmuxSvc.buildInstallCommand(t)
                return [{
                    label: 'ControlTmux',
                    submenu: [cmd
                        ? { label: 'tmux is not installed — Install tmux…', click: () => tmuxSvc.install(t, cmd) }
                        : { label: 'tmux is not installed (no supported package manager found)', enabled: false }],
                }]
            }
            const sessions = await tmuxSvc.listSessions(t)
            const list = (fn: (name: string) => void): MenuItemOptions[] => sessions.map((s, i) => ({
                label: s.name + (s.attached ? '  (attached)' : ''),
                accelerator: i < 9 ? String(i + 1) : undefined,
                click: () => fn(s.name),
            } as MenuItemOptions))
            const item = (label: string, key: string, rest: Partial<MenuItemOptions>): MenuItemOptions => ({ label, accelerator: key, ...rest } as MenuItemOptions)
            return [{
                label: 'ControlTmux',
                submenu: [
                    item('New session', 'N', {
                        submenu: [
                            item('Default name', 'D', { click: () => tmuxSvc.newSession(t) }),
                            item('Named…', 'N', { click: () => tmuxSvc.newNamedSession(t) }),
                        ],
                    }),
                    item('Attach to…', 'A', { enabled: sessions.length > 0, submenu: list(n => tmuxSvc.attach(t, n)) }),
                    item('Kill session', 'K', { enabled: sessions.length > 0, submenu: list(n => tmuxSvc.kill(t, n)) }),
                    { type: 'separator' },
                    item('Detach', 'D', { click: () => tmuxSvc.detach(t) }),
                    item('Close session', 'C', { click: () => tmuxSvc.closeCurrent(t) }),
                ],
            }]
        } catch {
            return []
        }
    }
