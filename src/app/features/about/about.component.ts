import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { isSet } from '../../core/content.service';
import { AboutConfig } from '../../core/models';
import { siteImg } from '../../core/platform';
import { SeoService } from '../../core/seo.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { WhatsAppButtonComponent } from '../../shared/whatsapp-button.component';

@Component({
  selector: 'app-about',
  imports: [WhatsAppButtonComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let a = about();
    <section class="hero">
      <div class="container hero__inner">
        <span class="eyebrow">{{ a.hero.eyebrow }}</span>
        <h1>{{ a.hero.heading }}</h1>
        <p class="hero__lead">{{ a.hero.lead }}</p>
      </div>
    </section>

    <section class="section" aria-labelledby="founder-title">
      <div class="container split">
        <figure class="photo photo--portrait">
          <img
            [src]="img(a.founder.image.id, a.founder.image.width)"
            [width]="a.founder.image.width"
            [height]="a.founder.image.height"
            [alt]="a.founder.image.alt"
            fetchpriority="high"
          />
        </figure>
        <div class="copy">
          <span class="eyebrow">{{ a.founder.eyebrow }}</span>
          <h2 id="founder-title">{{ a.founder.heading }}</h2>
          @for (p of a.founder.paragraphs; track $index) {
            @if (filled(p)) {
              <p>{{ p }}</p>
            }
          }
        </div>
      </div>
    </section>

    @for (s of a.sections; track s.id; let odd = $odd) {
      <section class="section" [class.alt]="!odd" [id]="s.id" [attr.aria-labelledby]="s.id + '-title'">
        <div class="container split" [class.split--reverse]="odd" [class.split--text]="!s.image" appReveal>
          @if (s.image) {
            <figure class="photo">
              <img
                [src]="img(s.image.id, 480)"
                [width]="s.image.width"
                [height]="s.image.height"
                [alt]="s.image.alt"
                loading="lazy"
                decoding="async"
              />
            </figure>
          }
          <div class="copy">
            <span class="eyebrow">{{ s.eyebrow }}</span>
            <h2 [id]="s.id + '-title'">{{ s.heading }}</h2>
            @for (p of s.paragraphs; track $index) {
              @if (filled(p)) {
                <p>{{ p }}</p>
              }
            }
          </div>
        </div>
      </section>
    }

    <section class="final">
      <div class="container final__inner">
        <h2>{{ a.cta.heading }}</h2>
        <p>{{ a.cta.text }}</p>
        <app-whatsapp-button [label]="a.cta.button" size="xl" />
      </div>
    </section>
  `,
  styles: `
    .hero {
      padding: 56px 0 24px;
      @media (min-width: 1024px) {
        padding: 96px 0 32px;
      }
    }
    .hero__inner {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 880px;
      margin-inline: auto;
      text-align: center;
      align-items: center;
    }
    .hero__lead {
      font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem);
      line-height: 1.6;
      color: var(--c-muted);
    }
    .alt {
      background: var(--c-sand);
    }
    .split {
      display: grid;
      gap: 32px;
      align-items: center;
      @media (min-width: 900px) {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 64px;
        &.split--reverse .photo {
          order: 2;
        }
      }
      &.split--text {
        grid-template-columns: minmax(0, 760px);
        justify-content: center;
      }
    }
    .photo {
      margin: 0;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--c-sand);
      img {
        width: 100%;
        height: auto;
      }
      &--portrait {
        max-width: 420px;
        justify-self: center;
      }
    }
    .copy {
      display: flex;
      flex-direction: column;
      gap: 18px;
      p {
        font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
        line-height: 1.65;
        color: var(--c-muted);
      }
    }
    .final {
      background: linear-gradient(90deg, var(--c-deep), var(--c-maroon));
      padding-block: var(--section-y);
      text-align: center;
    }
    .final__inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      h2 {
        color: var(--c-ivory);
      }
      p {
        color: var(--c-cream);
        max-width: 620px;
      }
    }
  `,
})
export class AboutComponent {
  readonly about = input.required<AboutConfig>();
  protected readonly img = siteImg;
  protected readonly filled = isSet;

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const a = this.about();
      seo.update({
        title: a.seo.title,
        description: a.seo.description,
        path: '/about',
        jsonLd: [
          seo.breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Our Story', path: '/about' },
          ]),
        ],
      });
    });
  }
}
