import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    @if (estConnecte()) {
      <app-navbar />
    }
    <main [class.avec-navbar]="estConnecte()">
      <router-outlet />
    </main>
  `,
  styles: [`
    main { min-height: 100vh; background: #f0f4f8; }
    main.avec-navbar { min-height: calc(100vh - 64px); }
  `],
})
export class AppComponent {
  estConnecte = this.authService.utilisateurConnecte;

  constructor(private authService: AuthService) {}
}
