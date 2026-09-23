import { NgModule } from '@angular/core'
import { TabContextMenuItemProvider } from 'tabby-core'
import { TerminalContextMenuItemProvider } from 'tabby-terminal'
import { TmuxContextMenu, TmuxTerminalContextMenu } from './contextMenu'

import { log } from './log'

log('module loaded')

@NgModule({
    providers: [{ provide: TabContextMenuItemProvider, useClass: TmuxContextMenu, multi: true },
        { provide: TerminalContextMenuItemProvider, useClass: TmuxTerminalContextMenu, multi: true },
    ],
})
export default class ControlTmuxModule { }
