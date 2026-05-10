import {inject, Injectable, signal, Type} from '@angular/core';
import {MatBottomSheet} from '@angular/material/bottom-sheet';

@Injectable( {providedIn: 'root'} )
export class BottomSheetState {

  readonly isOpen = signal( false );
  private readonly bottomSheet = inject( MatBottomSheet );

  open<T>( component: Type<T> ) {
    if ( this.isOpen() ) return;

    const ref = this.bottomSheet.open( component );
    this.isOpen.set( true );

    ref.afterDismissed().subscribe( () => {
      this.isOpen.set( false );
    } );
  }

  close() {
    this.bottomSheet.dismiss();
  }
}
