import { Injectable } from '@angular/core'
import { BaseTabComponent, TabContextMenuItemProvider, MenuItemOptions } from 'tabby-core'
import { SSHTabComponent } from 'tabby-ssh'
import { TmuxService } from './tmux.service'

@Injectable()
export class TmuxContextMenu extends TabContextMenuItemProvider {
    weight = 20

    constructor (private tmux: TmuxService) { super() }

    async getItems (tab: BaseTabComponent): Promise<MenuItemOptions[]> {
        if (!(tab instanceof SSHTabComponent) || !tab.sshSession) {
            return []
        }
        try {
            if (!await this.tmux.isInstalled(tab)) {
                const cmd = await this.tmux.buildInstallCommand(tab)
                return [{
                    label: 'tmux',
                    submenu: [cmd
                        ? { label: 'tmux is not installed — Install tmux…', click: () => this.tmux.install(tab, cmd) }
                        : { label: 'tmux is not installed (no supported package manager found)', enabled: false }],
                }]
            }
            const sessions = await this.tmux.listSessions(tab)
            return [{
                label: 'tmux',
                submenu: [
                    { label: 'New session', click: () => this.tmux.newSession(tab) },
                    {
                        label: 'Attach to existing',
                        enabled: sessions.length > 0,
                        submenu: sessions.map(s => ({
                            label: `${s.name} (${s.windows} win${s.attached ? ', attached' : ''})`,
                            click: () => this.tmux.attach(tab, s.name),
                        })),
                    },
                    { label: 'Detach', click: () => this.tmux.detach(tab) },
                    {
                        label: 'Close (kill) session',
                        enabled: sessions.length > 0,
                        submenu: sessions.map(s => ({ label: s.name, click: () => this.tmux.kill(tab, s.name) })),
                    },
                ],
            }]
        } catch {
            return []
        }
    }
}
