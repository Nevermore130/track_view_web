#!/usr/bin/env bash

set -Eeuo pipefail

release_id="${1:-}"
deploy_root="${TRACE_ATLAS_DEPLOY_ROOT:-/srv/trace-atlas}"
archive_root="${TRACE_ATLAS_ARCHIVE_ROOT:-${HOME:?}/.trace-atlas-staging}"
keep_releases="${TRACE_ATLAS_KEEP_RELEASES:-5}"

if [[ ! "$release_id" =~ ^[0-9a-f]{40}-[1-9][0-9]*-[1-9][0-9]*$ ]]; then
  echo "release id must be <40-character-git-sha>-<run-id>-<run-attempt>" >&2
  exit 2
fi

if [[ ! "$keep_releases" =~ ^[1-9][0-9]*$ ]]; then
  echo "TRACE_ATLAS_KEEP_RELEASES must be a positive integer" >&2
  exit 2
fi

if [[ "$deploy_root" != /* || "$deploy_root" == "/" ]]; then
  echo "TRACE_ATLAS_DEPLOY_ROOT must be an absolute non-root path" >&2
  exit 2
fi

if [[ "$archive_root" != /* || "$archive_root" == "/" ]]; then
  echo "TRACE_ATLAS_ARCHIVE_ROOT must be an absolute non-root path" >&2
  exit 2
fi

releases_root="$deploy_root/releases"
release_dir="$releases_root/$release_id"
archive="$archive_root/trace-atlas-$release_id.tar.gz"
next_link="$deploy_root/.current-next.$release_id.$$"

install -d -m 0755 "$releases_root"

temporary_release=""
cleanup() {
  if [[ -n "$temporary_release" && -d "$temporary_release" ]]; then
    rm -rf -- "$temporary_release"
  fi
  rm -f -- "$next_link"
}
trap cleanup EXIT

if [[ ! -d "$release_dir" ]]; then
  if [[ ! -f "$archive" ]]; then
    echo "release archive not found: $archive" >&2
    exit 3
  fi

  temporary_release="$(mktemp -d "$releases_root/.${release_id}.XXXXXX")"
  tar --extract \
    --gzip \
    --file "$archive" \
    --directory "$temporary_release" \
    --no-same-owner \
    --no-same-permissions

  if [[ ! -f "$temporary_release/index.html" ]]; then
    echo "release archive does not contain index.html" >&2
    exit 4
  fi

  chmod -R a=rX,u+w "$temporary_release"
  mv -- "$temporary_release" "$release_dir"
  temporary_release=""
fi

if [[ -e "$deploy_root/current" && ! -L "$deploy_root/current" ]]; then
  echo "$deploy_root/current exists but is not a symbolic link" >&2
  exit 5
fi

ln -s "$release_dir" "$next_link"
if mv --help 2>&1 | grep -q -- "--no-target-directory"; then
  mv -Tf -- "$next_link" "$deploy_root/current"
else
  mv -fh -- "$next_link" "$deploy_root/current"
fi
rm -f -- "$archive"

touch "$release_dir"
current_target="$(readlink "$deploy_root/current")"
retained_release_count=0
while IFS= read -r stale_release; do
  stale_id="$(basename "$stale_release")"
  if [[ ! "$stale_id" =~ ^[0-9a-f]{40}$ ]] &&
    [[ ! "$stale_id" =~ ^[0-9a-f]{40}-[1-9][0-9]*-[1-9][0-9]*$ ]]; then
    continue
  fi

  retained_release_count=$((retained_release_count + 1))
  if ((retained_release_count > keep_releases)) &&
    [[ "$stale_release" != "$current_target" ]]; then
    rm -rf -- "$stale_release"
  fi
done < <(ls -1dt "$releases_root"/* 2> /dev/null || true)

echo "activated Trace Atlas release $release_id"
