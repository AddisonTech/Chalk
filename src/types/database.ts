// Placeholder - regenerate with:
//   npx supabase gen types typescript --project-id zuwfaydlfmvzunvxvzci > src/types/database.ts
// after the initial migration is deployed.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = Record<string, unknown>;
