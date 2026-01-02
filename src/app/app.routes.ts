import { Routes } from '@angular/router';
import { Avatar } from './pages/avatar/avatar';
import { Level } from './pages/level/level';
import { Profiles } from './pages/profiles/profiles';
import { Welcome } from './pages/welcome/welcome';
import { Map } from './pages/map/map';
import { Login } from './components/login/login';
import { adultGuard } from './core/guards/adult-guard';
import { Home } from './pages/adult/home/home';

export const routes: Routes = [
  { path: 'welcome', component: Welcome },
  { path: 'login', component: Login },
  { path: 'profiles', component: Profiles },
  { path: 'map', component: Map },
  { path: 'level/:id', component: Level },
  { path: 'avatar', component: Avatar },
  { path: 'adult', component: Home, canActivate: [adultGuard] }, // 🔒 protegido
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
];
