const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ n8n Create Proxy is running!');
});

app.post('/proxy/create', async (req, res) => {
  const { n8nUrl, apiKey, workflow } = req.body;

  try {
    const cleanedUrl = n8nUrl.replace(/\/+$/, '');

    // 워크플로우에서 불필요하거나 에러 유발하는 필드 제거
    const cleanedWorkflow = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {},
    };

    // 확실하게 제거
    delete cleanedWorkflow.id;
    delete cleanedWorkflow.meta;
    delete cleanedWorkflow.versionId;
    delete cleanedWorkflow.active;
    delete cleanedWorkflow.tags; // ❌ tags read-only 오류 방지

    const response = await fetch(`${cleanedUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
      body: JSON.stringify(cleanedWorkflow),
    });

    const text = await response.text();

    console.log('➡️ Status:', response.status);
    console.log('📝 Response:', text);

    // 응답 JSON 파싱 시도, 실패 시 text 그대로 반환
    try {
      res.status(response.status).json(JSON.parse(text));
    } catch {
      res.status(response.status).send(text);
    }
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 n8n Create Proxy running on port ${PORT}`);
});
