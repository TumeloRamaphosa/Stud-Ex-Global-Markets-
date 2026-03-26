'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ConfigField {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  group: 'firebase' | 'anthropic' | 'uploadpost';
}

const CONFIG_FIELDS: ConfigField[] = [
  { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', label: 'Firebase API Key', placeholder: 'AIzaSy...', required: true, group: 'firebase' },
  { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', label: 'Auth Domain', placeholder: 'yourapp.firebaseapp.com', required: true, group: 'firebase' },
  { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', label: 'Project ID', placeholder: 'your-project-id', required: true, group: 'firebase' },
  { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', label: 'Storage Bucket', placeholder: 'yourapp.appspot.com', required: true, group: 'firebase' },
  { key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', label: 'Messaging Sender ID', placeholder: '123456789', required: true, group: 'firebase' },
  { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', label: 'App ID', placeholder: '1:123:web:abc123', required: true, group: 'firebase' },
  { key: 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX', required: false, group: 'firebase' },
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', placeholder: 'sk-ant-api03-...', required: true, group: 'anthropic' },
  { key: 'UPLOAD_POST_API_KEY', label: 'Upload-Post API Key', placeholder: 'your-upload-post-key', required: false, group: 'uploadpost' },
];

const GROUPS = [
  { id: 'firebase' as const, title: 'Firebase Configuration', description: 'Get these from Firebase Console > Project Settings > General > Your apps', link: 'https://console.firebase.google.com/' },
  { id: 'anthropic' as const, title: 'Anthropic (Claude AI)', description: 'Powers the AI marketing assistant and campaign automation', link: 'https://console.anthropic.com/settings/keys' },
  { id: 'uploadpost' as const, title: 'Upload-Post (Social Media)', description: 'Multi-platform posting to TikTok, Instagram, and 8+ more', link: 'https://upload-post.com' },
];

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

export default function SetupPage() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [testStatus, setTestStatus] = useState<Record<string, TestStatus>>({});
  const [envContent, setEnvContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteInput, setPasteInput] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  // Check which env vars are already set (client-side only)
  useEffect(() => {
    const existing: Record<string, string> = {};
    CONFIG_FIELDS.forEach(f => {
      if (f.key.startsWith('NEXT_PUBLIC_')) {
        const val = process.env[f.key];
        if (val && val !== 'placeholder' && !val.includes('placeholder')) {
          existing[f.key] = val;
        }
      }
    });
    setValues(prev => ({ ...existing, ...prev }));
  }, []);

  // Generate .env.local content whenever values change
  useEffect(() => {
    const lines = CONFIG_FIELDS
      .filter(f => values[f.key])
      .map(f => `${f.key}=${values[f.key]}`);
    lines.push('NEXT_PUBLIC_API_BASE_URL=http://localhost:3000');
    lines.push('NODE_ENV=development');
    setEnvContent(lines.join('\n'));
  }, [values]);

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setTestStatus(prev => ({ ...prev, [key]: 'idle' }));
  };

  const testFirebaseConnection = async () => {
    const requiredKeys = CONFIG_FIELDS.filter(f => f.group === 'firebase' && f.required);
    const missing = requiredKeys.filter(f => !values[f.key]);
    if (missing.length > 0) {
      missing.forEach(f => setTestStatus(prev => ({ ...prev, [f.key]: 'error' })));
      return;
    }

    requiredKeys.forEach(f => setTestStatus(prev => ({ ...prev, [f.key]: 'testing' })));

    try {
      const { initializeApp, getApps, deleteApp } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');

      // Clean up existing apps
      const existingApps = getApps();
      for (const app of existingApps) {
        if (app.name === '[TEST]') await deleteApp(app);
      }

      const testApp = initializeApp({
        apiKey: values['NEXT_PUBLIC_FIREBASE_API_KEY'],
        authDomain: values['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'],
        projectId: values['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
        storageBucket: values['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'],
        messagingSenderId: values['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
        appId: values['NEXT_PUBLIC_FIREBASE_APP_ID'],
      }, '[TEST]');

      getAuth(testApp);
      await deleteApp(testApp);

      requiredKeys.forEach(f => setTestStatus(prev => ({ ...prev, [f.key]: 'success' })));
    } catch {
      requiredKeys.forEach(f => setTestStatus(prev => ({ ...prev, [f.key]: 'error' })));
    }
  };

  const testAnthropicKey = async () => {
    if (!values['ANTHROPIC_API_KEY']) {
      setTestStatus(prev => ({ ...prev, 'ANTHROPIC_API_KEY': 'error' }));
      return;
    }
    setTestStatus(prev => ({ ...prev, 'ANTHROPIC_API_KEY': 'testing' }));

    // We can't test server-side keys from client, just validate format
    const key = values['ANTHROPIC_API_KEY'];
    if (key.startsWith('sk-ant-')) {
      setTestStatus(prev => ({ ...prev, 'ANTHROPIC_API_KEY': 'success' }));
    } else {
      setTestStatus(prev => ({ ...prev, 'ANTHROPIC_API_KEY': 'error' }));
    }
  };

  const copyEnvFile = () => {
    navigator.clipboard.writeText(envContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parsePastedConfig = () => {
    // Parse Firebase config from JS snippet or .env format
    const input = pasteInput;

    // Try parsing JS object format: apiKey: "xxx", authDomain: "xxx"
    const jsMatches: Record<string, string> = {};
    const jsPatterns = [
      { regex: /apiKey:\s*["'](.+?)["']/, key: 'NEXT_PUBLIC_FIREBASE_API_KEY' },
      { regex: /authDomain:\s*["'](.+?)["']/, key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN' },
      { regex: /projectId:\s*["'](.+?)["']/, key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID' },
      { regex: /storageBucket:\s*["'](.+?)["']/, key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET' },
      { regex: /messagingSenderId:\s*["'](.+?)["']/, key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID' },
      { regex: /appId:\s*["'](.+?)["']/, key: 'NEXT_PUBLIC_FIREBASE_APP_ID' },
      { regex: /measurementId:\s*["'](.+?)["']/, key: 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID' },
    ];

    jsPatterns.forEach(({ regex, key }) => {
      const match = input.match(regex);
      if (match) jsMatches[key] = match[1];
    });

    // Try parsing .env format: KEY=value
    const envMatches: Record<string, string> = {};
    input.split('\n').forEach(line => {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) envMatches[match[1]] = match[2].trim();
    });

    const merged = { ...envMatches, ...jsMatches };
    if (Object.keys(merged).length > 0) {
      setValues(prev => ({ ...prev, ...merged }));
      setShowPaste(false);
      setPasteInput('');
    }
  };

  const requiredFilled = CONFIG_FIELDS.filter(f => f.required).every(f => values[f.key]);
  const firebaseFilled = CONFIG_FIELDS.filter(f => f.group === 'firebase' && f.required).every(f => values[f.key]);

  const steps = [
    { title: 'Firebase', done: firebaseFilled },
    { title: 'Anthropic', done: !!values['ANTHROPIC_API_KEY'] },
    { title: 'Upload-Post', done: !!values['UPLOAD_POST_API_KEY'] },
    { title: 'Export', done: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Stud-Ex Setup Wizard</h1>
            <p className="text-sm text-gray-400">Configure your services to get the platform running</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Skip to Dashboard &rarr;
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, i) => (
            <button
              key={step.title}
              onClick={() => setActiveStep(i)}
              className="flex items-center gap-2"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step.done ? 'bg-green-600 text-white' :
                i === activeStep ? 'bg-sky-600 text-white' :
                'bg-gray-800 text-gray-400'
              }`}>
                {step.done ? '\u2713' : i + 1}
              </div>
              <span className={`text-sm ${i === activeStep ? 'text-white' : 'text-gray-500'}`}>
                {step.title}
              </span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-gray-700 mx-1" />}
            </button>
          ))}
        </div>

        {/* Paste Firebase Config Button */}
        {activeStep < 3 && (
          <div className="mb-6">
            <button
              onClick={() => setShowPaste(!showPaste)}
              className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
            >
              {showPaste ? 'Cancel' : 'Paste Firebase config snippet (from Firebase Console)'}
            </button>
            {showPaste && (
              <div className="mt-3 space-y-3">
                <textarea
                  value={pasteInput}
                  onChange={e => setPasteInput(e.target.value)}
                  placeholder={'Paste your Firebase config here...\n\nSupports:\n- JS object: const firebaseConfig = { apiKey: "...", ... }\n- .env format: NEXT_PUBLIC_FIREBASE_API_KEY=...'}
                  className="w-full h-40 bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm font-mono text-gray-300 placeholder:text-gray-600 focus:border-sky-500 focus:outline-none resize-none"
                />
                <button
                  onClick={parsePastedConfig}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Parse & Fill Fields
                </button>
              </div>
            )}
          </div>
        )}

        {/* Config Groups */}
        {activeStep < 3 && GROUPS.filter((_, i) => i === activeStep).map(group => (
          <div key={group.id} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">{group.title}</h2>
                <p className="text-sm text-gray-400">{group.description}</p>
              </div>
              <a
                href={group.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-sky-400 transition-colors"
              >
                Open Console &nearr;
              </a>
            </div>

            <div className="space-y-3">
              {CONFIG_FIELDS.filter(f => f.group === group.id).map(field => (
                <div key={field.key} className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type={field.key.includes('API_KEY') ? 'password' : 'text'}
                      value={values[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-300 placeholder:text-gray-600 focus:border-sky-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="w-8 pt-5">
                    {testStatus[field.key] === 'success' && <span className="text-green-400 text-lg">{'\u2713'}</span>}
                    {testStatus[field.key] === 'error' && <span className="text-red-400 text-lg">{'\u2717'}</span>}
                    {testStatus[field.key] === 'testing' && <span className="text-yellow-400 text-sm animate-spin inline-block">{'\u25E6'}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Test Connection Buttons */}
            <div className="mt-4 flex gap-3">
              {group.id === 'firebase' && (
                <button
                  onClick={testFirebaseConnection}
                  disabled={!firebaseFilled}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Test Firebase Connection
                </button>
              )}
              {group.id === 'anthropic' && (
                <button
                  onClick={testAnthropicKey}
                  disabled={!values['ANTHROPIC_API_KEY']}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Validate Key Format
                </button>
              )}
              <button
                onClick={() => setActiveStep(prev => Math.min(prev + 1, 3))}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-sm font-medium transition-colors"
              >
                Next Step &rarr;
              </button>
            </div>
          </div>
        ))}

        {/* Step 4: Export */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Generated .env.local</h2>
              <p className="text-sm text-gray-400 mb-4">
                Copy this and paste it into your Vercel Environment Variables, or save as <code className="text-sky-400">.env.local</code> in your project root.
              </p>
            </div>

            <div className="relative">
              <pre className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
                {envContent || 'No values configured yet. Go back and fill in the fields.'}
              </pre>
              {envContent && (
                <button
                  onClick={copyEnvFile}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            {/* Where to paste */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-sky-500 transition-colors"
              >
                <h3 className="font-semibold mb-1">Vercel Dashboard</h3>
                <p className="text-sm text-gray-400">Project Settings &rarr; Environment Variables &rarr; Paste each key-value pair</p>
              </a>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-orange-500 transition-colors"
              >
                <h3 className="font-semibold mb-1">Firebase Console</h3>
                <p className="text-sm text-gray-400">Enable Authentication &rarr; Google sign-in &rarr; Firestore Database</p>
              </a>
            </div>

            {/* Status Summary */}
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-3">Setup Status</h3>
              <div className="space-y-2">
                {[
                  { label: 'Firebase Config', done: firebaseFilled },
                  { label: 'Anthropic API Key', done: !!values['ANTHROPIC_API_KEY'] },
                  { label: 'Upload-Post API Key (optional)', done: !!values['UPLOAD_POST_API_KEY'] },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <span className={item.done ? 'text-green-400' : 'text-gray-500'}>
                      {item.done ? '\u2713' : '\u25CB'}
                    </span>
                    <span className={item.done ? 'text-gray-200' : 'text-gray-500'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveStep(0)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
              >
                &larr; Back to Edit
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                disabled={!requiredFilled}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
