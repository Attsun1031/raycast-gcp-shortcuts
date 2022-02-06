#!/bin/sh
gcloud projects list --format="value(projectId)" --sort-by=projectId > ~/.raycast-gcp-shortcuts
