import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  constructor() {}

  async saveLevelProgress(profileId: string, levelId: string) {
    console.log(`[Supabase] Salvando progresso: Perfil ${profileId} -> Level ${levelId}`);
  }

  async getLevelData(levelId: string) {
    console.log(`[Supabase] Buscando dados do mapa para o level ${levelId}`);
  }
}