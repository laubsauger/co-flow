import type { EquipmentItem } from './gesture';

// Flow Interface
export interface FlowStep {
    gestureId: string;
    durationSec: number;
    side?: 'left' | 'right' | 'none';
    notes?: string;
    title?: string; // override default title
    audio?: string; // override default audio
    video?: string; // override default video
    cues?: { time: number | string; label: string }[];
    // runtime overrides
    isCompleted?: boolean;
}

export interface Flow {
    id: string; // unique slug
    name: string;
    description: string;
    tags: string[];
    equipment?: EquipmentItem[];
    steps: FlowStep[];

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
}

// Content metadata interfaces for indexing
export type FlowMeta = Pick<Flow, 'id' | 'name' | 'tags' | 'description' | 'poster'> & { durationSec?: number; stepCount: number };
