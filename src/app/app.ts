import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContentService } from './core/content.service';
import { AnnouncementBarComponent } from './shared/announcement-bar.component';
import { FloatingWhatsAppComponent } from './shared/floating-whatsapp.component';
import { FooterComponent } from './shared/footer.component';
import { HeaderComponent } from './shared/header.component';
import { ToastComponent } from './shared/toast.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AnnouncementBarComponent,
    HeaderComponent,
    FooterComponent,
    FloatingWhatsAppComponent,
    ToastComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly content = inject(ContentService);
  protected readonly floatingLabel = computed(() => this.content.site().footer.floatingLabel);
}
