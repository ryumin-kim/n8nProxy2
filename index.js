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
    if (!workflow || typeof workflow !== 'object') {
      return res.status(400).json({ error: 'Invalid workflow object.' });
    }
    if (!workflow.nodes || !Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
      return res.status(400).json({ error: 'Workflow must contain nodes.' });
    }
    if (!workflow.connections || typeof workflow.connections !== 'object') {
      return res.status(400).json({ error: 'Workflow must contain connections.' });
    }

    // ✅ name 필드가 없으면 기본값 지정
    if (!workflow.name) {
      workflow.name = 'Untitled Workflow ' + Date.now();
    }

    const cleanedUrl = n8nUrl.replace(/\/+$/, '');

    const cleanedWorkflow = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {},
    };

    // 불필요한 필드 제거
    delete cleanedWorkflow.id;
    delete cleanedWorkflow.meta;
    delete cleanedWorkflow.versionId;
    delete cleanedWorkflow.active;
    delete cleanedWorkflow.tags;

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

    if (!text || text.trim() === '') {
      return res.status(response.status).send();
    }

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
