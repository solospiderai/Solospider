import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) {
    console.error("Error listing buckets:", listError)
    return
  }
  
  const bucket = buckets.find(b => b.name === 'social_assets')
  if (!bucket) {
    console.log("Bucket 'social_assets' does not exist. Creating it as public...")
    const { error: createError } = await supabase.storage.createBucket('social_assets', { public: true })
    if (createError) console.error("Create error:", createError)
    else console.log("Created successfully.")
  } else {
    console.log("Bucket exists. Is public:", bucket.public)
    if (!bucket.public) {
      console.log("Updating to public...")
      const { error: updateError } = await supabase.storage.updateBucket('social_assets', { public: true })
      if (updateError) console.error("Update error:", updateError)
      else console.log("Updated successfully.")
    }
  }
}

main()
