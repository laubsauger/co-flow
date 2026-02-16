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

    for (const file of gestureFiles) {
        const filePath = path.join(CONTENT_DIR, file);
        const content = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        const dir = path.dirname(filePath);

        // Check required media
        if (!content.media?.audio) {
            console.error(`❌ ${file}: Missing media.audio`);
            errors++;
        } else {
            const audioPath = path.join(dir, content.media.audio);
            try {
                await fs.access(audioPath);
            } catch {
                console.error(`❌ ${file}: Audio file not found at ${audioPath}`);
                errors++;
            }
        }

        // Check ID matches slug (folder name)
        const slug = path.basename(dir);
        if (content.id !== slug) {
            console.error(`❌ ${file}: ID mismatch. Expected "${slug}", got "${content.id}"`);
            errors++;
        }
    }

    // Flows checks (future)

    if (errors > 0) {
        console.error(`\nFound ${errors} errors.`);
        process.exit(1);
    }

    console.log('✅ Content validation passed.');
}

main().catch(console.error);
