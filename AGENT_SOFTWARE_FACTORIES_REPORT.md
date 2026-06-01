# Agent-Controlled Software Factories: Global Research Report

**Date:** 2026-04-24  
**Scope:** Japan, China, Global markets  
**Limitations:** This report is compiled from public knowledge as of early 2025/2026. No live web search was available during compilation; readers should verify current status directly with named companies.

---

## 1. Japan: Autonomous Software & "Mujin Kōjō" Applied to Code

### 1.1 The Cultural Context: From Manufacturing to Software
Japan pioneered the concept of **mujin kōjō** (無人工場, "unmanned factory" or dark factory) in physical manufacturing. Fanuc, Yaskawa, and Toyota have operated lights-out machining facilities since the 1980s. The extension of this concept to *software* is more recent and less mature, but several players are pushing aggressively toward autonomous coding.

### 1.2 Key Japanese Players

#### Preferred Networks (PFN)
- **HQ:** Tokyo  
- **Focus:** Deep learning frameworks, autonomous systems, LLMs for vertical domains  
- **Autonomous Coding Efforts:** PFN has built large internal clusters and its own deep-learning stack (Chainer, then PyTorch contributions). While primarily known for ML infrastructure and industrial AI (robotics, drug discovery, materials science), PFN maintains a strong internal engineering culture that automates substantial parts of its ML pipeline — data preprocessing, model training orchestration, and experiment tracking. Their approach to "software factory" is more about **autonomous ML pipelines** than end-to-end code generation.
- **Tools / LLMs:** Custom in-house models; heavy investment in NVIDIA GPU clusters; Kubernetes-based orchestration.

#### Sakana AI
- **HQ:** Tokyo (founded by former Google Brain researchers David Ha and Llion Jones)  
- **Focus:** "Nature-inspired" agentic AI systems  
- **Autonomous Coding Efforts:** Sakana AI is one of the most explicitly "agentic" Japanese labs. They publish research on **multiple specialized agents collaborating** to solve problems — including code generation, review, and debugging. Their "Evolutionary Model Merge" and swarm-based agent papers describe systems where agents iteratively generate, evaluate, and refine code with minimal human intervention.
- **Tools / LLMs:** Open-weight models (Llama, Qwen, Mistral) via evolutionary merging; custom agent orchestration layer.

#### Fujitsu
- **HQ:** Tokyo  
- **Focus:** Enterprise IT, cloud, AI (Kozuchi platform)  
- **Autonomous Coding Efforts:** Fujitsu's **Kozuchi** AI platform includes code-generation and modernization agents for COBOL-to-Java migration and enterprise application maintenance. Fujitsu has publicly demonstrated AI agents that can generate unit tests, perform refactoring, and create deployment pipelines with human approval gates.
- **Tools / LLMs:** FUJITSU AI (custom/fine-tuned); partnership with Cohere and other LLM providers.

#### NTT Data
- **HQ:** Tokyo  
- **Focus:** Systems integration, managed services  
- **Autonomous Coding Efforts:** NTT Data has invested in **AI-driven software maintenance and testing**. Their research labs publish on automated program repair, test-case generation, and DevOps agents. In client engagements, they deploy bots for regression testing and infrastructure-as-code generation.
- **Tools / LLMs:** Internal models; partnerships with OpenAI and Microsoft Azure OpenAI Service.

#### Hitachi
- **HQ:** Tokyo  
- **Focus:** Industrial IoT, Lumada platform  
- **Autonomous Coding Efforts:** Hitachi's **Lumada** platform includes AI modules for predictive maintenance and data pipeline generation. On the software engineering side, Hitachi R&D has published work on autonomous agents for anomaly detection in codebases and automated DevOps remediation.
- **Tools / LLMs:** Lumada AI; internal R&D models.

#### Cyberdyne
- **HQ:** Tsukuba  
- **Focus:** Robotics (HAL exoskeleton), medical devices  
- **Autonomous Coding Efforts:** Minimal direct "software factory" work. Cyberdyne is primarily a *consumer* of autonomous control software for robotics rather than a producer of autonomous coding systems.

#### SoftBank Robotics
- **HQ:** Tokyo  
- **Focus:** Service robotics (Pepper, Whiz)  
- **Autonomous Coding Efforts:** SoftBank Robotics is more focused on robot behavior than code generation. However, SoftBank Group's broader AI investments (including NVIDIA partnerships) may eventually feed into software-automation initiatives.

#### Fanuc
- **HQ:** Oshino, Yamanashi  
- **Focus:** Industrial robotics, CNC  
- **Autonomous Coding Efforts:** Fanuc is the quintessential *physical* dark-factory company. In software, Fanuc uses extensive simulation and digital-twin environments where control logic is auto-generated and validated before physical deployment. This is arguably a form of "lights-out coding" for robotics control systems.

### 1.3 Japan Summary
| Company | Domain | Autonomy Level | Key Tools |
|---------|--------|----------------|-----------|
| Preferred Networks | ML/Industrial AI | Pipeline automation | Custom DL stack, K8s |
| Sakana AI | Agentic AI R&D | Multi-agent code gen | Open-weight model merging |
| Fujitsu | Enterprise modernization | Code gen + review + deploy | Kozuchi AI platform |
| NTT Data | SI/Testing | Test gen, IaC bots | Azure OpenAI, internal models |
| Hitachi | Industrial IoT | Anomaly detection, remediation | Lumada AI |
| Fanuc | Robotics control | Digital-twin code gen | Simulation, ROS-like stacks |

---

## 2. China: Agentic Software Engineering at Scale

### 2.1 Landscape Overview
China's tech giants have aggressively productized AI coding assistants and are moving toward fully agentic pipelines. The government-backed push for AI self-sufficiency has accelerated domestic LLM and coding-agent development.

### 2.2 Key Chinese Players

#### Alibaba (DAMO Academy + Tongyi)
- **Product:** **Tongyi Lingma** (通义灵码) — AI coding assistant  
- **Models:** Qwen (通义千问) series, including Qwen-Coder  
- **Autonomous Coding Efforts:** Tongyi Lingma is deployed across Alibaba's internal engineering teams. It supports code completion, generation, explanation, and automated test generation. DAMO Academy research includes multi-agent frameworks for software engineering. Alibaba Cloud offers **Intelligent Coding Agents** as part of its DevOps suite.
- **Tools / LLMs:** Qwen2.5-Coder, proprietary fine-tunes; integration with Alibaba Cloud DevOps (效典).  
- **Scale:** Reportedly used by millions of developers inside and outside Alibaba.

#### Baidu
- **Product:** **Baidu Comate** (智能代码助手)  
- **Models:** ERNIE (文心一言/文心大模型) series, including ERNIE-Code  
- **Autonomous Coding Efforts:** Baidu Comate provides real-time code suggestions, automated comment generation, and code review. Baidu has also demonstrated agents that can autonomously build simple web applications from natural language prompts. Internal teams use Comate for test generation and API documentation.
- **Tools / LLMs:** ERNIE 4.0 / ERNIE-Code; PaddlePaddle framework; Baidu Cloud CI/CD.

#### Tencent
- **Product:** **Tencent Cloud AI Code Assistant** (powered by Hunyuan)  
- **Models:** Hunyuan (混元) large model  
- **Autonomous Coding Efforts:** Tencent has integrated Hunyuan into its internal development toolchain (Tencent BlueKing CI/CD). The assistant handles code review, vulnerability detection, and automated patching. Tencent's WeChat and gaming divisions use AI agents for automated testing (e.g., game-bot testing, UI automation).
- **Tools / LLMs:** Hunyuan; BlueKing DevOps platform; internal game-testing agents.

#### Huawei
- **Product:** **Pangu Coder**, CodeArts Snap  
- **Models:** Pangu (盘古) series  
- **Autonomous Coding Efforts:** Huawei's **CodeArts** platform includes Snap, an AI coding assistant, and Pangu Coder for more complex generation tasks. Huawei has publicly discussed "AI-driven software production lines" where agents generate microservices scaffolding, API contracts, and deployment manifests. Their HarmonyOS and EulerOS teams use automated code translation and refactoring agents.
- **Tools / LLMs:** Pangu-Σ; MindSpore framework; CodeArts DevOps; internal compiler toolchain.

#### iFlytek (科大讯飞)
- **Product:** **iFlytek SparkDesk** (星火认知大模型), iFlytek AI Programmer  
- **Models:** SparkDesk / Xinghuo models  
- **Autonomous Coding Efforts:** iFlytek has positioned SparkDesk as a general-purpose agent platform. For software, they offer code generation, math/reasoning, and automated document generation. Their education and government verticals use AI to auto-generate form-processing applications.
- **Tools / LLMs:** SparkDesk 4.0; proprietary fine-tunes.

#### SenseTime
- **Product:** **SenseNova** (日日新) platform  
- **Models:** SenseNova series  
- **Autonomous Coding Efforts:** SenseTime's SenseNova includes a code-generation module. While primarily focused on computer vision and multimodal AI, SenseTime provides coding agents for its internal MLOps pipelines and for enterprise clients in finance and healthcare.
- **Tools / LLMs:** SenseNova; internal MLOps stack.

#### Zhipu AI / CodeGeeX (智谱AI)
- **Product:** **CodeGeeX**  
- **Models:** ChatGLM / GLM-4 series  
- **Autonomous Coding Efforts:** CodeGeeX is one of the most widely used open-source coding models globally. Zhipu AI offers it as a plugin for VS Code and JetBrains IDEs, supporting 20+ languages. The latest iterations include agentic capabilities: auto-debugging, project-wide refactoring, and test generation. CodeGeeX is used by millions of developers.
- **Tools / LLMs:** CodeGeeX-4; GLM-4; open-source inference stack.

#### ByteDance
- **Product:** **Doubao** (豆包) — general assistant; **MarsCode** (豆包MarsCode) — coding agent  
- **Models:** Doubao / Skylark / CloudWeGo-related models  
- **Autonomous Coding Efforts:** ByteDance released **MarsCode** as a full IDE with built-in agentic coding capabilities: natural-language-to-application, automated testing, and cloud deployment. It is marketed as a "one-stop AI coding platform." ByteDance internally uses extensive AI tooling for its recommendation-system microservices.
- **Tools / LLMs:** Doubao-pro; CloudWeGo microservices framework; internal K8s platform.

#### 4Paradigm (第四范式)
- **Product:** Enterprise AI platform, coding agents for financial services  
- **Autonomous Coding Efforts:** 4Paradigm builds domain-specific agents for code generation in regulated industries (banking, insurance). Their systems auto-generate risk models, ETL pipelines, and reporting code.
- **Tools / LLMs:** Custom enterprise models; internal AutoML + code-gen stack.

### 2.3 China Summary
| Company | Product | Model | Autonomy Level |
|---------|---------|-------|----------------|
| Alibaba | Tongyi Lingma | Qwen-Coder | Completion → review → test gen |
| Baidu | Comate | ERNIE-Code | Suggestion → simple app gen |
| Tencent | Cloud AI Assistant | Hunyuan | Review, patch, game testing |
| Huawei | CodeArts Snap, Pangu Coder | Pangu | Scaffold + translate + deploy |
| iFlytek | SparkDesk AI Programmer | SparkDesk | Form app gen, doc automation |
| SenseTime | SenseNova code module | SenseNova | MLOps pipeline gen |
| Zhipu AI | CodeGeeX | GLM-4 / CodeGeeX-4 | 20+ languages, agentic refactor |
| ByteDance | MarsCode | Doubao-pro | NL-to-app, test, deploy |
| 4Paradigm | Enterprise AI platform | Custom | Domain-specific pipeline gen |

---

## 3. Global: Lights-Out & Dark Software Factories

### 3.1 Defining the Spectrum
True "lights-out" coding — where agents write, test, and deploy with zero human intervention — is still rare. Most operations fall on a spectrum:

1. **AI-Augmented Development** (copilot mode) — human writes, AI suggests
2. **Agent-Assisted Development** — agents handle sub-tasks (tests, docs, refactor)
3. **Agent-Led Development** — agents generate full features; human reviews
4. **Lights-Out / Dark Factory** — agents own the full SDLC; humans only approve spend/release

### 3.2 Top Global Players

#### 1. Cognition AI — Devin
- **HQ:** San Francisco, USA  
- **Product:** **Devin** — autonomous AI software engineer  
- **Model:** Proprietary (likely fine-tuned on large code corpora)  
- **Autonomy:** Agent-led to near lights-out. Devin can plan tasks, write code, debug, run commands, and deploy. Marketed as a teammate, not just a tool.  
- **Stack:** Custom agent architecture; cloud sandboxes; browser automation; VS Code-like interface.

#### 2. Factory.ai
- **HQ:** San Francisco, USA  
- **Product:** **Droids** — autonomous software engineering agents  
- **Model:** Proprietary + frontier models  
- **Autonomy:** Agent-led. Factory builds "droids" (specialized agents) for specific engineering tasks: code review, bug fixing, feature implementation, migration.  
- **Stack:** Internal agent framework; GitHub/GitLab integrations; CI/CD hooks.

#### 3. Codeium
- **HQ:** Mountain View, USA  
- **Products:** Codeium autocomplete; **Windsurf** (agentic IDE); Cascade agent  
- **Model:** Custom Codeium models + Claude/GPT routing  
- **Autonomy:** Agent-led. Windsurf's Cascade agent can perform multi-step coding tasks across files, run terminals, and iterate based on errors.  
- **Stack:** Proprietary inference stack; multi-model routing; local + cloud deployment.

#### 4. Sourcegraph — Cody
- **HQ:** San Francisco, USA  
- **Product:** **Cody** — AI coding assistant with codebase intelligence  
- **Model:** Claude, GPT, custom fine-tunes  
- **Autonomy:** Agent-assisted to agent-led. Cody uses Sourcegraph's code graph to provide context-aware generation, automated refactoring, and code intelligence at scale. Enterprise deployments include batch changes and automated migration.  
- **Stack:** Sourcegraph code graph; Claude/GPT APIs; K8s enterprise deployments.

#### 5. GitHub — Copilot / Copilot Workspace
- **HQ:** San Francisco, USA (Microsoft)  
- **Product:** **GitHub Copilot** (autocomplete); **Copilot Workspace** (agentic); **Copilot Chat**  
- **Model:** GPT-4o, GPT-4o-mini, custom Codex models  
- **Autonomy:** AI-augmented → agent-led. Copilot Workspace can generate full implementations from issue descriptions. Microsoft's internal "1ES" (One Engineering System) uses Copilot at massive scale across 100k+ engineers.  
- **Stack:** Azure OpenAI; GitHub Actions; VS Code; custom telemetry and safety systems.

#### 6. Amazon — Amazon Q Developer
- **HQ:** Seattle, USA  
- **Product:** **Amazon Q Developer** (formerly CodeWhisperer) + **Amazon Q Apps**  
- **Model:** Custom (Amazon Nova, plus internal models)  
- **Autonomy:** AI-augmented → agent-led. Q Developer generates code, tests, and documentation. Q Transform (enterprise) automates mainframe modernization and Java upgrades. Internal Amazon teams use automated code transformation at scale.  
- **Stack:** AWS infrastructure; internal model hosting; CodeCatalyst CI/CD.

#### 7. Google — Gemini Code Assist / Jules
- **HQ:** Mountain View, USA  
- **Product:** **Gemini Code Assist**; **Jules** (experimental agent)  
- **Model:** Gemini 2.5 Pro / Flash  
- **Autonomy:** Agent-assisted → agent-led. Jules is an experimental agent that can plan and execute multi-step coding tasks, fix bugs, and create PRs. Google internally uses extensive AI tooling (internal "Cider" IDE, Piper repo bots).  
- **Stack:** Gemini API; Google Cloud; internal monorepo tools (Piper, Critique).

#### 8. Poolside
- **HQ:** Paris, France / USA  
- **Product:** Agentic coding platform (API + IDE)  
- **Model:** Custom (rumored large code-specific model)  
- **Autonomy:** Agent-led. Poolside is building models specifically for "code generation and execution" with reinforcement learning from code execution feedback.  
- **Stack:** Proprietary models; custom RL training infrastructure.

#### 9. Magic.dev
- **HQ:** San Francisco, USA  
- **Product:** AI software engineer agent  
- **Model:** Custom (long-context architectures)  
- **Autonomy:** Agent-led. Magic focuses on ultra-long context windows (1M+ tokens) to ingest entire codebases for autonomous refactoring and feature implementation.  
- **Stack:** Custom inference stack; long-context transformers.

#### 10. Augment Code
- **HQ:** Tel Aviv, Israel / USA  
- **Product:** Augment IDE — agentic coding for professional teams  
- **Model:** Proprietary + frontier  
- **Autonomy:** Agent-led. Designed for large, complex codebases. Agents can plan cross-file changes, run tests, and iterate.  
- **Stack:** Custom context engine; enterprise security controls.

#### 11. Cursor (Anysphere)
- **HQ:** San Francisco, USA  
- **Product:** **Cursor** — AI-native IDE  
- **Model:** GPT-4, Claude, custom fine-tunes  
- **Autonomy:** Agent-assisted → agent-led. Cursor's "Composer" and "Agent" modes can generate multi-file changes, run terminal commands, and fix lint errors. Extremely popular among indie developers and startups.  
- **Stack:** VS Code fork; multi-model API routing; custom context retrieval.

#### 12. Replit — Ghostwriter / Replit Agent
- **HQ:** San Mateo, USA  
- **Product:** **Replit Agent** — natural-language-to-deployed-app  
- **Model:** GPT-4, Claude, custom models  
- **Autonomy:** Agent-led. Users describe an app; Replit Agent writes code, installs dependencies, and deploys to Replit's cloud.  
- **Stack:** Replit cloud; Nix environment; Bounty/deployment automation.

#### 13. Vercel — v0
- **HQ:** San Francisco, USA  
- **Product:** **v0** — generative UI + code  
- **Model:** Claude, GPT, custom fine-tunes  
- **Autonomy:** AI-augmented. Generates React/Next.js UI from prompts. Less autonomous than end-to-end agents, but tightly integrated into deployment.  
- **Stack:** Next.js; React; Tailwind; shadcn/ui; Vercel Edge.

#### 14. Lovable
- **HQ:** Stockholm, Sweden  
- **Product:** **Lovable** — "Devin for everyone"; full-stack app generation  
- **Model:** Claude, GPT-4o, custom  
- **Autonomy:** Agent-led. Generates full-stack applications (Supabase backend, React frontend) from natural language. Handles database schema, API routes, auth, and deployment.  
- **Stack:** React; Supabase; GitHub integration; Vercel/Netlify deploy.

#### 15. Bolt (StackBlitz)
- **HQ:** San Francisco, USA  
- **Product:** **Bolt** — AI full-stack development in browser  
- **Model:** Claude, GPT  
- **Autonomy:** Agent-led. Generates and runs full-stack apps in WebContainers with no local setup.  
- **Stack:** WebContainers; Node.js in browser; Netlify deploy.

#### 16. Tabnine
- **HQ:** Tel Aviv, Israel  
- **Product:** AI coding assistant (enterprise focus)  
- **Model:** Custom + open-source models  
- **Autonomy:** AI-augmented. Strong enterprise focus with on-premise deployment, privacy, and team-wide model fine-tuning.  
- **Stack:** Self-hosted inference; IDE plugins; enterprise governance.

#### 17. Sweep
- **HQ:** San Francisco, USA  
- **Product:** **Sweep** — AI junior dev that creates PRs from issues  
- **Model:** GPT-4, Claude  
- **Autonomy:** Agent-assisted. Reads GitHub issues, plans changes, opens pull requests. Human merges.  
- **Stack:** GitHub App; OpenAI/Anthropic APIs; Python codebase analysis.

#### 18. Pythagora — GPT Pilot
- **HQ:** Distributed  
- **Product:** **GPT Pilot** — autonomous app developer  
- **Model:** GPT-4, Claude  
- **Autonomy:** Agent-led. Breaks projects into tasks, writes code incrementally, asks clarifying questions when stuck.  
- **Stack:** Python CLI; SQLite state; VS Code extension.

#### 19. Continue.dev
- **HQ:** San Francisco, USA  
- **Product:** **Continue** — open-source autopilot for VS Code / JetBrains  
- **Model:** Pluggable (any OpenAI-compatible API)  
- **Autonomy:** AI-augmented → agent-assisted. Highly extensible; community builds agentic workflows.  
- **Stack:** TypeScript; VS Code extension API; any LLM backend.

#### 20. Supermaven
- **HQ:** San Francisco, USA  
- **Product:** Supermaven IDE plugin  
- **Model:** Custom (1M token context)  
- **Autonomy:** AI-augmented. Extremely fast, large-context autocomplete.  
- **Stack:** Custom inference; IDE plugins.

### 3.3 Honorable Mentions
| Company | Product | Notes |
|---------|---------|-------|
| JetBrains | AI Assistant | Integrated into IntelliJ IDEs |
| Jetify | Devbox / Nix agents | Reproducible AI dev environments |
| Loft Labs | DevPod | Cloud dev environments for AI agents |
| E2B | Sandboxes | Secure execution environments for coding agents |
| Morph Labs | AI app deployment | One-click deploy for agent-generated apps |
| OpenAI | Codex (ChatGPT) | Research preview of agentic coding |
| Anthropic | Claude Code | Terminal-based agentic coding with Claude |

---

## 4. Operations Model: How Dark Software Factories Work

### 4.1 The Human-in-the-Loop
Even the most advanced operations maintain human oversight, but the role shifts dramatically:

| Role | Traditional | Dark Factory |
|------|-------------|--------------|
| Architecture | Human designs | Human defines constraints; agents explore |
| Coding | Human writes | Agent writes; human reviews key files |
| Testing | Human writes tests | Agent generates tests, fuzzing, property tests |
| Code Review | Human reviews all | Agent pre-reviews; human spot-checks critical |
| Deployment | Human triggers | Agent deploys; human approves via policy |
| Incident Response | Human investigates | Agent diagnoses, patches, deploys fix; human approves |

### 4.2 Agent-to-Human Ratios (Estimated)
- **AI-Augmented (Copilot):** 1 agent per 1 human (1:1)
- **Agent-Assisted:** 3-5 agents per 1 human (3:1 to 5:1)
- **Agent-Led:** 10-20 agents per 1 human (10:1 to 20:1)
- **Lights-Out / Dark:** 50-100+ agents per 1 human (50:1+), where humans manage policy, budget, and escalation

These ratios are speculative and based on public claims and pilot programs. True lights-out operations are not yet widely documented.

### 4.3 QA & Security Architecture
**Quality Assurance:**
- **Automated Testing:** Agents generate unit, integration, and E2E tests (Playwright, Selenium, Jest, Pytest)
- **Fuzzing & Property Testing:** Agents generate fuzz targets and invariant checks
- **Formal Verification:** For critical paths, agents generate specs for tools like Coq, TLA+, or Rust's Miri
- **Code Coverage Gates:** Automated CI blocks deployment below threshold

**Security:**
- **SAST/DAST Agents:** Static analysis (Semgrep, SonarQube, CodeQL) run by agents on every change
- **Dependency Scanning:** Automated SBOM generation and vulnerability scanning (Snyk, Dependabot, OSV)
- **Secret Scanning:** Agents scan for leaked credentials pre-commit
- **Sandboxed Execution:** Agent-generated code runs in isolated environments (E2B, Firecracker, gVisor) before merge

**Deployment:**
- **GitOps:** Agents commit to Git; ArgoCD/Flux handle deployment
- **Canary / Feature Flags:** Automated progressive rollout with metric-based rollback
- **Infrastructure as Code:** Agents generate Terraform/Pulumi/CloudFormation and apply after approval

### 4.4 Escalation Patterns
1. **Syntax/Compile Error:** Agent auto-fixes (no human)
2. **Test Failure:** Agent debugs and retries (no human, up to N attempts)
3. **Security Alert:** Agent quarantines; human notified
4. **Performance Regression:** Agent generates report; human decides
5. **Architecture Change:** Agent proposes; human approves
6. **Budget Threshold:** Human approval required

---

## 5. Tools Stack

### 5.1 LLMs / Foundation Models
| Provider | Model | Best For |
|----------|-------|----------|
| OpenAI | GPT-4o, o3-mini, Codex | General coding, reasoning |
| Anthropic | Claude 3.5/4 Sonnet, Claude Code | Long context, careful editing |
| Google | Gemini 2.5 Pro, Codey | Large context, cloud integration |
| Meta | Llama 3/4, CodeLlama | Self-hosted, open-source |
| Alibaba | Qwen-Coder | Chinese + multilingual code |
| Zhipu | CodeGeeX-4 | Open-source, 20+ languages |
| Baidu | ERNIE-Code | Chinese enterprise |
| Huawei | Pangu-Coder | On-premise, regulated |
| Poolside | (Proprietary) | RL-optimized code execution |
| Magic.dev | (Proprietary) | Ultra-long context |

### 5.2 Agent Frameworks & Orchestration
| Framework | Description |
|-----------|-------------|
| LangChain / LangGraph | Popular Python/JS agent orchestration |
| CrewAI | Multi-agent role-based teams |
| Microsoft AutoGen | Conversational multi-agent framework |
| OpenAI Swarm | Lightweight multi-agent orchestration |
| Semantic Kernel | Microsoft's agent SDK |
| Pydantic AI | Structured output for agents |
| LlamaIndex | RAG + agent tooling |
| Custom (Cognition, Factory, Codeium) | Proprietary agent architectures |

### 5.3 Development & Deployment Infrastructure
| Category | Tools |
|----------|-------|
| IDEs | VS Code, Cursor, Windsurf, JetBrains, Replit, MarsCode |
| CI/CD | GitHub Actions, GitLab CI, ArgoCD, Tekton, CircleCI, Buildkite |
| Containerization | Docker, Kubernetes, Firecracker, gVisor, E2B sandboxes |
| Cloud | AWS, Azure, GCP, Alibaba Cloud, Huawei Cloud, Vercel, Netlify |
| IaC | Terraform, Pulumi, AWS CDK, Crossplane |
| Monitoring | Datadog, Grafana, Honeycomb, Langfuse (for agent tracing) |
| Code Intelligence | Sourcegraph, GitHub code search, Tree-sitter |
| Testing | Jest, Pytest, Playwright, Selenium, Locust, Hypothesis |
| Security | Semgrep, CodeQL, SonarQube, Snyk, Dependabot, OSV-Scanner |

### 5.4 Agent Execution Environments
| Platform | Purpose |
|----------|---------|
| E2B | Secure sandboxes for AI-generated code |
| Daytona | Cloud development environments |
| DevPod (Loft) | Reproducible remote dev containers |
| GitHub Codespaces | Cloud-hosted dev environments |
| WebContainers (StackBlitz) | Browser-based Node.js execution |

---

## 6. Summary Comparison Table

| Dimension | Japan | China | Global (USA/EU) |
|-----------|-------|-------|-----------------|
| **Leading Companies** | Sakana AI, PFN, Fujitsu, NTT Data | Alibaba, Baidu, Tencent, Huawei, ByteDance, Zhipu | Cognition, Factory, Codeium, GitHub, Amazon, Google |
| **LLM Strategy** | Mix of custom + open-weight hybrids | Strong domestic model focus (Qwen, ERNIE, Pangu, GLM) | Frontier API + custom fine-tunes |
| **Autonomy Level** | Mostly pipeline automation; Sakana pushing agentic | Rapidly moving to agent-led (MarsCode, CodeGeeX agents) | Furthest along: Devin, Factory, Windsurf agentic modes |
| **Deployment Model** | On-premise / private cloud (enterprise) | Hybrid: public cloud + government/private cloud | SaaS-first; enterprise self-hosted options |
| **Domain Focus** | Industrial AI, enterprise modernization, robotics | Consumer apps, fintech, government, telecom | General-purpose; strong startup ecosystem |
| **Open Source** | Moderate (Sakana publishes research) | High (Qwen, CodeGeeX, ChatGLM open-weight) | Mixed (Continue.dev open; Cognition/Factory closed) |
| **Regulatory Driver** | Quality / safety culture; labor shortage | AI self-sufficiency (government mandate); data sovereignty | Liability, IP, security concerns |
| **Typical Agent:Human** | 3:1 to 10:1 | 5:1 to 20:1 (Alibaba/ByteDance internal) | 10:1 to 50:1 (pilot dark factories) |

---

## 7. Key Trends & Outlook

1. **From Copilot to Crew:** The industry is rapidly moving from single-model autocomplete to multi-agent teams (code writer, tester, reviewer, security auditor, deployer).

2. **Specialized Agents:** Horizontal agents (generic coding) are giving way to vertical agents (e.g., Factory's "droids" for specific codebases, Huawei's domain-specific pipeline generators).

3. **Execution Feedback Loops:** The most advanced systems (Poolside, Cognition) use reinforcement learning from code execution — agents learn by running code and observing results.

4. **Trust & Verification:** As autonomy increases, investment in automated verification (formal methods, extensive test suites, sandboxed execution) becomes critical.

5. **Geopolitical Fragmentation:** China is building a largely domestic stack (models, cloud, frameworks). Japan is hybridizing domestic and US/EU tech. The US/EU leads in startup experimentation but faces enterprise adoption friction.

6. **Human Role Evolution:** The "software engineer" role is bifurcating into (a) agent orchestrators / prompt engineers who manage agent fleets, and (b) deep specialists who handle architecture, security, and escalation.

---

*Report compiled from public research, company announcements, and published technical papers. For investment or partnership decisions, direct verification with named companies is recommended.*
