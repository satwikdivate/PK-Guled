import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let page = content.site().pages.notFound;
    <section class="section">
      <div class="container wrap">
        <span class="eyebrow">{{ page.eyebrow }}</span>
        <h1>{{ page.heading }}</h1>
        <p class="lead">{{ page.text }}</p>
        <a routerLink="/collections" class="btn btn--lg btn--primary">{{ page.button }}</a>
        <ul role="list" class="links">
          @for (c of content.categories(); track c.slug) {
            <li><a class="chip" [routerLink]="['/collections', c.slug]">{{ c.shortTitle }}</a></li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    .wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      text-align: center;
      max-width: 820px;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-top: 16px;
    }
  `,
})
export class NotFoundComponent {
  protected readonly content = inject(ContentService);

  constructor() {
    const page = this.content.site().pages.notFound;
    inject(SeoService).update({ title: page.title, path: '/404', noindex: true });
  }
}
