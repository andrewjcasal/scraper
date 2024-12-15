import { defineFunction, secret } from "@aws-amplify/backend";

export const updateInterval = defineFunction({
  name: "update-interval",
  environment: {
    NEXT_PUBLIC_SUPABASE_URL: secret("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: secret("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    LAMBDA_ARN: process.env.LAMBDA_ARN || '', // Will be set during deployment
    REGION: process.env.AWS_REGION || 'us-east-1',
  },
});
