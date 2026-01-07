#!/bin/sh

if [ "$SKIP_SECRET_SCAN" = "1" ]; then
  echo "Skipping secret scan..."
  exit 0
fi

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
}

scan_files() {
  local files_to_scan="$1"
  local temp_dir=$(mktemp -d)
  echo "$files_to_scan" | while IFS= read -r file; do
    mkdir -p "$temp_dir/$(dirname "$file")"
    git show "HEAD:$file" >"$temp_dir/$file" 2>/dev/null || {
      continue
    }
  done

  local leaks_found
  set +e
  trivy fs "$temp_dir" --scanners secret --quiet --secret-config trivy-secret.yaml --exit-code 1
  leaks_found=$?
  set -e

  rm -rf "$temp_dir"

  return $leaks_found
}

get_files_to_scan() {
  if git show-ref --verify --quiet refs/remotes/origin/main; then
    BASE_BRANCH=main
  elif git show-ref --verify --quiet refs/remotes/origin/master; then
    BASE_BRANCH=master
  else
    BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@.*/@@')
  fi
  git diff --name-only --diff-filter=ACMR "origin/$BASE_BRANCH"...HEAD
}

check_trivy_installed

FILES_TO_SCAN=$(get_files_to_scan)
if [ -z "$FILES_TO_SCAN" ]; then
  exit 0
fi

scan_files "$FILES_TO_SCAN"

exit $?
