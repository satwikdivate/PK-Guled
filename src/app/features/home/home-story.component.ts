import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeConfig } from '../../core/models';
import { siteImg } from '../../core/platform';

/** "Our story" band. Deferred on the home page. */
@Component({
  selector: 'app-home-story',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = story();
    <div class="container inner">
      <figure class="photo">
        <img
          [src]="img(s.image.id, s.image.width)"
          [width]="s.image.width"
          [height]="s.image.height"
          [alt]="s.image.alt"
          loading="lazy"
          decoding="async"
        />
        @if (s.image.caption) {
          <figcaption>{{ s.image.caption }}</figcaption>
        }
      </figure>
      <div class="copy">
        <span class="eyebrow">{{ s.eyebrow }}</span>
        <h2 id="story-title">{{ s.heading }}</h2>
        @for (p of s.paragraphs; track $index) {
          <p class="para">{{ p }}</p>
        }
        <dl class="stats">
          @for (st of s.stats; track st.label) {
            <div>
              <dt>{{ st.label }}</dt>
              <dd>{{ st.value }}</dd>
            </div>
          }
        </dl>
        <div class="ctas">
          <a class="btn btn--lg btn--light" [routerLink]="s.primaryCta.route">{{ s.primaryCta.label }}</a>
          <a class="btn btn--lg btn--outline-light" [routerLink]="s.secondaryCta.route">{{ s.secondaryCta.label }}</a>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      background: var(--c-maroon);
      padding-block: calc(var(--section-y) + 16px);
    }
    .inner {
      display: grid;
      gap: 40px;
      align-items: center;
      @media (min-width: 900px) {
        grid-template-columns: minmax(0, 520fr) minmax(0, 600fr);
        gap: 80px;
      }
    }
    .photo {
      position: relative;
      margin: 0;
      aspect-ratio: 520 / 580;
      max-height: 580px;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: linear-gradient(132deg, var(--c-deep), #9a6a3a);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      figcaption {
        position: absolute;
        left: 16px;
        bottom: 16px;
        padding: 6px 10px;
        border-radius: var(--radius-pill);
        background: rgb(0 0 0 / 45%);
        color: var(--c-white);
        font-size: 12px;
        font-weight: 500;
      }
    }
    .copy {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .eyebrow {
      color: var(--c-gold-light);
    }
    h2 {
      color: var(--c-ivory);
      font-size: clamp(2rem, 1.6rem + 1.6vw, 3rem);
      line-height: 1.12;
    }
    .para {
      font-size: clamp(1rem, 0.95rem + 0.3vw, 1.125rem);
      line-height: 1.6;
      color: var(--c-cream);
    }
    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 24px 48px;
      margin: 0;
      padding-top: 8px;
      div {
        display: flex;
        flex-direction: column-reverse;
        gap: 4px;
      }
      dd {
        margin: 0;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 40px;
        line-height: 1.2;
        color: var(--c-gold-light);
      }
      dt {
        font-size: 14px;
        color: var(--c-cream);
      }
    }
    .ctas {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding-top: 8px;
    }
  `,
})
export class HomeStoryComponent {
  readonly story = input.required<HomeConfig['story']>();
  protected readonly img = siteImg;
}
