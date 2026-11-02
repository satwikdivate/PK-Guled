import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService, isSet } from '../core/content.service';
import { WhatsAppService } from '../core/whatsapp.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let site = content.site();
    @let nav = content.nav();
    <footer class="footer">
      <div class="container">
        <div class="cols">
          <div class="brand">
            <p class="name">{{ site.brand.name.toUpperCase() }}</p>
            <p class="about">{{ about() }}</p>
            <ul role="list" class="social">
              <li>
                <a [href]="site.social.instagram" target="_blank" rel="noopener"><app-icon name="instagram" [size]="16" />Instagram</a>
              </li>
              <li>
                <a [href]="site.social.facebook" target="_blank" rel="noopener"><app-icon name="facebook" [size]="16" />Facebook</a>
              </li>
              <li>
                <a [href]="site.social.youtube" target="_blank" rel="noopener"><app-icon name="youtube" [size]="16" />YouTube</a>
              </li>
            </ul>
          </div>

          <nav aria-labelledby="f-collections">
            <h2 id="f-collections" class="col-title">COLLECTIONS</h2>
            <ul role="list">
              @for (l of nav.footer.collections; track l.label) {
                <li><a [routerLink]="l.route" [fragment]="l.fragment">{{ l.label }}</a></li>
              }
            </ul>
          </nav>

          <nav aria-labelledby="f-help">
            <h2 id="f-help" class="col-title">HELP</h2>
            <ul role="list">
              @for (l of nav.footer.help; track l.label) {
                <li><a [routerLink]="l.route" [fragment]="l.fragment">{{ l.label }}</a></li>
              }
            </ul>
          </nav>

          <div>
            <h2 class="col-title">CONTACT</h2>
            <ul role="list">
              <li><a [href]="wa.tel()">{{ site.contact.phoneDisplay }}</a></li>
              <li><a [href]="wa.link()" target="_blank" rel="noopener">WhatsApp us</a></li>
              @if (hasEmail()) {
                <li><a [href]="'mailto:' + site.contact.email">Email us</a></li>
              }
              <li><a [href]="site.contact.mapsUrl" target="_blank" rel="noopener">Ilkal, Karnataka 587125</a></li>
            </ul>
          </div>
        </div>

        <div class="bottom">
          <p>© {{ year }} {{ site.brand.name }} {{ site.brand.tagline }}. All rights reserved.</p>
          @if (hasGstn()) {
            <p>GSTN {{ site.contact.gstn }}</p>
          }
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      background: var(--c-night);
      color: var(--c-night-text);
      padding: 72px 0 32px;
    }
    .cols {
      display: grid;
      gap: 40px;
      grid-template-columns: 1fr 1fr;
      @media (min-width: 1024px) {
        grid-template-columns: 340px 1fr 1fr 1fr;
        gap: 64px;
      }
    }
    .brand {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      gap: 14px;
      @media (min-width: 1024px) {
        grid-column: auto;
      }
    }
    .name {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 24px;
      letter-spacing: 1.92px;
      color: var(--c-cream);
    }
    .about {
      max-width: 300px;
      font-size: 15px;
      line-height: 1.6;
      color: #bfa9a0;
    }
    .social {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      a {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 36px;
        padding: 6px 12px;
        border: 1px solid #5a3a40;
        border-radius: var(--radius-pill);
        color: var(--c-cream);
        font-size: 13px;
        text-decoration: none;
        &:hover {
          border-color: var(--c-cream);
        }
      }
    }
    .col-title {
      margin: 0 0 12px;
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.68px;
      color: var(--c-gold-light);
    }
    ul[role='list'] li a {
      display: inline-block;
      padding-block: 6px;
      color: var(--c-night-text);
      font-size: 15px;
      text-decoration: none;
      &:hover {
        color: var(--c-white);
        text-decoration: underline;
      }
    }
    .social li a {
      padding-block: 6px;
    }
    .bottom {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px 24px;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid var(--c-night-line);
      font-size: 13px;
      color: var(--c-night-muted);
    }
  `,
})
export class FooterComponent {
  protected readonly content = inject(ContentService);
  protected readonly wa = inject(WhatsAppService);
  protected readonly year = new Date().getFullYear();
  protected readonly about = computed(() => this.content.site().footer.about);
  protected readonly hasEmail = computed(() => isSet(this.content.site().contact.email));
  protected readonly hasGstn = computed(() => isSet(this.content.site().contact.gstn));
}
