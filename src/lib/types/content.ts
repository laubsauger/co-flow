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
    equipment?: string[];
};

export type Flow = {
    id: string; // unique slug
    name: string;
    description: string;
    tags: string[];
    steps: {
        gestureId: string;
        durationSec: number;
        side?: 'left' | 'right' | 'none';
        notes?: string;
        title?: string; // override default title
        audio?: string; // override default audio
        video?: string; // override default video
        cues?: { time: number | string; label: string }[];
    }[];
    // step vs compiled? 
    // Step flow has steps. Compiled flow might have compiledMedia as well.
    compiledMedia?: {
        audio: string;
        video?: string;
        chapters: {
            stepIndex: number;
            startTime: number;
        }[];
    };
    contentHash?: string; // for change detection
    poster?: string; // top level poster override
};

// Content metadata interfaces for indexing
export type GestureMeta = Pick<Gesture, 'id' | 'name' | 'tags' | 'bodyAreas' | 'summary' | 'durationDefaults' | 'intensity' | 'media'>;
export type FlowMeta = Pick<Flow, 'id' | 'name' | 'tags' | 'description' | 'poster'> & { durationSec?: number; stepCount: number };
