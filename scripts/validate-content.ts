import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '../src');
const CONTENT_DIR = path.join(SRC_DIR, 'content');

async function main() {
    const gestureFiles = await glob('gestures/*/gesture.json', { cwd: CONTENT_DIR });
    const flowFiles = await glob('flows/*/flow.json', { cwd: CONTENT_DIR });

    let errors = 0;

    // Collect valid gesture IDs for flow validation
    const validGestureIds = new Set<string>();

    // --- Gesture validation ---
    console.log(`Validating ${gestureFiles.length} gestures...`);

    for (const file of gestureFiles) {
        const filePath = path.join(CONTENT_DIR, file);
        const content = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        const dir = path.dirname(filePath);
        const slug = path.basename(dir);

        // Check ID matches slug (folder name)
        if (content.id !== slug) {
            console.error(`  ❌ ${file}: ID mismatch. Expected "${slug}", got "${content.id}"`);
            errors++;
        } else {
            validGestureIds.add(content.id);
        }

        // Check required fields
        if (!content.name) {
            console.error(`  ❌ ${file}: Missing name`);
            errors++;
        }
        if (content.media?.audio) {
            const audioPath = path.join(dir, content.media.audio);
            try {
                await fs.access(audioPath);
            } catch {
                console.error(`  ❌ ${file}: Audio file not found at ${content.media.audio}`);
                errors++;
            }
        }

        // Check duration defaults
        const dur = content.durationDefaults;
        if (!dur || typeof dur.minSec !== 'number' || typeof dur.defaultSec !== 'number' || typeof dur.maxSec !== 'number') {
            console.error(`  ❌ ${file}: Missing or invalid durationDefaults`);
            errors++;
        } else if (dur.minSec > dur.defaultSec || dur.defaultSec > dur.maxSec) {
            console.error(`  ❌ ${file}: durationDefaults out of order (min <= default <= max)`);
            errors++;
        }

        // Check intensity
        if (typeof content.intensity !== 'number' || content.intensity < 1 || content.intensity > 5) {
            console.error(`  ❌ ${file}: Intensity must be 1-5, got ${content.intensity}`);
            errors++;
        }
    }

    // --- Flow validation ---
    console.log(`Validating ${flowFiles.length} flows...`);

    for (const file of flowFiles) {
        const filePath = path.join(CONTENT_DIR, file);
        const content = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        const dir = path.dirname(filePath);
        const slug = path.basename(dir);

        // Check ID matches slug
        if (content.id !== slug) {
            console.error(`  ❌ ${file}: ID mismatch. Expected "${slug}", got "${content.id}"`);
            errors++;
        }

        // Check required fields
        if (!content.name) {
            console.error(`  ❌ ${file}: Missing name`);
            errors++;
        }

        // Check steps
        if (!Array.isArray(content.steps)) {
            console.error(`  ❌ ${file}: Missing or invalid steps array`);
            errors++;
        } else {
            for (let i = 0; i < content.steps.length; i++) {
                const step = content.steps[i];

                // Check gestureId references a valid gesture
                if (!validGestureIds.has(step.gestureId)) {
                    console.error(`  ❌ ${file}: Step ${i} references unknown gesture "${step.gestureId}"`);
                    errors++;
                }

                // Check duration
                if (typeof step.durationSec !== 'number' || step.durationSec <= 0) {
                    console.error(`  ❌ ${file}: Step ${i} has invalid durationSec: ${step.durationSec}`);
                    errors++;
                }

                // Check side value if present
                if (step.side && !['left', 'right', 'none'].includes(step.side)) {
                    console.error(`  ❌ ${file}: Step ${i} has invalid side: "${step.side}"`);
                    errors++;
                }
            }

            if (content.steps.length === 0 && !content.compiledMedia) {
                console.error(`  ❌ ${file}: Flow has no steps and no compiledMedia`);
                errors++;
            }
        }

        // Check compiled media if present
        if (content.compiledMedia) {
            if (!content.compiledMedia.audio) {
                console.error(`  ❌ ${file}: compiledMedia missing audio`);
                errors++;
            }
        }
    }

    // --- Summary ---
    if (errors > 0) {
        console.error(`\n❌ Found ${errors} errors.`);
        process.exit(1);
    }

    console.log(`\n✅ Content validation passed. ${gestureFiles.length} gestures, ${flowFiles.length} flows.`);
}

main().catch(console.error);
