#!/bin/bash

# Ensure variables are set
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo "Error: Could not determine GCP Project ID."
  exit 1
fi

echo "Deploying Trazy to project: $PROJECT_ID"

# 1. Build and push image to Google Container Registry
gcloud builds submit --tag gcr.io/$PROJECT_ID/trazy

# 2. Deploy to Cloud Run
# Note: You should have these secrets set in Secret Manager or pass them directly.
# For this script we will prompt the user to ensure env vars are passed if they are not defined in the environment.

gcloud run deploy trazy \
  --image gcr.io/$PROJECT_ID/trazy \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars FRONTEND_URL="https://trazy.app",PORT="8080"

# In production, prefer Secret Manager instead of inline keys:
# gcloud run services update trazy \
#   --region asia-south1 \
#   --set-secrets="GEMINI_API_KEY=gemini-key:latest,GOOGLE_MAPS_API_KEY=maps-key:latest"

echo "Deployment complete!"
