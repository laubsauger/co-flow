import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FLOWS_DIR = path.resolve(__dirname, '../src/content/flows');

// Helper to make folders if not exist
async function ensureDir(dir: string) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function main() {
    console.log('Seeding flows...');

    await ensureDir(FLOWS_DIR);

    // 1. Quick Neck & Shoulder Relief (Step Flow)
    const neckShoulderFlow = {
        id: 'quick-neck-relief',
        name: 'Quick Neck & Shoulder Relief',
        description: 'A 5-minute routine to release tension in the upper body.',
        tags: ['neck', 'shoulders', 'relaxation', 'quick'],
        steps: [
            {
                gestureId: 'neck-glides',
                durationSec: 60,
                title: 'Warmup Neck Glides',
                side: 'none',
                notes: 'Start gentle.',
            },
            {
                gestureId: 'shoulder-compression',
                durationSec: 60,
                side: 'left',
                notes: 'Focus on the trap muscle.',
            },
            {
                gestureId: 'shoulder-compression',
                durationSec: 60,
                side: 'right',
                notes: 'Switch sides.',
            },
            {
                gestureId: 'trapezius-squeeze',
                durationSec: 60,
                side: 'none',
                notes: 'Both hands squeezing gently.',
            },
            {
                gestureId: 'neck-glides',
                durationSec: 60,
                title: 'Cool Down Glides',
                side: 'none',
                notes: 'Finish with long strokes.',
            }
        ]
    };

    // 2. Full Body (Step Flow)
    const fullBodyFlow = {
        id: 'full-body-relaxation',
        name: 'Full Body Relaxation',
        description: 'A balanced sequence covering the whole body.',
        tags: ['full-body', 'relaxation', 'comprehensive'],
        steps: [
            { gestureId: 'neck-glides', durationSec: 60 },
            { gestureId: 'shoulder-compression', durationSec: 60, side: 'left' },
            { gestureId: 'shoulder-compression', durationSec: 60, side: 'right' },
            { gestureId: 'upper-back-circles', durationSec: 90 },
            { gestureId: 'lower-back-stretch', durationSec: 90 },
            { gestureId: 'calf-squeeze', durationSec: 60, side: 'left' },
            { gestureId: 'calf-squeeze', durationSec: 60, side: 'right' },
            { gestureId: 'foot-thumb-press', durationSec: 60, side: 'left' },
            { gestureId: 'foot-thumb-press', durationSec: 60, side: 'right' },
        ]
    };

    // 3. Hand & Arm Focus (Step Flow)
    const handArmFlow = {
        id: 'hand-arm-care',
        name: 'Hand & Arm Care',
        description: 'Perfect for desk workers and artists.',
        tags: ['hands', 'arms', 'repetitive-strain'],
        steps: [
            { gestureId: 'forearm-kneading', durationSec: 60, side: 'left' },
            { gestureId: 'hand-massage', durationSec: 60, side: 'left' },
            { gestureId: 'forearm-kneading', durationSec: 60, side: 'right' },
            { gestureId: 'hand-massage', durationSec: 60, side: 'right' }
        ]
    };

    // 4. Sleepy Time (Compiled Flow) - Simulated
    const sleepFlow = {
        id: 'deep-sleep-guide',
        name: 'Deep Sleep Guide',
        description: 'A continuous audio guide to help you drift off.',
        tags: ['sleep', 'relaxation', 'audio-only'],
        steps: [], // Empty steps for now, or could map to underlying gestures if we wanted UI sync
        compiledMedia: {
            audio: 'compiled-audio.mp3',
            chapters: [
                { stepIndex: 0, startTime: 0 },
                { stepIndex: 1, startTime: 300 }
            ]
        }
    };

    const flows = [neckShoulderFlow, fullBodyFlow, handArmFlow, sleepFlow];

    for (const flow of flows) {
        const targetDir = path.join(FLOWS_DIR, flow.id);
        await ensureDir(targetDir);

        await fs.writeFile(
            path.join(targetDir, 'flow.json'),
            JSON.stringify(flow, null, 2)
        );
        console.log(`Created flow: ${flow.id}`);
    }

    console.log('Done seeding flows.');
}

main().catch(console.error);
