import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import * as os from 'os';

// Batas maksimal halaman yang ingin dicrawl
type Rule = { name: string; test: (html: string) => boolean };
const MAX_PAGES = 1000;
const OUTPUT_FILE = path.resolve(process.cwd(), 'urls.json');
const PASS_FILE = path.resolve(process.cwd(), 'passed.json');
const FAIL_FILE = path.resolve(process.cwd(), 'failed.json');
const NOTFOUND_FILE = path.resolve(process.cwd(), 'notfound.json');
const BASE_URL = 'https://tradersfamily.id'.replace(/\/$/, '');

interface PageInfo {
  title: string;
  url: string;
  score: number;
  passedRules: string[];
  failedRules: string[];
}

const visited = new Set<string>();
const results: PageInfo[] = [];
const passed: PageInfo[] = [];
const failed: PageInfo[] = [];
const notFound: { url: string; error: string }[] = [];
const crawlQueue: string[] = [];

const rules: Rule[] = [
  { name: 'Data layer script', test: html => /<script\s+async\s+src=["']\/\/account\.tradersfamily\.id\/embed\/js\/datalayer\?tm=\d+["']/.test(html) },
  { name: 'og:image meta', test: html => /<meta\s+name=["']image["']\s+property=["']og:image["']/.test(html) },
  { name: 'twitter:image meta', test: html => /<meta\s+name=["']twitter:image["']/.test(html) },
  { name: 'pingback link', test: html => /<link\s+rel=["']pingback["']\s+href=["']https?:\/\/tradersfamily\.id\/xmlrpc\.php["']/.test(html) },
  { name: 'shortcut icon', test: html => /<link\s+rel=["']shortcut icon["']/.test(html) },
  { name: 'og:site_name meta', test: html => /<meta\s+property=["']og:site_name["']\s+content=["']Traders Family["']/.test(html) },
  { name: 'og:title contains Traders Family', test: html => /<meta\s+property=["']og:title["']\s+content=["'][^"']*Traders Family[^"']*["']/.test(html) },
  { name: 'dns-prefetch s.w.org', test: html => /<link\s+rel=["']dns-prefetch["']\s+href=["']\/\/s\.w\.org["']/.test(html) },
  { name: 'dns-prefetch static2', test: html => /<link\s+rel=["']dns-prefetch["']\s+href=["']\/\/static2\.tradersfamily\.id["']/.test(html) },
  { name: 'RSS feed link', test: html => /<link\s+rel=["']alternate["']\s+type=["']application\/rss\+xml["']\s+title=["']Traders Family.*Feed["']\s+href=["']https?:\/\/tradersfamily\.id\/feed\/?["']/.test(html) },
  { name: 'Comments feed link', test: html => /<link\s+rel=["']alternate["']\s+type=["']application\/rss\+xml["']\s+title=["']Traders Family.*Comments Feed["']\s+href=["']https?:\/\/tradersfamily\.id\/comments\/feed\/?["']/.test(html) },
  { name: 'disclaimer text', test: html => html.includes('Seluruh konten di dalam website ini bersifat informatif') },
  { name: 'privacy policy text', test: html => html.includes(' PT. Traders Family membutuhkan informasi pribadi bagi pihak yang melakukan pendaftaran demo dan live account untuk kepentingan internal. PT. Traders Family dan karyawannya berkewajiban menjaga kerahasiaan informasi tersebut dan tidak akan memberikannya kepada pihak ketiga. Namun jika diwajibkan oleh undang-undang, PT. Traders Family dapat memberikan informasi tersebut ke otoritas publik') },
];

function normalizeUrl(href: string): string | null {
  try {
    const urlObj = new URL(href, BASE_URL);
    if (urlObj.origin === new URL(BASE_URL).origin) {
      urlObj.hash = '';
      urlObj.search = '';
      return urlObj.toString().replace(/\/$/, '');
    }
  } catch {}
  return null;
}

async function crawlPage(pageUrl: string): Promise<void> {
  if (visited.has(pageUrl)) return;
  visited.add(pageUrl);
  try {
    const response = await axios.get<string>(pageUrl, { timeout: 10000 });
    const html = response.data;
    const $ = cheerio.load(html);

    const passedRules = rules.filter(r => r.test(html)).map(r => r.name);
    const failedRules = rules.filter(r => !r.test(html)).map(r => r.name);
    const score = passedRules.length;

    const info: PageInfo = {
      title: $('head > title').text().trim() || pageUrl,
      url: pageUrl,
      score,
      passedRules,
      failedRules
    };

    results.push(info);
    if (failedRules.length === 0) {
      console.log({
        title: info.title,
        url: info.url,
        success: true
      })
      passed.push(info);
    } else {
      failed.push(info);
      console.log({
        title: info.title,
        url: info.url,
        success: false,
        missing: failedRules.join(', ')
      })
      // console.log(`not match: ${pageUrl} (missing: ${failedRules.join(', ')})`);
    }

    if (results.length >= MAX_PAGES) return;
    $('a[href]').each((_, elem) => {
      const href = $(elem).attr('href')?.trim();
      const normalized = href ? normalizeUrl(href) : null;
      if (normalized && !visited.has(normalized) && results.length + crawlQueue.length < MAX_PAGES) {
        crawlQueue.push(normalized);
      }
    });
  } catch (error: any) {
    notFound.push({ url: pageUrl, error: error.message });
    console.error(`Gagal memuat halaman ${pageUrl}: ${error.message}`);
  }
}

async function startCrawl(): Promise<void> {
  crawlQueue.push(BASE_URL);
  const concurrency = os.cpus().length;
  const workers: Promise<void>[] = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push((async () => {
      while (crawlQueue.length > 0 && results.length < MAX_PAGES) {
        const url = crawlQueue.shift()!;
        await crawlPage(url);
      }
    })());
  }
  await Promise.all(workers);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  fs.writeFileSync(PASS_FILE, JSON.stringify(passed, null, 2), 'utf-8');
  fs.writeFileSync(FAIL_FILE, JSON.stringify(failed, null, 2), 'utf-8');
  fs.writeFileSync(NOTFOUND_FILE, JSON.stringify(notFound, null, 2), 'utf-8');

  console.log(`Crawling selesai: ${results.length} halaman. Lolos: ${passed.length}, Gagal: ${failed.length}, Not found: ${notFound.length}`);
}

startCrawl().catch(err => {
  console.error('Crawler error:', err.message);
  process.exit(1);
});
