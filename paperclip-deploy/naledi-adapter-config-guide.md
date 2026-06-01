# Naledi Adapter Configuration Schema

This defines the settings users see when creating a Naledi agent in Paperclip.

## Configuration Fields

```typescript
export const nalediAdapterConfigSchema = {
  type: 'object',
  properties: {
    // Naledi Server Connection
    nalediEndpoint: {
      type: 'string',
      format: 'uri',
      title: 'Naledi Server URL',
      description: 'URL of your Naledi agent swarm server',
      default: 'http://localhost:8080'
    },
    
    // Authentication
    apiKey: {
      type: 'string',
      title: 'Naledi API Key',
      description: 'Authentication key for Naledi server',
      secret: true
    },
    
    // Agent Selection
    agentId: {
      type: 'string',
      title: 'Agent ID',
      description: 'Specific Naledi agent to use (optional)',
      default: 'default'
    },
    
    // Swarm Configuration
    swarmMode: {
      type: 'boolean',
      title: 'Enable Swarm Mode',
      description: 'Use multiple agents for complex tasks',
      default: false
    },
    
    // Task Settings
    timeoutSec: {
      type: 'number',
      title: 'Task Timeout',
      description: 'Maximum time for task completion (seconds)',
      default: 300,
      minimum: 30,
      maximum: 3600
    },
    
    // Context Settings
    persistContext: {
      type: 'boolean',
      title: 'Persist Context',
      description: 'Maintain conversation context across tasks',
      default: true
    },
    
    // Advanced: Tool Access
    allowedTools: {
      type: 'array',
      title: 'Allowed Tools',
      description: 'Tools this agent can use',
      items: {
        type: 'string',
        enum: [
          'Read',
          'Write', 
          'Bash',
          'WebSearch',
          'Browser',
          'Database',
          'API',
          'FileSystem'
        ]
      },
      default: ['Read', 'Write', 'Bash', 'WebSearch']
    }
  },
  required: ['nalediEndpoint', 'apiKey']
};

// Type inference
export type NalediAdapterConfig = {
  nalediEndpoint: string;
  apiKey: string;
  agentId?: string;
  swarmMode?: boolean;
  timeoutSec?: number;
  persistContext?: boolean;
  allowedTools?: string[];
};
```

## User Experience in Paperclip

### Creating a Naledi Agent

1. User clicks "Hire Agent" in Paperclip
2. Selects "Naledi" from adapter dropdown
3. Sees form with fields defined above:
   - Server URL: `http://naledi.yourdomain.com:8080`
   - API Key: (masked input, stored encrypted)
   - Swarm Mode: [toggle switch]
   - Timeout: [300 sec]
   - etc.

### How It Works

```
Paperclip Task
      │
      ▼
Naledi Adapter
      │
      ├─ Validates config
      ├─ Calls Naledi API
      │   POST /v1/tasks
      │   {
      │     "task_id": "paperclip-task-123",
      │     "prompt": "Create marketing plan...",
      │     "agent_id": "studex-marketing",
      │     "tools": ["Read", "Write", "WebSearch"]
      │   }
      │
      ▼
Naledi Server
      │
      ├─ Routes to agent(s)
      ├─ Executes with tools
      ├─ Streams progress (optional)
      │
      ▼
Naledi Response
      │
      ├─ Result document
      ├─ Transcript entries
      ├─ Token usage
      │
      ▼
Paperclip Stores Result
      └─ Updates task status
```

## Required Naledi API Endpoints

Your Naledi server needs to expose:

```
POST /v1/tasks          - Create and execute task
GET  /v1/tasks/:id        - Get task status/result
POST /v1/agents/:id/chat  - Continue conversation
GET  /v1/health           - Health check
```

## Paperclip Adapter Registration

```typescript
// In adapter registration
{
  type: 'naledi',
  name: 'Naledi Agent Swarm',
  description: 'Connect to your Naledi multi-agent system',
  configSchema: nalediAdapterConfigSchema,
  createAgent: createNalediAgent,
  executeTask: executeNalediTask,
  streamTask: streamNalediTask  // optional for real-time updates
}
```

Need help implementing any of these endpoints?
