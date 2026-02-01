import {inject, Injectable, signal} from '@angular/core';
import {MatBottomSheet} from '@angular/material/bottom-sheet';

@Injectable( {providedIn: 'root'} )
export class BottomSheetState {

  readonly isOpen = signal( false );
  private readonly bottomSheet = inject( MatBottomSheet );

  open( component: any ) {
    if ( this.isOpen() ) return;

    const ref = this.bottomSheet.open( component );
    this.isOpen.set( true );

    ref.afterDismissed().subscribe( () => {
      this.isOpen.set( false );
    } );
  }
}
