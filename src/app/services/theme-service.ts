import {Inject, Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {DOCUMENT} from '@angular/common';

@Injectable( {providedIn: 'root'} )
export class ThemeService {
  private renderer: Renderer2;

  constructor( rendererFactory: RendererFactory2, @Inject( DOCUMENT ) private document: Document ) {
    this.renderer = rendererFactory.createRenderer( null, null );
  }

  setTheme( theme: 'light' | 'dark' ) {
    const host = this.document.body; // or this.document.documentElement (html tag)

    if ( theme === 'dark' ) {
      this.renderer.addClass( host, 'dark-theme' );
      this.renderer.setStyle( host, 'color-scheme', 'dark' );
    } else {
      this.renderer.removeClass( host, 'dark-theme' );
      this.renderer.setStyle( host, 'color-scheme', 'light' );
    }
  }
}
