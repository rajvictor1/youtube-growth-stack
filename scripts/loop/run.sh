#!/usr/bin/env bash
set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
stories_file=${1:-tasks/000-foundation/stories.json}
max_iterations=${2:-5}
current_branch=$(git branch --show-current)

if [[ "$current_branch" == "main" || "$current_branch" == "master" ]]; then
  echo "Refusing to run the delivery loop on $current_branch. Create a feature branch first." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Refusing to start with a dirty working tree. Review or commit existing changes first." >&2
  exit 1
fi

if ! [[ "$max_iterations" =~ ^[1-9][0-9]*$ ]] || (( max_iterations > 10 )); then
  echo "max_iterations must be an integer from 1 to 10." >&2
  exit 2
fi

for ((iteration = 1; iteration <= max_iterations; iteration += 1)); do
  story=$(node "$repo_root/scripts/loop/next-story.mjs" "$repo_root/$stories_file")

  if [[ -z "$story" ]]; then
    echo "All stories pass. The branch is ready for human review."
    exit 0
  fi

  echo "Iteration $iteration/$max_iterations"
  {
    sed -n '1,240p' "$repo_root/scripts/loop/prompt.md"
    printf '\n## Selected story\n\n```json\n%s\n```\n' "$story"
  } | codex exec \
    --cd "$repo_root" \
    --sandbox workspace-write \
    --config 'approval_policy="never"' \
    -

  npm --prefix "$repo_root" run verify
done

echo "Iteration limit reached. Review the branch before continuing." >&2
exit 3
