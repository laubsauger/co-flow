import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GESTURES_DIR = path.resolve(__dirname, '../src/content/gestures');

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

const gestures = [
    { name: 'Neck Glides', bodyAreas: ['neck'], intensity: 2, summary: 'Gentle strokes down the neck.' },
    { name: 'Shoulder Compression', bodyAreas: ['shoulders'], intensity: 3, summary: 'Press firmly on the trapezius.' },
    { name: 'Forearm Kneading', bodyAreas: ['arms'], intensity: 3, summary: 'Knead the forearm muscles.' },
    { name: 'Hand Massage', bodyAreas: ['hands'], intensity: 2, summary: 'Rub the palm and fingers.' },
    { name: 'Upper Back Circles', bodyAreas: ['back'], intensity: 3, summary: 'Circular motions around shoulder blades.' },
    { name: 'Lower Back Stretch', bodyAreas: ['back'], intensity: 2, summary: 'Gentle stretch for lumbar area.' },
    { name: 'Calf Squeeze', bodyAreas: ['legs'], intensity: 4, summary: 'Squeeze the calf muscles rhythmically.' },
    { name: 'Foot Thumb Press', bodyAreas: ['feet'], intensity: 4, summary: 'Press thumbs into the sole.' },
    { name: 'Scalp Massage', bodyAreas: ['head'], intensity: 1, summary: 'Fingertip circles on the scalp.' },
    { name: 'Jaw Release', bodyAreas: ['face'], intensity: 2, summary: 'Gentle pressure on jaw muscles.' },
    { name: 'Pectoral Stretch', bodyAreas: ['chest'], intensity: 2, summary: 'Open up the chest area.' },
    { name: 'Trapezius Squeeze', bodyAreas: ['shoulders'], intensity: 4, summary: 'Squeeze the top of shoulders.' },
];

async function main() {
    console.log('Seeding 12 gestures...');

    for (const g of gestures) {
        const slug = slugify(g.name);
        const targetDir = path.join(GESTURES_DIR, slug);

        // Check if exists
        try {
            await fs.access(targetDir);
            console.log(`Skipping ${slug} (already exists)`);
            continue;
        } catch {
            // Directory doesn't exist yet, will create
        }

        const gesture = {
            id: slug,
            name: g.name,
            tags: ['relaxation', 'beginner'],
            bodyAreas: g.bodyAreas,
            summary: g.summary,
            description: `A standard ${g.name} technique. Good for relaxation and tension relief.`,
            durationDefaults: {
                minSec: 30,
                defaultSec: 60,
                maxSec: 120,
            },
            media: {
                audio: 'audio.mp3',
                video: 'video.mp4',
                poster: 'poster.webp',
            },
            intensity: g.intensity,
            contraindications: [],
            equipment: [],
        };

        await fs.mkdir(targetDir, { recursive: true });
        await fs.writeFile(
            path.join(targetDir, 'gesture.json'),
            JSON.stringify(gesture, null, 2)
        );

        // Create placeholder files
        await fs.writeFile(path.join(targetDir, 'audio.mp3'), '');
        await fs.writeFile(path.join(targetDir, 'video.mp4'), '');
        await fs.writeFile(path.join(targetDir, 'poster.webp'), '');

        console.log(`Created ${slug}`);
    }

    console.log('Done seeding.');
}

main().catch(console.error);
