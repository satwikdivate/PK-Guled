import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ContentService, isSet } from '../../core/content.service';
import { HomeConfig } from '../../core/models';
import { SeoService } from '../../core/seo.service';
import { WhatsAppService } from '../../core/whatsapp.service';
import { IconComponent } from '../../shared/icon.component';
import { MapEmbedComponent } from '../../shared/map-embed.component';
import { SocialLinksComponent } from '../../shared/social-links.component';
import { WhatsAppButtonComponent } from '../../shared/whatsapp-button.component';

@Component({
  selector: 'app-visit',
  imports: [MapEmbedComponent, WhatsAppButtonComponent, IconComponent, SocialLinksComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let v = home().visit;
    @let site = content.site();
    @let page = site.pages.visit;
    <section class="section">
      <div class="container wrap">
        <div class="copy">
          <span class="eyebrow">{{ v.eyebrow }}</span>
          <h1>{{ v.heading }}</h1>
          <p class="lead">{{ v.text }}</p>

          <address class="card">
            <strong>{{ v.cardTitle }}</strong>
            @for (line of site.contact.address; track line) {
              <span>{{ line }}</span>
            }
          </address>

          <div class="card">
            <strong>{{ page.hoursLabel }}</strong>
            <span>{{ hours() }}</span>
          </div>

          <div class="ctas">
            <a class="btn btn--lg btn--primary" [href]="wa.tel()">
              <app-icon name="phone" />Call {{ site.contact.phoneDisplay }}
            </a>
            <app-whatsapp-button size="lg" label="Chat on WhatsApp" />
            <a class="btn btn--lg btn--outline" [href]="site.contact.mapsUrl" target="_blank" rel="noopener">
              <app-icon name="pin" />{{ v.directions }}
            </a>
            @if (reviewsUrl(); as url) {
              <a class="btn btn--lg btn--outline" [href]="url" target="_blank" rel="noopener">
                <span aria-hidden="true">★</span>{{ page.reviewsLabel }}
              </a>
            }
          </div>
          <app-social-links [label]="site.followLabel" />
        </div>
        <app-map-embed [label]="v.showMap" />
      </div>
    </section>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 40px;
      align-items: start;
      @media (min-width: 1024px) {
        grid-template-columns: minmax(0, 1fr) minmax(0, 560px);
        gap: 64px;
      }
    }
    .copy {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 22px;
    }
    .card {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
      max-width: 440px;
      padding: 18px 20px;
      border: 1px solid var(--c-sand);
      border-radius: var(--radius-md);
      background: var(--c-white);
      font-style: normal;
      font-size: 15px;
      line-height: 1.55;
      color: var(--c-muted);
      strong {
        color: var(--c-ink);
        font-size: 16px;
      }
    }
    .ctas {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
})
export class VisitComponent {
  readonly home = input.required<HomeConfig>();
  protected readonly content = inject(ContentService);
  protected readonly wa = inject(WhatsAppService);
  protected readonly reviewsUrl = computed(() => {
    const url = this.content.site().contact.reviewsUrl;
    return isSet(url) ? url : null;
  });
  protected readonly hours = computed(() => {
    const site = this.content.site();
    return isSet(site.contact.hours) ? site.contact.hours : site.pages.visit.hoursFallback;
  });

  constructor() {
    const page = this.content.site().pages.visit;
    const seo = inject(SeoService);
    seo.update({
      title: page.title,
      description: page.description,
      path: '/visit',
      jsonLd: [
        seo.breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Visit', path: '/visit' },
        ]),
      ],
    });
  }
}
