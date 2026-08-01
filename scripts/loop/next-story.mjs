import { readFile } from "node:fs/promises";

const storiesPath = process.argv[2];

if (!storiesPath) {
  console.error("Usage: node scripts/loop/next-story.mjs <stories.json>");
  process.exit(2);
}

const document = JSON.parse(await readFile(storiesPath, "utf8"));
const stories = Array.isArray(document.stories) ? document.stories : [];
const nextStory = stories
  .filter((story) => story.passes !== true)
  .sort((left, right) => left.priority - right.priority)[0];

if (nextStory) {
  process.stdout.write(JSON.stringify(nextStory));
}
