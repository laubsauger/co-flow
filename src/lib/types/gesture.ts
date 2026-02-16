export type EquipmentItem = {
    name: string;
    optional?: boolean; // true = nice-to-have, false/undefined = required
};

// Basic Gesture Interface
export type Gesture = {
    id: string; // unique slug
    name: string;
    tags: string[];
    bodyAreas: string[];
    summary: string;
    description: string;
    durationDefaults: { minSec: number; defaultSec: number; maxSec: number };
    media: {
        audio: string;
        video?: string;
        poster?: string;
        captions?: string;
        transcript?: string;
    };
    intensity: number; // 1-5
    contraindications?: string[];
    equipment?: EquipmentItem[];
    contentHash?: string; // for change detection
    poster?: string; // top level poster override
};

// Content metadata interfaces for indexing
export type GestureMeta = Pick<Gesture, 'id' | 'name' | 'tags' | 'bodyAreas' | 'summary' | 'durationDefaults' | 'intensity' | 'media'>;
