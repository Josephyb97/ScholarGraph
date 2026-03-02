#!/usr/bin/env bun
/**
 * Literature Skills - Unified CLI
 * 文献检索总结工具统一命令行入口
 *
 * 用法:
 *   lit <command> [options]
 *
 * 命令:
 *   search <query>          检索文献
 *   download <query>        检索并下载 PDF
 *   learn <concept>         学习概念
 *   detect <domain>         检测知识盲区
 *   track <action>          进展追踪
 *   analyze <url>           分析论文
 *   graph <concepts...>     构建知识图谱
 *   config <action>         配置管理
 */

import LiteratureSearch from './literature-search/scripts/search';
import { PdfDownloader } from './literature-search/scripts/pdf-downloader';
import QueryExpander from './literature-search/scripts/query-expander';
import ConceptLearner from './concept-learner/scripts/learn';
import KnowledgeGapDetector from './knowledge-gap-detector/scripts/detect';
import ProgressTracker from './progress-tracker/scripts/track';
import PaperAnalyzer from './paper-analyzer/scripts/analyze';
import KnowledgeGraphBuilder from './knowledge-graph/scripts/graph';
import ReviewDetector from './review-detector/scripts/detect';
import KnowledgeGraphIndexer from './knowledge-graph/scripts/indexer';
import GraphStorage from './knowledge-graph/scripts/storage';
import ReviewToGraphWorkflow from './workflows/review-to-graph';
import { ConfigManager, defaultConfig } from './config';
import { getErrorMessage } from './shared/errors';
import {
  validateSearchParams,
  validateLearnParams,
  validateDetectParams,
  validateAnalyzeParams,
  validateGraphParams,
  validatePdfDownloadParams,
  formatValidationErrors,
  isValidSearchSource,
  isValidSortBy,
  isValidLearningDepth,
  isValidAnalysisMode,
  isValidReportType
} from './shared/validators';
import type { SearchSource, SortBy, LearningDepth, AnalysisMode, ReportType } from './shared/types';

const COMMANDS = {
  search: '检索文献',
  download: '检索并下载 PDF',
  expand: '扩展查询',
  learn: '学习概念',
  detect: '检测知识盲区',
  track: '进展追踪',
  analyze: '分析论文',
  graph: '构建知识图谱',
  config: '配置管理',
  compare: '对比分析',
  critique: '批判性分析',
  path: '学习路径',
  'review-search': '搜索综述',
  'review-graph': '从综述构建知识图谱',
  query: '查询知识图谱',
  'graph-stats': '图谱统计',
  'graph-list': '列出图谱',
  'graph-viz': '图谱可视化',
  'graph-export': '导出图谱'
};

function showHelp() {
  console.log(`
📚 Literature Skills - 文献检索总结工具
==========================================

用法:
  lit <command> [options]

命令:
  search <query>              检索相关文献
    --limit <n>               结果数量 (默认: 10, 范围: 1-100)
    --source <s1,s2,...>      数据源 (逗号分隔, 见下方列表)
    --sort <by>               排序方式 (relevance|date|citations)
    --domain <hint>           领域提示 (biomedical|cs|engineering|physics|general)
    --download                同时下载 PDF

  download <query>            检索并下载 PDF
    --limit <n>               结果数量 (默认: 5)
    --source <s1,s2,...>      数据源
    --output <dir>            下载目录 (默认: ./downloads/pdfs)

  expand <query>              扩展查询关键词（将模糊研究兴趣转化为具体关键词）
    --interactive             交互式模式（多轮对话）
    --output <file>           输出文件

  learn <concept>             学习概念并生成知识卡片
    --depth <d>               学习深度 (beginner|intermediate|advanced)
    --papers                  包含相关论文
    --code                    包含代码示例
    --output <file>           输出文件

  detect --domain <d>         检测知识盲区
    --known <list>            已知概念 (逗号分隔)
    --output <file>           输出报告文件

  track <action>              进展追踪
    add <type> <value>        添加监控项
    report                    生成报告
    --type <t>                报告类型 (daily|weekly|monthly)
    --output <file>           输出文件

  analyze <url>               分析论文
    --mode <m>                分析模式 (quick|standard|deep)
    --output <file>           输出文件

  graph <concepts...>         构建知识图谱
    --format <f>              输出格式 (mermaid|json)
    --output <file>           输出文件

  compare <type> <items...>   对比分析
    concepts <c1> <c2>        对比两个概念
    papers <url1> <url2>...   对比多篇论文
    --output <file>           输出文件

  critique <url>              批判性分析论文
    --focus <areas>           重点关注领域 (逗号分隔)
    --output <file>           输出文件

  path <from> <to>            查找学习路径
    --concepts <list>         概念列表 (逗号分隔)
    --output <file>           输出文件

  review-search <query>         搜索并识别综述论文
    --limit <n>               搜索数量 (默认: 10)

  review-graph <query|url>      从综述构建知识图谱
    --output <name>           图谱名称 (默认: 从查询生成)
    --enrich                  搜索并关联关键论文
    --auto-confirm            自动确认综述 (不需交互)
    --min-confidence <n>      最小综述置信度 (默认: 0.5)

  query concept <name>          按概念查找相关文献
    --graph <name>            图谱名称
    --limit <n>               结果数量
    --type <t>                论文类型 (review|research|all)

  query paper <url>             按论文查找关联概念
    --graph <name>            图谱名称

  graph-stats <name>            显示图谱统计信息
  graph-list                    列出所有已保存的图谱
  graph-viz <name>              图谱可视化
    --format <f>              输出格式 (mermaid|json)
    --output <file>           输出文件
  graph-export <name>           导出图谱数据
    --format <f>              格式 (json)
    --output <file>           输出文件

  config <action>             配置管理
    init                      初始化配置文件
    show                      显示当前配置
    set <key> <value>         设置配置项
    reset                     重置为默认配置

搜索数据源:
  免费源 (无需 API Key):
    arxiv               arXiv 预印本 (物理/数学/CS)
    semantic_scholar     Semantic Scholar (200M+ 论文)
    openalex             OpenAlex (250M+ 开放学术数据)
    pubmed               PubMed (生物医学文献)
    crossref             CrossRef (DOI 元数据)
    dblp                 DBLP (计算机科学)
    web                  Web 搜索 (需 SERPER_API_KEY)

  需 API Key:
    ieee                 IEEE Xplore (需 IEEE_API_KEY)
    core                 CORE 开放获取 (需 CORE_API_KEY)
    google_scholar       Google Scholar (需 SERPAPI_KEY)
    unpaywall            Unpaywall OA PDF 解析 (需 UNPAYWALL_EMAIL)

环境变量:
  AI_PROVIDER                 AI 提供商 (见下方支持列表)

  # 国际厂商
  OPENAI_API_KEY              OpenAI API 密钥
  ANTHROPIC_API_KEY           Anthropic API 密钥
  AZURE_OPENAI_ENDPOINT       Azure OpenAI 端点
  AZURE_OPENAI_API_KEY        Azure OpenAI 密钥
  GROQ_API_KEY                Groq API 密钥
  TOGETHER_API_KEY            Together AI API 密钥
  OLLAMA_BASE_URL             Ollama 服务地址 (默认: http://localhost:11434)

  # 国内厂商
  QWEN_API_KEY                通义千问 API 密钥 (或 DASHSCOPE_API_KEY)
  DEEPSEEK_API_KEY            DeepSeek API 密钥
  ZHIPU_API_KEY               智谱 AI (GLM) API 密钥
  MINIMAX_API_KEY             MiniMax API 密钥
  MOONSHOT_API_KEY            Moonshot (Kimi) API 密钥
  BAICHUAN_API_KEY            百川 AI API 密钥
  YI_API_KEY                  零一万物 API 密钥
  DOUBAO_API_KEY              豆包 API 密钥

  # 搜索
  SERPER_API_KEY              Serper 搜索 API 密钥 (用于 web 搜索功能)

  # 学术数据源 API Key
  NCBI_API_KEY                PubMed 高速访问密钥
  IEEE_API_KEY                IEEE Xplore API 密钥
  CORE_API_KEY                CORE API 密钥
  UNPAYWALL_EMAIL             Unpaywall 邮箱 (用于 OA PDF 解析)
  CROSSREF_MAILTO             CrossRef 礼貌池邮箱
  SERPAPI_KEY                 SerpAPI 密钥 (Google Scholar)

支持的 AI 提供商:
  zai, openai, anthropic, azure, ollama, qwen, deepseek, zhipu,
  minimax, moonshot, baichuan, yi, doubao, groq, together

示例:
  lit search "transformer attention" --limit 20
  lit search "CRISPR gene editing" --domain biomedical
  lit search "deep learning" --source semantic_scholar,arxiv --sort citations
  lit search "attention is all you need" --download --limit 3
  lit download "transformer" --limit 5 --output ./papers
  lit learn "BERT" --depth advanced --output bert-card.md
  lit detect --domain "NLP" --known "transformer,attention"
  lit track report --type weekly --output weekly-report.md
  lit analyze "https://arxiv.org/abs/2301.07001" --output analysis.md
  lit graph transformer attention BERT GPT --format mermaid

  # 对比两个概念
  lit compare concepts CNN RNN --output cnn-vs-rnn.md

  # 对比多篇论文
  lit compare papers "url1" "url2" --output comparison.md

  # 批判性分析论文
  lit critique "https://arxiv.org/abs/xxx" --focus "scalability,efficiency"

  # 查找学习路径
  lit path "Machine Learning" "Deep Learning" --concepts "ML,NN,DL,CNN"

  # 搜索综述
  lit review-search "attention mechanism" --limit 10

  # 从综述构建知识图谱
  lit review-graph "deep learning" --output dl-graph --enrich

  # 从综述URL构建知识图谱
  lit review-graph "https://arxiv.org/abs/xxxx" --output my-graph

  # 查询概念关联文献
  lit query concept "transformer" --graph dl-graph --limit 20

  # 查询论文关联概念
  lit query paper "https://arxiv.org/abs/1706.03762" --graph dl-graph

  # 图谱管理
  lit graph-list
  lit graph-stats dl-graph
  lit graph-viz dl-graph --format mermaid --output graph.md
  lit graph-export dl-graph --output dl-graph.json

  # 使用 OpenAI 提供商
  AI_PROVIDER=openai lit search "transformer"

  # 使用 DeepSeek 提供商
  AI_PROVIDER=deepseek lit learn "BERT"

  # 使用智谱 AI
  AI_PROVIDER=zhipu lit detect --domain "NLP"
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    process.exit(0);
  }

  const command = args[0];
  const cmdArgs = args.slice(1);

  try {
    switch (command) {
      case 'search':
        await handleSearch(cmdArgs);
        break;

      case 'download':
        await handleDownload(cmdArgs);
      case 'expand':
        await handleExpand(cmdArgs);
        break;

      case 'learn':
        await handleLearn(cmdArgs);
        break;

      case 'detect':
        await handleDetect(cmdArgs);
        break;

      case 'track':
        await handleTrack(cmdArgs);
        break;

      case 'analyze':
        await handleAnalyze(cmdArgs);
        break;

      case 'graph':
        await handleGraph(cmdArgs);
        break;

      case 'config':
        handleConfig(cmdArgs);
        break;

      case 'compare':
        await handleCompare(cmdArgs);
        break;

      case 'critique':
        await handleCritique(cmdArgs);
        break;

      case 'path':
        await handlePath(cmdArgs);
        break;

      case 'review-search':
        await handleReviewSearch(cmdArgs);
        break;

      case 'review-graph':
        await handleReviewGraph(cmdArgs);
        break;

      case 'query':
        await handleQuery(cmdArgs);
        break;

      case 'graph-stats':
        handleGraphStats(cmdArgs);
        break;

      case 'graph-list':
        handleGraphList();
        break;

      case 'graph-viz':
        handleGraphViz(cmdArgs);
        break;

      case 'graph-export':
        handleGraphExport(cmdArgs);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run "lit --help" for usage information.');
        process.exit(1);
    }
  } catch (error: unknown) {
    console.error('Error:', getErrorMessage(error));
    process.exit(1);
  }
}

/**
 * Parse comma-separated source list
 */
function parseSources(sourceArg: string): SearchSource[] {
  return sourceArg.split(',')
    .map(s => s.trim())
    .filter(s => isValidSearchSource(s)) as SearchSource[];
}

async function handleSearch(args: string[]) {
  const query = args[0];

  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex > -1 ? parseInt(args[limitIndex + 1]) : 10;

  const sourceIndex = args.indexOf('--source');
  const sourceArg = sourceIndex > -1 ? args[sourceIndex + 1] : undefined;
  const sources: SearchSource[] | undefined = sourceArg ? parseSources(sourceArg) : undefined;

  const sortIndex = args.indexOf('--sort');
  const sortArg = sortIndex > -1 ? args[sortIndex + 1] : 'relevance';
  const sortBy: SortBy = isValidSortBy(sortArg) ? sortArg : 'relevance';

  const domainIndex = args.indexOf('--domain');
  const domainHint = domainIndex > -1 ? args[domainIndex + 1] : undefined;

  const shouldDownload = args.includes('--download');

  // 验证参数
  const validation = validateSearchParams({
    query,
    limit,
    source: sources?.[0],
    sortBy
  });
  if (!validation.valid) {
    console.error('Validation errors:\n' + formatValidationErrors(validation.errors));
    process.exit(1);
  }

  const searcher = new LiteratureSearch();
  await searcher.initialize();

  // Show domain detection info
  if (!sources) {
    const strategy = searcher.getStrategy();
    const domainInfo = strategy.getDomainInfo(query, domainHint);
    const selectedSources = strategy.selectSources(query, searcher.getRegistry(), domainHint);
    console.log(`🔍 Searching for "${query}" [domain: ${domainInfo.domain}${domainInfo.isHinted ? ' (hinted)' : ' (auto)'}]`);
    console.log(`   Sources: ${selectedSources.join(', ')}`);
  } else {
    console.log(`🔍 Searching for "${query}" [sources: ${sources.join(', ')}]`);
  }

  const results = await searcher.search(query, {
    limit,
    sources,
    sortBy,
    domainHint
  });

  console.log(`\n📚 Found ${results.totalResults} results:\n`);

  results.results.forEach((paper, i) => {
    console.log(`${i + 1}. ${paper.title}`);
    console.log(`   Authors: ${paper.authors.slice(0, 3).join(', ')}${paper.authors.length > 3 ? '...' : ''}`);
    console.log(`   Source: ${paper.source} | Date: ${paper.publishDate}${paper.citations ? ` | Citations: ${paper.citations}` : ''}`);
    console.log(`   URL: ${paper.url}`);
    if (paper.doi) console.log(`   DOI: ${paper.doi}`);
    if (paper.openAccess) console.log(`   Open Access: Yes`);
    console.log('');
  });

  // Download PDFs if requested
  if (shouldDownload && results.results.length > 0) {
    console.log('📥 Downloading PDFs...\n');
    const downloader = new PdfDownloader(undefined, searcher.getRegistry());
    const downloads = await downloader.downloadResults(results.results);
    console.log(`\n✅ Downloaded ${downloads.length} PDFs`);
  }
}

async function handleDownload(args: string[]) {
  const query = args[0];

  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex > -1 ? parseInt(args[limitIndex + 1]) : 5;

  const sourceIndex = args.indexOf('--source');
  const sourceArg = sourceIndex > -1 ? args[sourceIndex + 1] : undefined;
  const sources: SearchSource[] | undefined = sourceArg ? parseSources(sourceArg) : undefined;

  const outputIndex = args.indexOf('--output');
  const outputDir = outputIndex > -1 ? args[outputIndex + 1] : undefined;

  // 验证参数
  const validation = validatePdfDownloadParams({ query, limit });
  if (!validation.valid) {
    console.error('Validation errors:\n' + formatValidationErrors(validation.errors));
    process.exit(1);
  }

  const searcher = new LiteratureSearch();
  await searcher.initialize();

  console.log(`🔍 Searching for "${query}"...`);

  const results = await searcher.search(query, { limit, sources });

  if (results.results.length === 0) {
    console.log('No results found.');
    return;
  }

  console.log(`📚 Found ${results.totalResults} results. Downloading PDFs...\n`);

  const downloader = new PdfDownloader(
    { outputDir },
    searcher.getRegistry()
  );
  const downloads = await downloader.downloadResults(results.results);

  console.log(`\n✅ Downloaded ${downloads.length}/${results.results.length} PDFs`);
  if (downloads.length > 0) {
    console.log(`   Saved to: ${outputDir || './downloads/pdfs'}`);
  }
}

async function handleExpand(args: string[]) {
  const query = args[0];

  if (!query) {
    console.error('Error: expand requires a query');
    process.exit(1);
  }

  const interactive = args.includes('--interactive');
  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex > -1 ? args[outputIndex + 1] : null;

  const expander = new QueryExpander();
  await expander.initialize();

  if (interactive) {
    // 交互式模式
    console.log('🔍 查询扩展 - 交互式模式\n');
    console.log('我会通过几个问题来帮助你明确研究方向并生成搜索关键词。\n');

    const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    let currentQuery = query;
    let iteration = 0;
    const maxIterations = 5;

    while (iteration < maxIterations) {
      console.log(`\n💬 第 ${iteration + 1} 轮对话\n`);

      const result = await expander.interactiveExpand(currentQuery, conversationHistory);
      const formattedOutput = expander.formatResult(result);
      console.log(formattedOutput);

      // 保存对话历史
      conversationHistory.push({ role: 'user', content: currentQuery });
      conversationHistory.push({ role: 'assistant', content: JSON.stringify(result) });

      if (!result.needsMoreInfo || !result.followUpQuestions || result.followUpQuestions.length === 0) {
        console.log('\n✅ 查询扩展完成！');

        if (outputFile) {
          const fs = await import('fs');
          fs.writeFileSync(outputFile, formattedOutput);
          console.log(`\n📄 结果已保存到 ${outputFile}`);
        }
        break;
      }

      // 等待用户输入
      console.log('\n请回答上述问题（输入 "skip" 跳过，"done" 完成）：');
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const userAnswer = await new Promise<string>((resolve) => {
        rl.question('> ', (answer) => {
          rl.close();
          resolve(answer);
        });
      });

      if (userAnswer.toLowerCase() === 'done') {
        console.log('\n✅ 查询扩展完成！');
        if (outputFile) {
          const fs = await import('fs');
          fs.writeFileSync(outputFile, formattedOutput);
          console.log(`\n📄 结果已保存到 ${outputFile}`);
        }
        break;
      }

      if (userAnswer.toLowerCase() === 'skip') {
        iteration++;
        continue;
      }

      currentQuery = userAnswer;
      iteration++;
    }

    if (iteration >= maxIterations) {
      console.log('\n⚠️ 已达到最大对话轮数，查询扩展结束。');
    }

  } else {
    // 单次模式
    console.log(`🔍 扩展查询: "${query}"\n`);

    const result = await expander.expandQuery(query);
    const formattedOutput = expander.formatResult(result);
    console.log(formattedOutput);

    if (outputFile) {
      const fs = await import('fs');
      fs.writeFileSync(outputFile, formattedOutput);
      console.log(`\n📄 结果已保存到 ${outputFile}`);
    }

    // 如果生成了关键词，询问是否直接搜索
    if (result.keywords.length > 0 && !result.needsMoreInfo) {
      console.log('\n💡 提示：你可以使用这些关键词进行搜索：');
      result.keywords.slice(0, 3).forEach((kw, i) => {
        console.log(`   lit search "${kw.term}"`);
      });
    }
  }
}

async function handleLearn(args: string[]) {
  const concept = args[0];

  const depthIndex = args.indexOf('--depth');
  const depthArg = depthIndex > -1 ? args[depthIndex + 1] : 'intermediate';
  const depth: LearningDepth = isValidLearningDepth(depthArg) ? depthArg : 'intermediate';

  const includePapers = args.includes('--papers');
  const includeCode = args.includes('--code');

  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex > -1 ? args[outputIndex + 1] : null;

  // 验证参数
  const validation = validateLearnParams({ concept, depth });
  if (!validation.valid) {
    console.error('Validation errors:\n' + formatValidationErrors(validation.errors));
    process.exit(1);
  }

  const learner = new ConceptLearner();
  await learner.initialize();

  console.log(`📖 Learning "${concept}"...`);

  const card = await learner.learn(concept, {
    depth,
    includePapers,
    includeCode
  });

  if (outputFile) {
    const fs = await import('fs');
    fs.writeFileSync(outputFile, learner.toMarkdown(card));
    console.log(`\n✅ Concept card saved to ${outputFile}`);
  } else {
    console.log('\n📋 Concept Card:\n');
    console.log(`Title: ${card.concept}`);
    console.log(`Definition: ${card.definition}`);
    console.log(`\nCore Components: ${card.coreComponents.length}`);
    console.log(`Applications: ${card.applications.length}`);
    console.log(`Related Concepts: ${card.relatedConcepts.length}`);
  }
}

async function handleDetect(args: string[]) {
  const domainIndex = args.indexOf('--domain');
  const domain = domainIndex > -1 ? args[domainIndex + 1] : 'Machine Learning';

  const knownIndex = args.indexOf('--known');
  const known = knownIndex > -1 ? args[knownIndex + 1].split(',').map(s => s.trim()) : [];

  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex > -1 ? args[outputIndex + 1] : null;

  // 验证参数
  const validation = validateDetectParams({ domain });
  if (!validation.valid) {
    console.error('Validation errors:\n' + formatValidationErrors(validation.errors));
    process.exit(1);
  }

  const detector = new KnowledgeGapDetector();
  await detector.initialize();

  console.log(`🔍 Detecting knowledge gaps in "${domain}"...`);

  const report = await detector.detect({
    domain,
    knownConcepts: known
  });

  if (outputFile) {
    const fs = await import('fs');
    fs.writeFileSync(outputFile, detector.toMarkdown(report));
    console.log(`\n✅ Gap report saved to ${outputFile}`);
  } else {
    console.log('\n📊 Gap Analysis Summary:\n');
    console.log(`Domain: ${report.domain}`);
    console.log(`Coverage: ${report.summary.coveragePercentage}%`);
    console.log(`Total Gaps: ${report.summary.totalGaps}`);
    console.log(`  - Critical: ${report.summary.criticalCount}`);
    console.log(`  - Recommended: ${report.summary.recommendedCount}`);
    console.log(`  - Optional: ${report.summary.optionalCount}`);

    if (report.criticalGaps.length > 0) {
      console.log('\n🚨 Critical Gaps:');
      report.criticalGaps.slice(0, 5).forEach(gap => {
        console.log(`  - ${gap.concept}: ${gap.reason}`);
      });
    }
  }
}

async function handleTrack(args: string[]) {
  const action = args[0];

  const tracker = new ProgressTracker();
  await tracker.initialize();

  if (action === 'report') {
    const typeIndex = args.indexOf('--type');
    const typeArg = typeIndex > -1 ? args[typeIndex + 1] : 'daily';
    const type: ReportType = isValidReportType(typeArg) ? typeArg : 'daily';

    const outputIndex = args.indexOf('--output');
    const outputFile = outputIndex > -1 ? args[outputIndex + 1] : null;

    // 支持 --topic 参数来指定追踪主题
    const topicIndex = args.indexOf('--topic');
    const topic = topicIndex > -1 ? args[topicIndex + 1] : null;

    // 如果指定了主题，添加临时监控项
    if (topic) {
      await tracker.addWatch({ type: 'keyword', value: topic, frequency: type as 'daily' | 'weekly' | 'monthly' });
    } else {
      // 添加一些默认的热门主题用于演示
      await tracker.addWatches([
        { type: 'keyword', value: 'large language model', frequency: 'weekly' },
        { type: 'keyword', value: 'transformer', frequency: 'weekly' },
        { type: 'keyword', value: 'RAG retrieval augmented', frequency: 'weekly' }
      ]);
    }

    console.log(`📊 Generating ${type} report...`);

    const report = await tracker.generateReport({ type, topic: topic || undefined });

    if (outputFile) {
      const fs = await import('fs');
      fs.writeFileSync(outputFile, tracker.toMarkdown(report));
      console.log(`\n✅ Report saved to ${outputFile}`);
    } else {
      console.log('\n📈 Progress Report:\n');
      console.log(`Period: ${report.period.start} ~ ${report.period.end}`);
      console.log(`Total Papers: ${report.summary.totalPapers}`);
      console.log(`Highlighted: ${report.summary.highlightedPapers}`);
      console.log(`Trending: ${report.summary.trendingTopics.slice(0, 5).join(', ')}`);
    }
  } else {
    console.error('Error: Unknown track action. Use "report".');
    process.exit(1);
  }
}

async function handleAnalyze(args: string[]) {
  const url = args[0];

  const modeIndex = args.indexOf('--mode');
  const modeArg = modeIndex > -1 ? args[modeIndex + 1] : 'standard';
  const mode: AnalysisMode = isValidAnalysisMode(modeArg) ? modeArg : 'standard';

  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex > -1 ? args[outputIndex + 1] : null;

  // 验证参数
  const validation = validateAnalyzeParams({ url, mode });
  if (!validation.valid) {
    console.error('Validation errors:\n' + formatValidationErrors(validation.errors));
    process.exit(1);
  }

  const analyzer = new PaperAnalyzer();
  await analyzer.initialize();

  console.log(`📄 Analyzing paper...`);

  const analysis = await analyzer.analyze({ url, mode });

  if (outputFile) {
    const fs = await import('fs');
    fs.writeFileSync(outputFile, analyzer.toMarkdown(analysis));
    console.log(`\n✅ Analysis saved to ${outputFile}`);
  } else {
    console.log('\n📑 Paper Analysis:\n');
    console.log(`Title: ${analysis.metadata.title}`);
    console.log(`Authors: ${analysis.metadata.authors.join(', ')}`);
    console.log(`Year: ${analysis.metadata.year}`);
    console.log(`\nSummary: ${analysis.summary}`);
    console.log(`\nKey Points: ${analysis.keyPoints.length}`);
    console.log(`Contributions: ${analysis.contributions.length}`);
    console.log(`Limitations: ${analysis.limitations.length}`);
  }
}

async function handleGraph(args: string[]) {
  const formatIndex = args.indexOf('--format');
  const format = formatIndex > -1 ? args[formatIndex + 1] : 'mermaid';

  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex > -1 ? args[outputIndex + 1] : null;

  // 过滤掉选项参数及其值
  const optionIndices = new Set<number>();
  if (formatIndex > -1) {
    optionIndices.add(formatIndex);
    optionIndices.add(formatIndex + 1);
  }
  if (outputIndex > -1) {
    optionIndices.add(outputIndex);
    optionIndices.add(outputIndex + 1);
  }

  const concepts = args.filter((_, index) => !optionIndices.has(index));

  // 验证参数
  const validation = validateGraphParams({ concepts });
  if (!validation.valid) {
    console.error('Validation errors:\n' + formatValidationErrors(validation.errors));
    process.exit(1);
  }

  const builder = new KnowledgeGraphBuilder();
  await builder.initialize();

  console.log(`🔗 Building knowledge graph...`);

  const graph = await builder.build(concepts);

  let output: string;
  if (format === 'json') {
    output = builder.toJSON(graph);
  } else {
    output = builder.toMermaid(graph);
  }

  if (outputFile) {
    const fs = await import('fs');
    fs.writeFileSync(outputFile, output);
    console.log(`\n✅ Graph saved to ${outputFile}`);
  } else {
    console.log('\n📈 Knowledge Graph:\n');
    console.log(output);
  }
}

function handleConfig(args: string[]) {
  const action = args[0];
  const manager = new ConfigManager();

  switch (action) {
    case 'init':
      manager.save();
      console.log('✅ Configuration initialized at ./literature-config.json');
      break;

    case 'show':
      const config = manager.load();
      console.log(JSON.stringify(config, null, 2));
      break;

    case 'set':
      const key = args[1];
      const value = args[2];
      if (key && value) {
        try {
          const currentConfig = manager.load();

          // 解析嵌套路径 (e.g., "user.level" -> ["user", "level"])
          const keys = key.split('.');
          let target: any = currentConfig;

          // 导航到目标对象
          for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) {
              target[keys[i]] = {};
            }
            target = target[keys[i]];
          }

          // 设置值
          const lastKey = keys[keys.length - 1];
          try {
            target[lastKey] = JSON.parse(value);
          } catch {
            // 如果不是有效 JSON，作为字符串处理
            target[lastKey] = value;
          }

          manager.update(currentConfig);
          console.log(`✅ Set ${key} = ${value}`);
        } catch (error) {
          console.error(`Error setting ${key}:`, error);
          process.exit(1);
        }
      } else {
        console.error('Error: config set requires <key> and <value>');
        process.exit(1);
      }
      break;

    case 'reset':
      manager.reset();
      console.log('✅ Configuration reset to defaults');
      break;

    default:
      console.error('Error: Unknown config action. Use init|show|set|reset.');
      process.exit(1);
  }
}

async function handleCompare(args: string[]) {
  const type = args[0];

  if (type === 'concepts') {
    const concept1 = args[1];
    const concept2 = args[2];

    if (!concept1 || !concept2) {
      console.error('Error: compare concepts requires two concept names');
      process.exit(1);
    }

    const outputIndex = args.indexOf('--output');
    const outputFile = outputIndex > -1 ? args[outputIndex + 1] : null;

    const learner = new ConceptLearner();
    await learner.initialize();

    console.log(`🔄 Comparing "${concept1}" vs "${concept2}"...`);

    const comparison = await learner.compare(concept1, concept2);

    const markdown = `# ${comparison.concept1} vs ${comparison.concept2} - 概念对比

## 📊 相似点

${comparison.similarities.map(s => `- ${s}`).join('\n')}

## 🔀 差异点

${comparison.differences.map(d => `- ${d}`).join('\n')}

## 🎯 使用场景

### 优先使用 ${comparison.concept1}

${comparison.useCases.preferConcept1}

### 优先使用 ${comparison.concept2}

${comparison.useCases.preferConcept2}

---
*生成时间: ${new Date().toISOString()}*
`;

    if (outputFile) {
      const fs = await import('fs');
      fs.writeFileSync(outputFile, markdown);
      console.log(`\n✅ Comparison saved to ${outputFile}`);
    } else {
      console.log('\n📊 Concept Comparison:\n');
      console.log(`${comparison.concept1} vs ${comparison.concept2}\n`);
      console.log('相似点:');
      comparison.similarities.forEach(s => console.log(`  - ${s}`));
      console.log('\n差异点:');
      comparison.differences.forEach(d => console.log(`  - ${d}`));
      console.log('\n使用场景:');
      console.log(`  ${comparison.concept1}: ${comparison.useCases.preferConcept1}`);
      console.log(`  ${comparison.concept2}: ${comparison.useCases.preferConcept2}`);
    }
  } else if (type === 'papers') {
    const outputIndex = args.indexOf('--output');
    const outputFile = outputIndex > -1 ? args[outputIndex + 1] : null;

    // Filter out the type and option arguments
    const optionIndices = new Set<number>();
    optionIndices.add(0); // 'papers'
    if (outputIndex > -1) {
      optionIndices.add(outputIndex);
      optionIndices.add(outputIndex + 1);
    }

    const urls = args.filter((_, index) => !optionIndices.has(index));

    if (urls.length < 2) {
      console.error('Error: compare papers requires at least 2 paper URLs');
      process.exit(1);
    }

    const analyzer = new PaperAnalyzer();
    await analyzer.initialize();

    console.log(`📄 Comparing ${urls.length} papers...`);

    const comparison = await analyzer.compare(urls);

    const markdown = `# 论文对比分析

## 📚 对比论文

${comparison.papers.map((p, i) => `${i + 1}. ${p.title} (${p.year})`).join('\n')}

## 🔗 共同主题

${comparison.commonThemes.map(t => `- ${t}`).join('\n')}

## 🔀 主要差异

${comparison.differences.map(d => `- ${d}`).join('\n')}

## 💡 综合分析

${comparison.synthesis}

---
*生成时间: ${new Date().toISOString()}*
`;

    if (outputFile) {
      const fs = await import('fs');
      fs.writeFileSync(outputFile, markdown);
      console.log(`\n✅ Comparison saved to ${outputFile}`);
    } else {
      console.log('\n📊 Paper Comparison:\n');
      console.log('共同主题:');
      comparison.commonThemes.forEach(t => console.log(`  - ${t}`));
      console.log('\n主要差异:');
      comparison.differences.forEach(d => console.log(`  - ${d}`));
      console.log('\n综合分析:');
      console.log(comparison.synthesis);
    }
  } else {
    console.error('Error: Unknown compare type. Use "concepts" or "papers".');
    process.exit(1);
  }
}

async function handleCritique(args: string[]) {
  const url = args[0];

  if (!url) {
    console.error('Error: critique requires a paper URL');
    process.exit(1);
  }

  const focusIndex = args.indexOf('--focus');
  const focusAreas = focusIndex > -1 ? args[focusIndex + 1].split(',').map(s => s.trim()) : undefined;

  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex > -1 ? args[outputIndex + 1] : null;

  const analyzer = new PaperAnalyzer();
  await analyzer.initialize();

  console.log(`🔍 Performing critical analysis...`);

  // First get paper metadata
  const analysis = await analyzer.analyze({ url, mode: 'quick' });

  // Then perform critique
  const critique = await analyzer.critique({ url, focusAreas });

  const markdown = `# 论文批判性分析

## 📄 论文信息

- **标题**: ${analysis.metadata.title}
- **作者**: ${analysis.metadata.authors.join(', ')}
- **年份**: ${analysis.metadata.year}

${focusAreas ? `## 🎯 关注领域\n\n${focusAreas.map(a => `- ${a}`).join('\n')}\n` : ''}
## ✅ 优点

${critique.strengths.map(s => `- ${s}`).join('\n')}

## ⚠️ 缺点

${critique.weaknesses.map(w => `- ${w}`).join('\n')}

## 🔍 研究空白

${critique.gaps.map(g => `- ${g}`).join('\n')}

## 💡 改进建议

${critique.suggestions.map(s => `- ${s}`).join('\n')}

## 📊 总体评价

${critique.overallAssessment}

---
*生成时间: ${new Date().toISOString()}*
`;

  if (outputFile) {
    const fs = await import('fs');
    fs.writeFileSync(outputFile, markdown);
    console.log(`\n✅ Critique saved to ${outputFile}`);
  } else {
    console.log('\n🔍 Critical Analysis:\n');
    console.log(`Paper: ${analysis.metadata.title}\n`);
    console.log('优点:');
    critique.strengths.forEach(s => console.log(`  - ${s}`));
    console.log('\n缺点:');
    critique.weaknesses.forEach(w => console.log(`  - ${w}`));
    console.log('\n研究空白:');
    critique.gaps.forEach(g => console.log(`  - ${g}`));
    console.log('\n改进建议:');
    critique.suggestions.forEach(s => console.log(`  - ${s}`));
    console.log('\n总体评价:');
    console.log(critique.overallAssessment);
  }
}

async function handlePath(args: string[]) {
  const from = args[0];
  const to = args[1];

  if (!from || !to) {
    console.error('Error: path requires <from> and <to> concepts');
    process.exit(1);
  }

  const conceptsIndex = args.indexOf('--concepts');
  const conceptsList = conceptsIndex > -1 ? args[conceptsIndex + 1].split(',').map(s => s.trim()) : [];

  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex > -1 ? args[outputIndex + 1] : null;

  // Build the full concept list including from and to
  const allConcepts = [from, ...conceptsList, to];

  const builder = new KnowledgeGraphBuilder();
  await builder.initialize();

  console.log(`🗺️ Finding learning path from "${from}" to "${to}"...`);

  const graph = await builder.build(allConcepts);
  const path = builder.findPath(graph, from, to);

  if (path.length === 0) {
    console.log(`\n⚠️ No path found from "${from}" to "${to}"`);
    return;
  }

  const markdown = `# 学习路径: ${from} → ${to}

## 🗺️ 推荐路径

${path.map((concept, i) => `${i + 1}. ${concept}`).join('\n')}

## 📊 路径可视化

\`\`\`mermaid
graph LR
${path.map((concept, i) => i < path.length - 1 ? `  ${concept.replace(/\s+/g, '_')}[${concept}] --> ${path[i + 1].replace(/\s+/g, '_')}[${path[i + 1]}]` : '').filter(Boolean).join('\n')}
\`\`\`

## 📚 学习建议

按照上述路径顺序学习，每个概念都是下一个概念的基础。

---
*生成时间: ${new Date().toISOString()}*
`;

  if (outputFile) {
    const fs = await import('fs');
    fs.writeFileSync(outputFile, markdown);
    console.log(`\n✅ Learning path saved to ${outputFile}`);
  } else {
    console.log('\n🗺️ Learning Path:\n');
    console.log(path.map((concept, i) => `  ${i + 1}. ${concept}`).join('\n'));
    console.log('\n路径: ' + path.join(' → '));
  }
}

// ============================================
// 综述与知识图谱相关命令处理函数
// ============================================

async function handleReviewSearch(args: string[]) {
  const query = args[0];

  if (!query) {
    console.error('Error: review-search requires a query');
    process.exit(1);
  }

  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex > -1 ? parseInt(args[limitIndex + 1]) : 10;

  const workflow = new ReviewToGraphWorkflow();
  await workflow.initialize();

  const reviews = await workflow.searchReviews(query, limit);

  if (reviews.length === 0) {
    console.log('\n⚠️ 未找到综述论文。尝试使用不同的关键词。');
  }
}

async function handleReviewGraph(args: string[]) {
  const queryOrUrl = args[0];

  if (!queryOrUrl) {
    console.error('Error: review-graph requires a query or URL');
    process.exit(1);
  }

  const outputIndex = args.indexOf('--output');
  const graphName = outputIndex > -1 ? args[outputIndex + 1] : undefined;

  const enrich = args.includes('--enrich');
  const autoConfirm = args.includes('--auto-confirm');

  const minConfIndex = args.indexOf('--min-confidence');
  const minConfidence = minConfIndex > -1 ? parseFloat(args[minConfIndex + 1]) : 0.5;

  const workflow = new ReviewToGraphWorkflow();

  const isUrl = queryOrUrl.startsWith('http://') || queryOrUrl.startsWith('https://');

  if (isUrl) {
    // 从URL直接构建
    await workflow.runFromUrl(queryOrUrl, {
      graphName: graphName || 'review-graph',
      enrichWithPapers: enrich
    });
  } else {
    // 搜索综述并构建
    await workflow.run(queryOrUrl, {
      graphName,
      enrichWithPapers: enrich,
      autoConfirm,
      minReviewConfidence: minConfidence
    });
  }
}

async function handleQuery(args: string[]) {
  const subCommand = args[0];

  if (subCommand === 'concept') {
    const conceptName = args[1];
    if (!conceptName) {
      console.error('Error: query concept requires a concept name');
      process.exit(1);
    }

    const graphIndex = args.indexOf('--graph');
    const graphName = graphIndex > -1 ? args[graphIndex + 1] : null;

    if (!graphName) {
      console.error('Error: --graph <name> is required');
      process.exit(1);
    }

    const limitIndex = args.indexOf('--limit');
    const limit = limitIndex > -1 ? parseInt(args[limitIndex + 1]) : 10;

    const typeIndex = args.indexOf('--type');
    const paperType = typeIndex > -1 ? args[typeIndex + 1] : 'all';

    const storage = new GraphStorage();
    try {
      const graph = storage.loadGraph(graphName);
      if (!graph) {
        console.error(`Error: Graph "${graphName}" not found`);
        process.exit(1);
      }

      // 查找概念节点
      const node = graph.nodes.find(n =>
        n.label.toLowerCase().includes(conceptName.toLowerCase())
      );

      if (!node) {
        console.error(`Error: Concept "${conceptName}" not found in graph`);
        // 列出可用概念
        console.log('\n可用概念:');
        graph.nodes.forEach(n => console.log(`  - ${n.label}`));
        process.exit(1);
      }

      const indexer = new KnowledgeGraphIndexer();
      const results = indexer.findPapersByConcept(graph, node.id, {
        limit,
        paperType: paperType as 'review' | 'research' | 'all',
        sortBy: 'relevance'
      });

      console.log(indexer.formatPaperResults(node.label, results));
    } finally {
      storage.close();
    }
  } else if (subCommand === 'paper') {
    const paperUrl = args[1];
    if (!paperUrl) {
      console.error('Error: query paper requires a paper URL');
      process.exit(1);
    }

    const graphIndex = args.indexOf('--graph');
    const graphName = graphIndex > -1 ? args[graphIndex + 1] : null;

    if (!graphName) {
      console.error('Error: --graph <name> is required');
      process.exit(1);
    }

    const storage = new GraphStorage();
    try {
      const concepts = storage.queryConceptsByPaper(graphName, paperUrl);

      if (concepts.length === 0) {
        console.log(`\n⚠️ 未在图谱 "${graphName}" 中找到该论文的关联概念`);
      } else {
        console.log(`\n🔍 论文关联概念 (${concepts.length} 个):\n`);
        concepts.forEach((c, i) => {
          console.log(`  ${i + 1}. ${c.label} (${c.category}) - 相关度: ${(c.relevance * 100).toFixed(0)}%`);
        });
      }
    } finally {
      storage.close();
    }
  } else {
    console.error('Error: query requires "concept" or "paper" subcommand');
    process.exit(1);
  }
}

function handleGraphStats(args: string[]) {
  const graphName = args[0];

  if (!graphName) {
    console.error('Error: graph-stats requires a graph name');
    process.exit(1);
  }

  const storage = new GraphStorage();
  try {
    const graph = storage.loadGraph(graphName);
    if (!graph) {
      console.error(`Error: Graph "${graphName}" not found`);
      process.exit(1);
    }

    const indexer = new KnowledgeGraphIndexer();
    const stats = indexer.getIndexStats(graph);

    console.log(`\n📊 图谱 "${graphName}" 统计信息:`);
    console.log(indexer.formatStats(stats));

    if (graph.graphMetadata) {
      console.log(`\n📅 创建时间: ${graph.graphMetadata.createdAt}`);
      console.log(`📅 更新时间: ${graph.graphMetadata.updatedAt}`);
      if (graph.graphMetadata.sourceReviews.length > 0) {
        console.log(`\n📚 来源综述:`);
        graph.graphMetadata.sourceReviews.forEach((r, i) => {
          console.log(`  ${i + 1}. ${r}`);
        });
      }
    }

    // 显示概念列表
    console.log(`\n🔹 概念列表 (${graph.nodes.length}):`);
    const sorted = [...graph.nodes].sort((a, b) => b.importance - a.importance);
    sorted.forEach(n => {
      const stars = '★'.repeat(n.importance) + '☆'.repeat(5 - n.importance);
      const paperCount = n.literatureReferences?.length || 0;
      console.log(`  ${stars} ${n.label} (${n.category}) - ${paperCount} 篇论文`);
    });
  } finally {
    storage.close();
  }
}

function handleGraphList() {
  const storage = new GraphStorage();
  try {
    const graphs = storage.listGraphs();

    if (graphs.length === 0) {
      console.log('\n📭 没有已保存的图谱');
      console.log('使用 "lit review-graph <query>" 创建一个新图谱');
      return;
    }

    console.log(`\n📋 已保存的知识图谱 (${graphs.length}):\n`);
    graphs.forEach((g, i) => {
      console.log(`  ${i + 1}. ${g.name}`);
      console.log(`     概念: ${g.totalConcepts} | 文献: ${g.totalPapers} | 关系: ${g.totalRelations}`);
      console.log(`     更新: ${g.updatedAt}`);
      console.log('');
    });
  } finally {
    storage.close();
  }
}

function handleGraphViz(args: string[]) {
  const graphName = args[0];

  if (!graphName) {
    console.error('Error: graph-viz requires a graph name');
    process.exit(1);
  }

  const formatIndex = args.indexOf('--format');
  const format = formatIndex > -1 ? args[formatIndex + 1] : 'mermaid';

  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex > -1 ? args[outputIndex + 1] : null;

  const storage = new GraphStorage();
  try {
    const graph = storage.loadGraph(graphName);
    if (!graph) {
      console.error(`Error: Graph "${graphName}" not found`);
      process.exit(1);
    }

    const builder = new KnowledgeGraphBuilder();
    let output: string;

    if (format === 'json') {
      output = builder.toJSON(graph);
    } else {
      output = builder.toMermaid(graph);
    }

    if (outputFile) {
      const fs = require('fs');
      fs.writeFileSync(outputFile, output);
      console.log(`\n✅ 图谱可视化已保存到 ${outputFile}`);
    } else {
      console.log(`\n📈 知识图谱 "${graphName}":\n`);
      console.log(output);
    }
  } finally {
    storage.close();
  }
}

function handleGraphExport(args: string[]) {
  const graphName = args[0];

  if (!graphName) {
    console.error('Error: graph-export requires a graph name');
    process.exit(1);
  }

  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex > -1 ? args[outputIndex + 1] : `${graphName}.json`;

  const storage = new GraphStorage();
  try {
    const graph = storage.loadGraph(graphName);
    if (!graph) {
      console.error(`Error: Graph "${graphName}" not found`);
      process.exit(1);
    }

    const builder = new KnowledgeGraphBuilder();
    const json = builder.toJSON(graph);

    const fs = require('fs');
    fs.writeFileSync(outputFile, json);
    console.log(`\n✅ 图谱已导出到 ${outputFile}`);
  } finally {
    storage.close();
  }
}

main().catch(err => {
  console.error('Fatal error:', getErrorMessage(err));
  process.exit(1);
});
