export type UserMode = 'child' | 'adult';

export const LS_KEYS = {
    playerName: 'kl_player_name',
    playerAvatar: 'kl_player_avatar',
    unlockedLevel: 'unlockedLevel',
} as const;

export interface ProfileData {
    id: string;
    player_name?: string;
    avatar_icon?: string;
    current_unlocked_level?: number;
    role?: string;
    full_name?: string;
}
