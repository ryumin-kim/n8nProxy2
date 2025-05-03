const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🧼 n8n Clean Create Proxy is running!');
});

// 워크플로우 생성 (id, meta 등 제거 후 POST)
app.post('/proxy/create', async (req, res) => {
  let { n8nUrl, apiKey, workflow } = req.body;

  try {
    // POST 요청이므로 id/meta/versionId는 제거
    const cleanedWorkflow = { ...workflow };
    delete cleanedWorkflow.id;
    delete cleanedWorkflow.versionId;
    delete cleanedWorkflow.active;
    delete cleanedWorkflow.meta;

    // 끝 슬래시 제거
    const cleanedUrl = n8nUrl.replace(/\/+$/, "");

    const response = await fetch(`${cleanedUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
      body: JSON.stringify(cleanedWorkflow),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`✅ Clean Create Proxy running on port ${PORT}`));
