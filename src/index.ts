import { NgModule } from '@angular/core'
import { TabContextMenuItemProvider } from 'tabby-core'
import { TmuxContextMenu } from './contextMenu'


@NgModule({
    providers: [{ provide: TabContextMenuItemProvider, useClass: TmuxContextMenu, multi: true },
    ],
})
export default class ControlTmuxModule { }
