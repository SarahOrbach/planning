import { NbDialogRef } from '@nebular/theme';
import { Component } from '@angular/core';

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.scss']
})
export class DeleteConfirmationComponent {

  constructor(protected dialogRef: NbDialogRef<DeleteConfirmationComponent>) {}

  confirmer() {
    this.dialogRef.close([true]);
  }
}
