#!/bin/bash
cd /home/kavia/workspace/code-generation/quick-to-do-list-54831-54845/backend_api
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

