const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('n8n Create Proxy is running 🚀');
});

// 🆕 워크플로우 생성
app.post('/proxy/create', async (req, res) => {
  let { n8nUrl, apiKey, workflow } = req.body;

  try {
    const cleanedUrl = n8nUrl.replace(/\/+$/, "");

    // 🧼 active 필드 제거 (read-only 이기 때문에 삭제 필요)
    if ('active' in workflow) {
      delete workflow.active;
    }

    const response = await fetch(`${cleanedUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
      body: JSON.stringify(workflow),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Create Proxy running on port ${PORT}`));
