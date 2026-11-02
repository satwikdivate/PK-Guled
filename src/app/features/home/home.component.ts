import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService, isSet } from '../../core/content.service';
import { HomeConfig } from '../../core/models';
import { siteImg, siteLogo } from '../../core/platform';
import { SeoService } from '../../core/seo.service';
import { WhatsAppService } from '../../core/whatsapp.service';
import { MapEmbedComponent } from '../../shared/map-embed.component';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeadingComponent } from '../../shared/section-heading.component';
import { WhatsAppButtonComponent } from '../../shared/whatsapp-button.component';
import { HomeCollectionsComponent } from './home-collections.component';
import { HomeStoryComponent } from './home-story.component';

@Component({
  selector: 'app-home',
  imports: [
    NgOptimizedImage,
    RouterLink,
    SectionHeadingComponent,
    WhatsAppButtonComponent,
    RevealDirective,
    MapEmbedComponent,
    HomeCollectionsComponent,
    HomeStoryComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  /** Bound from the route resolver. */
  readonly home = input.required<HomeConfig>();

  protected readonly content = inject(ContentService);
  protected readonly wa = inject(WhatsAppService);
  protected readonly img = siteImg;
  protected readonly logo = siteLogo;
  protected readonly site = this.content.site;
  protected readonly reviewsHref = computed(() => {
    const href = this.home().reviews.cta.href;
    return isSet(href) ? href : null;
  });

  constructor() {
    const seo = inject(SeoService);
    effect(() => seo.update({ path: '/' }));
  }
}
