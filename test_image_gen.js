async function test() {
  const prompt = "Act as a top-tier social media copywriter for an SEO agency. Create a high-converting social media post targeting business owners who struggle with low website traffic and poor Google rankings. Tone: professional, confident, results-driven. Include: A strong hook, Pain points, Benefits of SEO, A short success statement, CTA to book a free SEO audit, Relevant hashtags";

  const res = await fetch("https://zdbudsvjmjbtgfurlmvi.supabase.co/functions/v1/generate-social-post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYnVkc3ZqbWpidGdmdXJsbXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MzgwOTMsImV4cCI6MjA5MzAxNDA5M30.MmpP9_jrZCrEzskLV85z4hKsznSlYbVeb6lRt3nSREM`
    },
    body: JSON.stringify({
      type: "image",
      prompt: prompt,
      platform: "instagram"
    })
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}
test();
