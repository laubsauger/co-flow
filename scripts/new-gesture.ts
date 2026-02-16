import fs from 'fs/promises';
import path from 'path';
import { input, select } from '@inquirer/prompts';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GESTURES_DIR = path.resolve(__dirname, '../src/content/gestures');

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w-]+/g, '')        // Remove all non-word chars
        .replace(/--+/g, '-')           // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

async function main() {
    const name = await input({ message: 'Gesture Name:' });
    const slug = slugify(name);
    const targetDir = path.join(GESTURES_DIR, slug);

    try {
        await fs.access(targetDir);
        console.error(`Error: Gesture "${slug}" already exists!`);
        process.exit(1);
    } catch {
        // Directory doesn't exist, continue
    }

    const intensity = await select({
        message: 'Intensity (1-5):',
        choices: [
            { name: '1 - Very Light', value: 1 },
            { name: '2 - Light', value: 2 },
            { name: '3 - Medium', value: 3 },
            { name: '4 - Firm', value: 4 },
            { name: '5 - Deep', value: 5 },
        ],
    });

    const durationDefault = await input({ message: 'Default Duration (seconds):', default: '60' });

    const tagsInput = await input({ message: 'Tags (comma separated):' });
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const bodyAreasInput = await input({ message: 'Body Areas (comma separated):' });
    const bodyAreas = bodyAreasInput.split(',').map(t => t.trim()).filter(Boolean);

    const summary = await input({ message: 'Summary (one-liner):' });
    const description = await input({ message: 'Description:' });

    const gesture = {
        id: slug,
        name,
        tags,
        bodyAreas,
        summary,
        description,
        durationDefaults: {
            minSec: 30,
            defaultSec: parseInt(durationDefault, 10),
            maxSec: 300,
        },
        media: {
            audio: 'audio.mp3',
            video: 'video.mp4',
            poster: 'poster.webp',
        },
        intensity,
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

    console.log(`\n✅ Generated gesture "${name}" in:\n${targetDir}`);
}

main().catch(console.error);
