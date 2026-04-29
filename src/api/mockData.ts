import type { RawCategory, RawProject } from './types';

/**
 * Mock data for use when the backend database is unreachable (ECONNREFUSED).
 * These use Raw types because they simulate backend responses BEFORE mapping.
 */

export const MOCK_CATEGORIES: RawCategory[] = [
    {
        category_id: '11111111-1111-1111-1111-111111111111',
        parent_id: null,
        name_en: 'Construction',
        name_ar: 'البناء',
        icon: 'building',
        sort_order: 1,
        category_level: 'ROOT'
    },
    {
        category_id: '22222222-2222-2222-2222-222222222222',
        parent_id: null,
        name_en: 'Finishing',
        name_ar: 'التشطيبات',
        icon: 'paint-bucket',
        sort_order: 2,
        category_level: 'ROOT'
    },
    {
        category_id: '33333333-3333-3333-3333-333333333333',
        parent_id: null,
        name_en: 'Electrical',
        name_ar: 'الكهرباء',
        icon: 'zap',
        sort_order: 3,
        category_level: 'ROOT'
    }
];

export const MOCK_PROJECTS: RawProject[] = [
    {
        project_id: '00000000-0000-0000-0000-000000000001',
        name: 'Demo Project (Offline)',
        description: 'You are seeing this because the server is currently in maintenance mode.',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        estimation_id: '',
        total_cost: 0,
        leaf_count: 0
    }
];
