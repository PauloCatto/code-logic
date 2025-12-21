import { Routes } from '@angular/router';
import { Avatar } from './pages/avatar/avatar';
import { Level } from './pages/level/level';
import { Login } from './pages/login/login';
import { Map } from './pages/map/map';
import { Parent } from './pages/parent/parent';
import { Profiles } from './pages/profiles/profiles';
import { Progress } from './pages/progress/progress';
import { Welcome } from './pages/welcome/welcome';

export const routes: Routes = [
  { path: 'welcome', component: Welcome },
  { path: 'login', component: Login },
  { path: 'profiles', component: Profiles },
  { path: 'map', component: Map },
  { path: 'level/:id', component: Level },
  { path: 'avatar', component: Avatar },
  { path: 'parent', component: Parent },
  { path: 'progress', component: Progress },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
];
