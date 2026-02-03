#!/bin/sh
set -e

if [ "$SKIP_SECRET_SCAN" = "1" ]; then
  echo "Skipping secret scan..."
  exit 0
fi

TRIVY_TMP_DIR=""
REPO_ROOT=$(git rev-parse --show-toplevel)

check_trivy_installed() {
  if ! command -v trivy >/dev/null 2>&1; then
    echo "Warning: Trivy is not installed. See: https://trivy.dev/latest/getting-started/installation/"
    echo "If you're sure no secrets were added, you can push with:"
    echo "SKIP_SECRET_SCAN=1 git push"
    echo ""
    read -p "Push anyway without scanning? (y/N): " -r SKIP_SCAN
    echo
    case "$SKIP_SCAN" in
    [Yy]*) ;;
    *)
      echo "Push cancelled."
      exit 1
      ;;
    esac
  fi

  if [ ! -f "$REPO_ROOT/trivy-secret.yaml" ]; then
    echo "Error: trivy-secret.yaml not found in repository root" >&2
    exit 1
  fi
}

cleanup() {
  if [ -n "$TRIVY_TMP_DIR" ] && [ -d "$TRIVY_TMP_DIR" ]; then
    rm -rf "$TRIVY_TMP_DIR"
  fi
}

scan_files() {
  local files_to_scan="$1"

  TRIVY_TMP_DIR=$(mktemp -d)
  echo "$files_to_scan" | while IFS= read -r file; do
    mkdir -p "$TRIVY_TMP_DIR/$(dirname "$file")"
    git show "HEAD:$file" >"$TRIVY_TMP_DIR/$file" 2>/dev/null || {
      continue
    }
  done

  trivy fs "$TRIVY_TMP_DIR" --scanners secret --quiet --secret-config "$REPO_ROOT/trivy-secret.yaml" --exit-code 1
}

get_files_to_scan() {
  local remote_ref remote_sha

  BASE_BRANCH=""
  while read -r _ _ remote_ref remote_sha; do
    case "$remote_ref" in
    refs/heads/*)
      # Skip new branches (all-zero SHA)
      if [ "$remote_sha" != "0000000000000000000000000000000000000000" ]; then
        BASE_BRANCH=${remote_ref#refs/heads/}
        break
      fi
      ;;
    esac
  done

  # Fallback to repo default or main/master
  if [ -z "$BASE_BRANCH" ]; then
    BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@.*/@@') || {
      if git show-ref --verify --quiet refs/remotes/origin/main; then
        BASE_BRANCH=main
      elif git show-ref --verify --quiet refs/remotes/origin/master; then
        BASE_BRANCH=master
      else
        echo "Error: Could not determine base branch (no origin/HEAD, main, or master)" >&2
        return 1
      fi
    }
  fi

  echo "Comparing against: origin/$BASE_BRANCH" >&2
  git diff --name-only --diff-filter=ACMR "origin/$BASE_BRANCH"...HEAD
}

trap cleanup EXIT INT TERM

check_trivy_installed

FILES_TO_SCAN=$(get_files_to_scan)
if [ -z "$FILES_TO_SCAN" ]; then
  exit 0
fi

scan_files "$FILES_TO_SCAN"
