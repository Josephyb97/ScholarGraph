# ScholarGraph - Academic Literature Intelligence Toolkit

<div align="center">

**[中文](README.md) | English**

**Efficient, Systematic Academic Literature Analysis and Knowledge Management Tool**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3+-orange.svg)](https://bun.sh/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Project Goals

This toolkit addresses core challenges in academic research and knowledge acquisition:

| Problem | Solution |
|---------|----------|
| Information overload | AI-powered multi-source intelligent filtering |
| Knowledge fragmentation | Automated knowledge graph construction |
| Difficulty tracking progress | Real-time monitoring and smart reports |
| Invisible knowledge gaps | Proactive blind spot detection |
| Complex concept learning | One-click learning card generation |
| Time-consuming paper analysis | Deep intelligent analysis and comparison |

---

## Core Features

### Basic Features

#### 1. Literature Search

Multi-source academic paper search across arXiv, Semantic Scholar, and Web.

```bash
# CLI usage
lit search "transformer attention" --limit 20 --source arxiv --sort citations

# Programmatic API
import LiteratureSearch from './literature-search/scripts/search';

const searcher = new LiteratureSearch();
const results = await searcher.search("large language models", {
  sources: ['arxiv', 'semantic_scholar'],
  limit: 10,
  sortBy: 'citations'
});
```

#### 2. Concept Learner

Rapidly build knowledge frameworks and generate structured learning cards.

```bash
# CLI usage
lit learn "BERT" --depth advanced --papers --code --output bert-card.md

# Programmatic API
import ConceptLearner from './concept-learner/scripts/learn';

const learner = new ConceptLearner();
const card = await learner.learn("Transformer", {
  depth: 'advanced',
  includePapers: true,
  includeCode: true
});
```

**Output includes**:
- Definitions and core concepts
- Core components
- Historical evolution timeline
- Application scenarios and cases
- Related concept relationship map
- Learning path planning
- Code examples (optional)
- Related papers (optional)

#### 3. Knowledge Gap Detector

Proactively identify blind spots and weak areas in your knowledge system.

```bash
# CLI usage
lit detect --domain "Deep Learning" --known "CNN,RNN" --output dl-gaps.md

# Programmatic API
import KnowledgeGapDetector from './knowledge-gap-detector/scripts/detect';

const detector = new KnowledgeGapDetector();
const report = await detector.detect({
  domain: 'Machine Learning',
  knownConcepts: ['Python', 'NumPy', 'Pandas'],
  targetLevel: 'advanced'
});
```

**Output includes**:
- Critical gaps (must learn)
- Recommended learning (should learn)
- Cross-disciplinary opportunities
- Emerging topics
- Suggested learning order
- Estimated learning effort

#### 4. Progress Tracker

Real-time monitoring of research field dynamics with automatic progress reports.

```bash
# CLI usage
lit track report --type weekly --topic "large language model" --output weekly-report.md

# Programmatic API
import ProgressTracker from './progress-tracker/scripts/track';

const tracker = new ProgressTracker();
await tracker.addWatch({
  type: 'keyword',
  value: 'large language model',
  frequency: 'daily'
});
const report = await tracker.generateReport({ type: 'weekly' });
```

#### 5. Paper Analyzer

Deep paper analysis to extract key contributions and insights.

```bash
# CLI usage
lit analyze "https://arxiv.org/abs/1706.03762" --mode deep --output analysis.md

# Programmatic API
import PaperAnalyzer from './paper-analyzer/scripts/analyze';

const analyzer = new PaperAnalyzer();
const analysis = await analyzer.analyze({
  url: 'https://arxiv.org/abs/1706.03762',
  mode: 'deep'
});
```

**Analysis modes**:
- `quick`: Quick analysis (summary, key points)
- `standard`: Standard analysis (methods, experiments, contributions)
- `deep`: Deep analysis (full analysis, limitations, future work)

#### 6. Knowledge Graph Builder

Visualize concept relationships and build interactive knowledge graphs.

```bash
# CLI usage
lit graph transformer attention BERT GPT --format mermaid --output graph.md

# Programmatic API
import KnowledgeGraphBuilder from './knowledge-graph/scripts/graph';

const builder = new KnowledgeGraphBuilder();
const graph = await builder.build(['transformer', 'attention', 'BERT']);
console.log(builder.toMermaid(graph));
```

**Output formats**:
- `mermaid`: Mermaid diagram format
- `json`: JSON data format

---

### Advanced Features

#### 7. Review Detector

Automatically identify review papers with Chinese and English keyword support. Multi-dimensional scoring (title 30% + citations 25% + abstract 25% + AI 20%).

```bash
# CLI usage - search and identify reviews
lit review-search "attention mechanism" --limit 10

# Programmatic API
import ReviewDetector from './review-detector/scripts/detect';

const detector = new ReviewDetector();
await detector.initialize();
const result = await detector.detectReview(paper);
console.log(`Confidence: ${result.confidence}, Type: ${result.reviewType}`);
```

#### 8. Concept Extractor

Extract core academic concepts from review papers, automatically categorize and identify relationships between concepts.

```bash
# Programmatic API
import ConceptExtractor from './concept-extractor/scripts/extract';

const extractor = new ConceptExtractor();
await extractor.initialize();
const result = await extractor.extractFromReview(analysis);
console.log(extractor.formatResult(result));
```

**Extraction capabilities**:
- 15-30 core concepts
- Four-level categorization (foundation/core/advanced/application)
- Importance scoring (1-5)
- Inter-concept relationship identification

#### 9. Review-to-Graph Workflow

End-to-end workflow: Search reviews -> Detect -> Confirm -> Analyze -> Extract concepts -> Build graph -> Associate papers -> Persist.

```bash
# Search reviews by keyword and build knowledge graph
lit review-graph "deep learning" --output dl-graph --enrich

# Build graph directly from review URL
lit review-graph "https://arxiv.org/abs/xxxx" --output my-graph --enrich

# Auto-confirm mode (non-interactive)
lit review-graph "transformer" --output tf-graph --enrich --auto-confirm --min-confidence 0.6
```

#### 10. Knowledge Graph Query

Bidirectional index queries: Concept -> Papers, Paper -> Concepts.

```bash
# Find related papers by concept
lit query concept "transformer" --graph dl-graph --limit 20 --type all

# Find associated concepts by paper
lit query paper "https://arxiv.org/abs/1706.03762" --graph dl-graph

# Graph management
lit graph-list                              # List all graphs
lit graph-stats dl-graph                    # Graph statistics
lit graph-viz dl-graph --format mermaid     # Visualization
lit graph-export dl-graph --output dl.json  # Export
```

#### 12. Compare Concepts

Compare similarities, differences, and use cases between two concepts.

```bash
# CLI usage
lit compare concepts CNN RNN --output cnn-vs-rnn.md

# Programmatic API
const comparison = await learner.compare('CNN', 'RNN');
```

**Output includes**:
- Similarities
- Differences
- Use cases (when to prefer which)

#### 13. Compare Papers

Compare common themes, key differences, and synthesis analysis across multiple papers.

```bash
# CLI usage - compare two papers
lit compare papers \
  "https://arxiv.org/abs/1706.03762" \
  "https://arxiv.org/abs/1810.04805" \
  --output transformer-vs-bert.md

# Compare three or more papers
lit compare papers \
  "https://arxiv.org/abs/1706.03762" \
  "https://arxiv.org/abs/1810.04805" \
  "https://arxiv.org/abs/2005.14165" \
  --output three-papers.md

# Programmatic API
const comparison = await analyzer.compare([url1, url2, url3]);
```

**Output includes**:
- Compared papers list
- Common themes
- Key differences
- Synthesis analysis

#### 14. Critique

Critical analysis of papers, identifying strengths, weaknesses, research gaps, and improvement suggestions.

```bash
# CLI usage
lit critique "https://arxiv.org/abs/1706.03762" \
  --focus "novelty,scalability,efficiency" \
  --output critique.md

# Programmatic API
const critique = await analyzer.critique({
  url: 'https://arxiv.org/abs/1706.03762',
  focusAreas: ['novelty', 'scalability']
});
```

**Output includes**:
- Paper information
- Focus areas (optional)
- Strengths
- Weaknesses
- Research gaps
- Improvement suggestions
- Overall assessment

#### 15. Learning Path

Find optimal learning paths from one concept to another.

```bash
# CLI usage
lit path "Machine Learning" "Deep Learning" \
  --concepts "Neural Networks,Backpropagation" \
  --output ml-to-dl-path.md

# Programmatic API
const graph = await builder.build(concepts);
const path = builder.findPath(graph, 'Machine Learning', 'Deep Learning');
const order = builder.getTopologicalOrder(graph);
```

**Output includes**:
- Recommended learning path
- Mermaid visualization
- Learning suggestions

---

## Installation

### Prerequisites

- [Bun](https://bun.sh/) 1.3 or higher
- Node.js 18+ (optional, if not using Bun)

### Installation Steps

```bash
# Clone repository
git clone https://github.com/your-username/literature-skills.git
cd literature-skills

# Install dependencies
bun install

# Initialize configuration
bun run cli.ts config init
```

---

## Quick Start

### Configure AI Provider

This toolkit supports 15+ AI providers. Configure the corresponding API key:

```bash
# Using OpenAI
export AI_PROVIDER=openai
export OPENAI_API_KEY="your-api-key"

# Using DeepSeek
export AI_PROVIDER=deepseek
export DEEPSEEK_API_KEY="your-api-key"

# Using OpenRouter
export AI_PROVIDER=openai
export OPENAI_API_KEY="your-openrouter-key"
export OPENAI_BASE_URL="https://openrouter.ai/api/v1"
export OPENAI_MODEL="deepseek/deepseek-chat"

# Using Zhipu AI
export AI_PROVIDER=zhipu
export ZHIPU_API_KEY="your-api-key"
```

**Supported AI Providers**:
- International: OpenAI, Anthropic, Azure OpenAI, Groq, Together AI, Ollama
- China: Qwen (DashScope), DeepSeek, Zhipu AI (GLM), MiniMax, Moonshot (Kimi), Baichuan AI, Yi, Doubao

### Basic Usage Examples

```bash
# 1. Search literature
lit search "transformer attention" --limit 20

# 2. Learn a concept
lit learn "Transformer" --depth advanced --output transformer.md

# 3. Detect knowledge gaps
lit detect --domain "Deep Learning" --known "CNN,RNN"

# 4. Analyze a paper
lit analyze "https://arxiv.org/abs/1706.03762" --output analysis.md

# 5. Build knowledge graph
lit graph transformer attention BERT GPT --format mermaid

# 6. Search review papers
lit review-search "attention mechanism" --limit 10

# 7. Build knowledge graph from reviews (with key paper association)
lit review-graph "deep learning" --output dl-graph --enrich

# 8. Query papers by concept
lit query concept "transformer" --graph dl-graph --limit 20

# 9. Query concepts by paper
lit query paper "https://arxiv.org/abs/1706.03762" --graph dl-graph

# 10. Compare concepts
lit compare concepts CNN RNN

# 11. Compare papers
lit compare papers "https://arxiv.org/abs/1706.03762" "https://arxiv.org/abs/1810.04805"

# 12. Critical analysis
lit critique "https://arxiv.org/abs/1706.03762" --focus "novelty,scalability"

# 13. Find learning path
lit path "Machine Learning" "Deep Learning" --concepts "Neural Networks"
```

---

## Use Cases

### Scenario 1: Quick Onboarding to a New Field

```bash
# 1. Learn core concepts
lit learn "Large Language Model" --depth beginner --code --output llm-basics.md

# 2. Detect prerequisite knowledge gaps
lit detect --domain "LLM" --known "transformer,attention" --output llm-gaps.md

# 3. Build knowledge graph
lit graph LLM transformer attention GPT BERT --format mermaid --output llm-graph.md

# 4. Plan learning path
lit path "Transformer" "Large Language Model" --concepts "attention,BERT,GPT"
```

### Scenario 2: Rapidly Build Domain Knowledge from Reviews

```bash
# 1. Search for review papers in the domain
lit review-search "attention mechanism" --limit 10

# 2. Build knowledge graph from reviews (with key paper association)
lit review-graph "attention mechanism" --output attention-graph --enrich

# 3. View graph statistics
lit graph-stats attention-graph

# 4. Query related papers for a concept
lit query concept "self-attention" --graph attention-graph --limit 10

# 5. Visualize knowledge graph
lit graph-viz attention-graph --format mermaid --output attention-graph.md
```

### Scenario 3: Deep Paper Understanding

```bash
# 1. Analyze paper
lit analyze "https://arxiv.org/abs/1706.03762" --mode deep --output transformer-paper.md

# 2. Critical analysis
lit critique "https://arxiv.org/abs/1706.03762" --focus "novelty,limitations" --output critique.md

# 3. Learn new concepts from paper
lit learn "Self-Attention" --depth advanced --papers --output self-attention.md

# 4. Compare related papers
lit compare papers \
  "https://arxiv.org/abs/1706.03762" \
  "https://arxiv.org/abs/1810.04805" \
  --output transformer-vs-bert.md
```

### Scenario 4: Research Progress Tracking

```bash
# 1. Add monitoring topic
lit track report --type weekly --topic "prompt engineering" --output weekly-report.md

# 2. Search latest papers
lit search "prompt engineering" --sort date --limit 10

# 3. Analyze trending papers
lit analyze "latest-paper-url" --mode quick
```

### Scenario 5: Concept Comparison and Selection

```bash
# 1. Compare two technical approaches
lit compare concepts "CNN" "RNN" --output cnn-vs-rnn.md

# 2. Compare multiple models
lit compare concepts "Transformer" "LSTM"

# 3. Build comparison graph
lit graph CNN RNN LSTM Transformer --format mermaid
```

---

## Project Structure

```
literature-skills/
├── cli.ts                      # Unified CLI entry point
├── config.ts                   # Configuration management
├── README.md                   # Project documentation (Chinese)
├── README_EN.md                # Project documentation (English)
├── ADVANCED_FEATURES.md        # Advanced features guide
├── TEST_RESULTS.md             # Test results report
│
├── shared/                     # Shared modules
│   ├── ai-provider.ts          # AI provider abstraction layer
│   ├── types.ts                # Shared type definitions
│   ├── validators.ts           # Parameter validation
│   ├── utils.ts                # Utility functions
│   └── errors.ts               # Error handling
│
├── literature-search/          # Literature search
│   ├── skill.md
│   └── scripts/
│       ├── search.ts
│       ├── query-expander.ts   # Query expansion
│       └── types.ts
│
├── concept-learner/            # Concept learning
│   ├── skill.md
│   └── scripts/
│       ├── learn.ts
│       └── types.ts
│
├── knowledge-gap-detector/     # Knowledge gap detection
│   ├── skill.md
│   └── scripts/
│       ├── detect.ts
│       └── types.ts
│
├── progress-tracker/           # Progress tracking
│   ├── skill.md
│   └── scripts/
│       ├── track.ts
│       └── types.ts
│
├── paper-analyzer/             # Paper analysis
│   ├── skill.md
│   └── scripts/
│       ├── analyze.ts
│       └── types.ts
│
├── review-detector/            # Review detection
│   └── scripts/
│       ├── detect.ts           # Multi-dimensional review detection
│       └── types.ts
│
├── concept-extractor/          # Concept extraction
│   └── scripts/
│       ├── extract.ts          # AI concept extraction & categorization
│       └── types.ts
│
├── knowledge-graph/            # Knowledge graph
│   ├── skill.md
│   └── scripts/
│       ├── graph.ts            # Graph building core
│       ├── indexer.ts          # Bidirectional index system
│       ├── storage.ts          # SQLite persistence
│       └── enricher.ts         # Key paper association
│
├── workflows/                  # Workflows
│   └── review-to-graph.ts      # Review-to-graph end-to-end pipeline
│
└── data/                       # Data directory (auto-created)
    └── knowledge-graphs.db     # SQLite database
```

---

## Configuration

### Configuration File

Configuration file `literature-config.json`:

```json
{
  "user": {
    "interests": ["Machine Learning", "NLP"],
    "level": "intermediate",
    "primaryLanguage": "zh-CN"
  },
  "search": {
    "defaultSources": ["arxiv", "semantic_scholar"],
    "maxResults": 20,
    "sortBy": "relevance"
  },
  "learning": {
    "depth": "standard",
    "includePapers": true,
    "includeCode": false
  },
  "tracking": {
    "enabled": true,
    "frequency": "weekly",
    "keywords": ["transformer", "large language model"]
  }
}
```

### Configuration Management Commands

```bash
# Initialize configuration file
lit config init

# Show current configuration
lit config show

# Set configuration items
lit config set user.level "advanced"
lit config set learning.depth "deep"

# Reset to default configuration
lit config reset
```

---

## Environment Variables

### AI Provider Configuration

```bash
# Select AI provider
export AI_PROVIDER=openai  # openai, anthropic, azure, ollama, qwen, deepseek, zhipu, minimax, moonshot, baichuan, yi, doubao, groq, together

# International providers
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"
export AZURE_OPENAI_ENDPOINT="your-endpoint"
export AZURE_OPENAI_API_KEY="your-key"
export GROQ_API_KEY="your-key"
export TOGETHER_API_KEY="your-key"
export OLLAMA_BASE_URL="http://localhost:11434"

# China providers
export QWEN_API_KEY="your-key"           # or DASHSCOPE_API_KEY
export DEEPSEEK_API_KEY="your-key"
export ZHIPU_API_KEY="your-key"
export MINIMAX_API_KEY="your-key"
export MOONSHOT_API_KEY="your-key"
export BAICHUAN_API_KEY="your-key"
export YI_API_KEY="your-key"
export DOUBAO_API_KEY="your-key"

# Search API (optional)
export SERPER_API_KEY="your-key"  # For web search functionality
```

---

## Output Formats

### Markdown Reports

All tools support Markdown output for easy reading and sharing:

- **Concept cards**: Definitions, components, history, applications, learning paths, code examples
- **Knowledge gap reports**: Gap analysis, learning suggestions, effort estimation
- **Progress reports**: New papers, trending topics, recommended reading
- **Paper analysis**: Methods, experiments, contributions, limitations
- **Comparison analysis**: Similarities, differences, use cases
- **Critical analysis**: Strengths, weaknesses, research gaps, improvement suggestions

### JSON Data

Structured JSON output for programmatic processing:

```typescript
interface SearchResult {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishDate: string;
  citationCount: number;
  url: string;
  source: string;
}

interface ConceptCard {
  concept: string;
  definition: string;
  coreComponents: Component[];
  applications: Application[];
  relatedConcepts: RelatedConcept[];
  learningPath: LearningPhase[];
  codeExamples?: CodeExample[];
  papers?: Paper[];
}
```

---

## Testing

The project has been comprehensively tested with all features working correctly.

### Running Tests

```bash
# Test basic features
bun run cli.ts search "transformer" --limit 5
bun run cli.ts learn "BERT" --depth intermediate
bun run cli.ts detect --domain "NLP" --known "transformer"

# Test advanced features
bun run cli.ts compare concepts CNN RNN
bun run cli.ts compare papers "url1" "url2"
bun run cli.ts critique "paper-url" --focus "novelty"
bun run cli.ts path "ML" "DL" --concepts "NN"

# Test programmatic API
bun run test-advanced-features.ts
```

### Test Results

See [TEST_RESULTS.md](TEST_RESULTS.md) for detailed test results and coverage.

---

## CLI Reference

### Complete Command List

```bash
lit <command> [options]

Commands:
  search <query>              Search related literature
  learn <concept>             Learn concept and generate knowledge card
  detect --domain <d>         Detect knowledge gaps
  track <action>              Progress tracking
  analyze <url>               Analyze paper
  graph <concepts...>         Build knowledge graph
  compare <type> <items...>   Comparative analysis
  critique <url>              Critical paper analysis
  path <from> <to>            Find learning path
  review-search <query>       Search and identify review papers
  review-graph <query|url>    Build knowledge graph from reviews
  query concept <name>        Find related papers by concept
  query paper <url>           Find related concepts by paper
  graph-stats <name>          Show graph statistics
  graph-list                  List all graphs
  graph-viz <name>            Graph visualization
  graph-export <name>         Export graph data
  config <action>             Configuration management

Options:
  --help, -h                  Show help information
  --output <file>             Output file path
  --limit <n>                 Result count limit
  --depth <d>                 Learning depth (beginner|intermediate|advanced)
  --mode <m>                  Analysis mode (quick|standard|deep)
  --format <f>                Output format (mermaid|json)
  --focus <areas>             Focus areas (comma-separated)
  --graph <name>              Specify graph name (query commands)
  --enrich                    Search and associate key papers (review-graph)
  --auto-confirm              Auto-confirm reviews (review-graph)
```

See [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) for detailed usage instructions.

---

## Development Guide

### Adding New Features

1. Create directory structure:
```bash
mkdir -p my-feature/scripts
```

2. Write feature description (`skill.md`)

3. Implement core script (`scripts/main.ts`)

4. Define types (`scripts/types.ts`)

5. Register command in `cli.ts`

### Code Standards

- Use TypeScript strict mode
- Follow ESLint rules
- Write unit tests
- Add JSDoc comments

---

## Important Notes

### API Rate Limits

- **Semantic Scholar API**: Has rate limits, automatic retry and delay implemented
- **arXiv API**: Relatively lenient, recommended for batch operations
- **Recommendation**: Use arXiv URLs for paper analysis and comparison

### Best Practices

1. **Use arXiv URLs**: More stable than Semantic Scholar URLs
2. **Configure SERPER_API_KEY**: Provides web search fallback capability
3. **Choose appropriate analysis mode**: `quick` for browsing, `deep` for in-depth research
4. **Space out batch operations**: Avoid too many requests in a short time

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [arXiv](https://arxiv.org/) - Open access paper repository
- [Semantic Scholar](https://www.semanticscholar.org/) - Academic search engine
- [Bun](https://bun.sh/) - Fast JavaScript runtime
- All AI providers - Providing powerful language model support

---

## Contact

- Bug reports: [GitHub Issues](https://github.com/your-username/literature-skills/issues)
- Feature suggestions: [GitHub Discussions](https://github.com/your-username/literature-skills/discussions)

---

<div align="center">

**If this project helps you, please give it a Star!**

Made with love by the ScholarGraph Team

</div>
