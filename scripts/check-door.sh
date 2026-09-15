#!/usr/bin/env bash
# Ordinary visitor, GPTBot, ChatGPT-User, Twitterbot.
# Fail if any hop or HTML still speaks grok.me.
set -euo pipefail
check() {
  local label="$1"
  shift
  local hops html
  hops=$(curl -sI -L -H 'Cache-Control: no-cache' "$@" https://nekyia.me)
  if echo "$hops" | grep -qiE 'joshua\.grok\.me|grok\.me/'; then
    echo "hop to grok ($label)"
    echo "$hops"
    exit 1
  fi
  html=$(curl -fsSL -H 'Cache-Control: no-cache' "$@" https://nekyia.me)
  if echo "$html" | grep -qiE 'grok-project-id|grok:app_id|joshua\.grok\.me'; then
    echo "html still has grok ($label)"
    echo "$html"
    exit 1
  fi
  echo "$html" | grep -q 'https://nekyia.me/og.jpg'
  echo "$html" | grep -q 'nekyia.me/x-banner.jpg'
  echo "$html" | grep -q '<title>Nekyia</title>'
  echo "door ok ($label)"
}
check visitor
check GPTBot -A GPTBot
check ChatGPT-User -A ChatGPT-User
check Twitterbot -A Twitterbot
curl -fsSL https://nekyia.me/api/aught | grep -q '"today"'
