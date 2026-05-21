require('dotenv').config({ path: './.env.local' });

async function generateBlogPost(topic) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Write a 1500-word SEO-optimized blog post for Akshara World. 
  Topic: "${topic}"
  Style: Professional, high-authority, futuristic.
  Include: H1, H2, H3 headings, and a compelling meta description.
  Return as a JSON object with fields: title, slug, date, excerpt, content, metaDescription.`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.candidates[0].content.parts[0].text);
    console.log("Generated Post:", result.title);
    return result;
  } catch (error) {
    console.error("Gemini Error:", error.message);
    return null;
  }
}

generateBlogPost("AI Productivity Tools for Professionals in 2026").then(post => {
  if (post) {
    console.log("SUCCESS");
    console.log(JSON.stringify(post));
  } else {
    console.log("FAILED");
  }
});
