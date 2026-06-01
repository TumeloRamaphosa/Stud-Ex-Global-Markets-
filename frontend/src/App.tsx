import { useState, useEffect } from 'react'

interface AgentStatus {
  status: string
  last_run: string | null
}

interface PlatformStatus {
  status: string
  timestamp: string
  version: string
  agents: Record<string, AgentStatus>
  services: Record<string, string>
}

interface PromptRequest {
  brief: string
  persona: string
  num_prompts: number
}

interface PromptResponse {
  status: string
  timestamp: string
  persona: string
  prompts: Array<{
    id: number
    text: string
    model: string
    duration: number
    style: string
  }>
  metadata?: {
    source?: string
    fallback?: boolean
  }
}

interface Campaign {
  id: string
  name: string
  target_audience: string
  status: string
  created_at: string
  results: {
    total_contacts: number
    emails_sent: number
    emails_opened: number
    replies: number
    contracts_discovered: number
    conversion_rate: number
  }
}

interface CampaignReport {
  generated_at: string
  campaigns_analyzed: number
  summary: {
    total_contacts: number
    total_emails_sent: number
    total_opens: number
    total_replies: number
    total_contracts_discovered: number
  }
  rates: {
    open_rate: string
    reply_rate: string
    conversion_rate: string
  }
}

type Tab = 'prompts' | 'campaigns' | 'scraper'

function App() {
  const [status, setStatus] = useState<PlatformStatus | null>(null)
  const [brief, setBrief] = useState('')
  const [prompts, setPrompts] = useState<PromptResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('campaigns')
  
  // Campaign state
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignReport, setCampaignReport] = useState<CampaignReport | null>(null)
  const [newCampaignName, setNewCampaignName] = useState('')
  const [newCampaignTarget, setNewCampaignTarget] = useState('')
  
  // Scraper state
  const [scrapeCompany, setScrapeCompany] = useState('')
  const [scrapeDomain, setScrapeDomain] = useState('')
  const [scrapeKeywords, setScrapeKeywords] = useState('')
  const [discoveredEmails, setDiscoveredEmails] = useState<any[]>([])
  const [discoveredContracts, setDiscoveredContracts] = useState<any[]>([])

  // Fetch status on mount
  useEffect(() => {
    fetchStatus()
    fetchCampaigns()
    const interval = setInterval(fetchStatus, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch('/.netlify/functions/status')
      const data = await res.json()
      setStatus(data)
    } catch (err) {
      console.error('Failed to fetch status:', err)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns')
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch (err) {
      console.error('Failed to fetch campaigns:', err)
    }
  }

  const createCampaign = async () => {
    if (!newCampaignName.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newCampaignName,
          target_audience: newCampaignTarget,
          templates: [{ name: 'default', subject: `${newCampaignName} outreach` }],
          contacts: [  // Mock contacts for demo
            { email: 'contact1@test.com', name: 'Contact 1' },
            { email: 'contact2@test.com', name: 'Contact 2' },
            { email: 'contact3@test.com', name: 'Contact 3' },
            { email: 'contact4@test.com', name: 'Contact 4' },
            { email: 'contact5@test.com', name: 'Contact 5' }
          ]
        })
      })
      const data = await res.json()
      setCampaigns([...campaigns, data.campaign])
      setNewCampaignName('')
      setNewCampaignTarget('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  const runCampaign = async (campaignId: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', campaign_id: campaignId })
      })
      const data = await res.json()
      fetchCampaigns()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run campaign')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_report', include_all: true })
      })
      const data = await res.json()
      setCampaignReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const discoverEmails = async () => {
    if (!scrapeCompany && !scrapeDomain) return
    setLoading(true)
    try {
      const res = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'discover_emails',
          company: scrapeCompany,
          domain: scrapeDomain
        })
      })
      const data = await res.json()
      setDiscoveredEmails(data.emails || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discover emails')
    } finally {
      setLoading(false)
    }
  }

  const discoverContracts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'discover_contracts',
          keywords: scrapeKeywords.split(',').map(k => k.trim()).filter(Boolean),
          region: 'south africa'
        })
      })
      const data = await res.json()
      setDiscoveredContracts(data.contracts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discover contracts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brief.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/.netlify/functions/prompt_agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief,
          persona: 'Naledi',
          num_prompts: 5
        } as PromptRequest)
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json() as PromptResponse
      setPrompts(data)
      setBrief('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <header className="terminal-panel p-4 mb-4">
        <h1 className="text-xl font-bold text-green">
          NALEDI PLATFORM
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Netlify Functions + Local Backend
        </p>
        {status && (
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-blue">Status: {status.status}</span>
            <span className="text-gray-400">v{status.version}</span>
            <span className="text-gray-400">
              Updated: {new Date(status.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Prompt Generator */}
        <div className="terminal-panel p-4">
          <h2 className="text-lg font-semibold text-yellow mb-4">
            Prompt Agent
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Research Brief
              </label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Enter research brief for prompt generation..."
                className="w-full h-32 bg-terminal-bg border border-gray-700 rounded p-2 text-sm focus:border-green focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !brief.trim()}
              className="w-full py-2 bg-green/20 border border-green text-green rounded hover:bg-green/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Generating...' : 'Generate Prompts'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red/20 border border-red rounded text-sm text-red">
              Error: {error}
            </div>
          )}
        </div>

        {/* Campaigns Dashboard */}
        <div className="terminal-panel p-4 flex flex-col">
          <h2 className="text-lg font-semibold text-purple mb-4">
            DenchClaw Campaigns
          </h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-700 pb-2">
            {(['campaigns', 'scraper', 'prompts'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded-t ${
                  activeTab === tab
                    ? 'bg-purple/20 text-purple border-b-2 border-purple'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              {/* Create Campaign */}
              <div className="p-3 bg-terminal-bg rounded border border-gray-700">
                <h3 className="text-sm font-semibold text-yellow mb-2">Create Campaign</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="Campaign name..."
                    className="w-full bg-black border border-gray-700 rounded p-2 text-sm"
                  />
                  <input
                    type="text"
                    value={newCampaignTarget}
                    onChange={(e) => setNewCampaignTarget(e.target.value)}
                    placeholder="Target audience (e.g., developers)..."
                    className="w-full bg-black border border-gray-700 rounded p-2 text-sm"
                  />
                  <button
                    onClick={createCampaign}
                    disabled={loading || !newCampaignName.trim()}
                    className="w-full py-2 bg-green/20 border border-green text-green rounded hover:bg-green/30 disabled:opacity-50"
                  >
                    Create Campaign
                  </button>
                </div>
              </div>

              {/* Campaign List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {campaigns.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No campaigns yet. Create one above.</p>
                ) : (
                  campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-3 bg-terminal-bg rounded border border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-white">{campaign.name}</h4>
                          <p className="text-xs text-gray-400">Target: {campaign.target_audience}</p>
                          <p className="text-xs text-gray-500">Status: 
                            <span className={`ml-1 ${
                              campaign.status === 'completed' ? 'text-green' : 
                              campaign.status === 'running' ? 'text-yellow' :
                              campaign.status === 'paused' ? 'text-orange' : 'text-gray-400'
                            }`}>
                              {campaign.status}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => runCampaign(campaign.id)}
                          disabled={campaign.status === 'running' || loading}
                          className="px-3 py-1 bg-purple/20 border border-purple text-purple rounded text-xs hover:bg-purple/30 disabled:opacity-50"
                        >
                          Run
                        </button>
                      </div>
                      {campaign.results && (
                        <div className="mt-2 text-xs text-gray-400 grid grid-cols-3 gap-2">
                          <span>Sent: {campaign.results.emails_sent}</span>
                          <span>Opened: {campaign.results.emails_opened}</span>
                          <span>Replies: {campaign.results.replies}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Report */}
              <button
                onClick={generateReport}
                disabled={loading || campaigns.length === 0}
                className="w-full py-2 bg-yellow/20 border border-yellow text-yellow rounded hover:bg-yellow/30 disabled:opacity-50"
              >
                Generate Report
              </button>

              {campaignReport && (
                <div className="p-3 bg-terminal-bg rounded border border-yellow">
                  <h4 className="text-sm font-semibold text-yellow mb-2">Campaign Report</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-gray-400">Total Contacts: {campaignReport.summary.total_contacts}</span>
                    <span className="text-gray-400">Emails Sent: {campaignReport.summary.total_emails_sent}</span>
                    <span className="text-gray-400">Opens: {campaignReport.summary.total_opens}</span>
                    <span className="text-gray-400">Replies: {campaignReport.summary.total_replies}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-purple">Open Rate: {campaignReport.rates.open_rate}</p>
                    <p className="text-xs text-purple">Reply Rate: {campaignReport.rates.reply_rate}</p>
                    <p className="text-xs text-purple">Conversion: {campaignReport.rates.conversion_rate}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scraper Tab */}
          {activeTab === 'scraper' && (
            <div className="space-y-4">
              {/* Email Discovery */}
              <div className="p-3 bg-terminal-bg rounded border border-gray-700">
                <h3 className="text-sm font-semibold text-green mb-2">Discover Emails</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={scrapeCompany}
                    onChange={(e) => setScrapeCompany(e.target.value)}
                    placeholder="Company name..."
                    className="w-full bg-black border border-gray-700 rounded p-2 text-sm"
                  />
                  <input
                    type="text"
                    value={scrapeDomain}
                    onChange={(e) => setScrapeDomain(e.target.value)}
                    placeholder="Domain (e.g., company.com)..."
                    className="w-full bg-black border border-gray-700 rounded p-2 text-sm"
                  />
                  <button
                    onClick={discoverEmails}
                    disabled={loading || (!scrapeCompany && !scrapeDomain)}
                    className="w-full py-2 bg-green/20 border border-green text-green rounded hover:bg-green/30 disabled:opacity-50"
                  >
                    Discover Emails
                  </button>
                </div>
                
                {discoveredEmails.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <h4 className="text-xs font-semibold text-gray-400">Found {discoveredEmails.length} emails:</h4>
                    {discoveredEmails.map((email, idx) => (
                      <div key={idx} className="text-xs p-2 bg-black/50 rounded flex justify-between">
                        <span className="text-green">{email.email}</span>
                        <span className="text-gray-500">{Math.round(email.confidence * 100)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contract Discovery */}
              <div className="p-3 bg-terminal-bg rounded border border-gray-700">
                <h3 className="text-sm font-semibold text-blue mb-2">Discover Contracts</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={scrapeKeywords}
                    onChange={(e) => setScrapeKeywords(e.target.value)}
                    placeholder="Keywords (comma separated)..."
                    className="w-full bg-black border border-gray-700 rounded p-2 text-sm"
                  />
                  <button
                    onClick={discoverContracts}
                    disabled={loading}
                    className="w-full py-2 bg-blue/20 border border-blue text-blue rounded hover:bg-blue/30 disabled:opacity-50"
                  >
                    Search Contracts
                  </button>
                </div>

                {discoveredContracts.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    <h4 className="text-xs font-semibold text-gray-400">Found contracts:</h4>
                    {discoveredContracts.map((contract, idx) => (
                      <div key={idx} className="text-xs p-2 bg-black/50 rounded">
                        <p className="text-blue font-medium">{contract.title}</p>
                        <p className="text-gray-400">{contract.description?.slice(0, 100)}...</p>
                        {contract.value && <p className="text-green mt-1">Value: {contract.value}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generated Prompts */}
      {prompts && (
        <div className="terminal-panel p-4 mt-4">
          <h2 className="text-lg font-semibold text-blue mb-4">
            Generated Prompts
          </h2>
          <div className="space-y-3">
            {prompts.prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="p-3 bg-terminal-bg rounded border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-purple">
                    Prompt #{prompt.id}
                  </span>
                  <div className="flex gap-2 text-xs">
                    <span className="text-gray-400">{prompt.model}</span>
                    <span className="text-gray-400">{prompt.duration}s</span>
                    <span className="text-yellow">{prompt.style}</span>
                  </div>
                </div>
                <p className="text-sm">{prompt.text}</p>
              </div>
            ))}
          </div>
          {prompts.metadata?.fallback && (
            <p className="text-xs text-yellow mt-4">
              Note: Using mock response. Start local backend at localhost:8000
              for real AI generation.
            </p>
          )}
          {prompts.metadata?.source === 'local_backend' && (
            <p className="text-xs text-green mt-4">
              Response from local backend
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default App
