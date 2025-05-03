const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// ✅ 강력한 CORS 허용
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-N8N-API-KEY'],
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('🧼 n8n Clean Create Proxy is running!');
});

// 🧠 워크플로우 생성: 불필요 필드 제거 후 POST
app.post('/proxy/create', async (req, res) => {
  const { n8nUrl, apiKey, workflow } = req.body;

  try {
    if (!n8nUrl || !apiKey || !workflow) {
      return res.status(400).json({ error: 'Missing required fields (n8nUrl, apiKey, workflow).' });
    }

    // ❌ 제거해야 할 필드
    const cleanedWorkflow = { ...workflow };
    delete cleanedWorkflow.id;
    delete cleanedWorkflow.versionId;
    delete cleanedWorkflow.active;
    delete cleanedWorkflow.meta;

    const cleanedUrl = n8nUrl.replace(/\/+$/, "");

    const response = await fetch(`${cleanedUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
      body: JSON.stringify(cleanedWorkflow),
    });

    const text = await response.text();

    // 응답이 JSON이 아닐 수도 있으므로 파싱 시도
    try {
      const json = JSON.parse(text);
      res.status(response.status).json(json);
    } catch {
      res.status(response.status).send(text);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ Clean Create Proxy running on port ${PORT}`);
});
