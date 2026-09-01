import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API proxy route for Poe API
  app.post("/api/chat", async (req, res) => {
    const { messages, apiKey, model = "GPT-4o-mini" } = req.body;
    
    const resolvedApiKey = apiKey || process.env.POE_API_KEY;

    if (!resolvedApiKey) {
      return res.status(400).json({ error: "API key is required" });
    }

    try {
      // Use standard OpenAI completions format as supported by Poe
      const response = await fetch("https://api.poe.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resolvedApiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Poe API Error (${response.status}):`, errorData);
        
        const errorMessage = response.status >= 500 
          ? "AI 伺服器目前比較繁忙或發生錯誤，請稍後再試 (500 Internal Server Error)"
          : "無法連接到 AI 提供者";
          
        return res.status(response.status).json({ error: errorMessage, details: errorData });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Server proxy error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
