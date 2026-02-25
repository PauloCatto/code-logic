import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { ProfileData } from '../../models/profile.model';


@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
  }


  async signInAnonymously(): Promise<Session | null> {
    const { data, error } = await this.client.auth.signInAnonymously();
    if (error) {
      console.error('[Supabase] Erro ao criar sessão anônima:', error.message);
      return null;
    }
    return data.session;
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.client.auth.getSession();
    return data.session;
  }


  async getProfile(userId: string): Promise<ProfileData | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('[Supabase] Perfil não encontrado:', error.message);
      return null;
    }
    return data as ProfileData;
  }

  async upsertProfile(profile: ProfileData): Promise<boolean> {
    const { error } = await this.client.from('profiles').upsert({
      ...profile,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[Supabase] Erro ao salvar perfil:', error.message);
      return false;
    }
    return true;
  }


  async getLevelDefinition(
    id: number
  ): Promise<{ grid: number[][]; jump_allowed: boolean } | null> {
    const { data, error } = await this.client
      .from('level_definitions')
      .select('grid, jump_allowed')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    const grid: number[][] =
      typeof data.grid === 'string' ? JSON.parse(data.grid) : data.grid;

    return { grid, jump_allowed: data.jump_allowed ?? false };
  }


  async saveGameLog(params: {
    child_id: string;
    level_id: number;
    success: boolean;
    commands_used: string[];
  }): Promise<void> {
    const { error } = await this.client.from('game_logs').insert({
      child_id: params.child_id,
      level_id: params.level_id,
      success: params.success,
      commands_used: params.commands_used,
    });

    if (error) {
      console.error('[Supabase] Erro ao salvar log do jogo:', error.message);
    }
  }
}