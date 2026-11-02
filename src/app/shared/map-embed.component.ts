import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ContentService, isSet } from '../core/content.service';

/** Google Maps iframe that is only loaded after the user asks for it. */
@Component({
  selector: 'app-map-embed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="map">
      @if (loaded() && src()) {
        <iframe
          [src]="src()"
          title="Map showing P K Guled Ilkal Sarees in Ilkal, Karnataka"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen
        ></iframe>
      } @else {
        <div class="placeholder">
          <img src="/icons/map-pin.svg" width="40" height="52" alt="" />
          <button type="button" class="btn btn--primary" (click)="loaded.set(true)">{{ label() }}</button>
          <a class="open" [href]="content.site().contact.mapsUrl" target="_blank" rel="noopener"
            >Open in Google Maps</a
          >
        </div>
      }
    </div>
  `,
  styles: `
    .map {
      position: relative;
      width: 100%;
      aspect-ratio: 4 / 3;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background:
        radial-gradient(circle at 30% 30%, rgb(255 255 255 / 35%), transparent 40%),
        repeating-linear-gradient(45deg, transparent 0 22px, rgb(122 31 43 / 4%) 22px 24px),
        var(--c-map);
    }
    iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
    .placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
    }
    .open {
      font-size: 14px;
      font-weight: 600;
      color: var(--c-muted);
    }
  `,
})
export class MapEmbedComponent {
  protected readonly content = inject(ContentService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly label = input('Show map');
  protected readonly loaded = signal(false);

  protected readonly src = computed(() => {
    const url = this.content.site().contact.mapsEmbed;
    return isSet(url) && url.startsWith('https://www.google.com/maps')
      ? this.sanitizer.bypassSecurityTrustResourceUrl(url)
      : null;
  });
}
