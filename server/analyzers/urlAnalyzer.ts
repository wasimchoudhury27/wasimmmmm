import type { RiskSignal, UrlDetails } from '../../src/types.ts';

interface RawUrlDetection {
  category: RiskSignal['category'];
  name: string;
  severity: RiskSignal['severity'];
  baseWeight: number;
  whatDetected: string;
  whyItMatters: string;
  evidence: string[];
  recommendedAction: string;
}

export interface UrlAnalysisOutput {
  detections: RawUrlDetection[];
  urlDetails: UrlDetails;
  isValid: boolean;
  error?: string;
}

const HIGH_RISK_TLDS = new Set([
  'xyz', 'top', 'work', 'click', 'loan', 'buzz', 'fit', 'rest', 'bar',
  'cfd', 'icu', 'gq', 'tk', 'ml', 'cf', 'ga', 'zip', 'mov', 'surf', 'cam'
]);

const BRAND_PATTERNS = [
  { name: 'PayPal', pattern: /paypa[l1i]|pay-pal/i },
  { name: 'State Bank of India (SBI)', pattern: /sbi[-_]?bank|onlinesbi[-_]?portal|sbi[-_]?kyc/i },
  { name: 'HDFC Bank', pattern: /hdfc[-_]?net|hdfc[-_]?banking|hdfc[-_]?kyc/i },
  { name: 'ICICI Bank', pattern: /icici[-_]?bank|icici[-_]?update/i },
  { name: 'Netflix', pattern: /netfl[i1]x|netflix[-_]?account|netflix[-_]?billing/i },
  { name: 'Amazon', pattern: /amaz[o0]n[-_]?security|amazon[-_]?prime[-_]?verify/i },
  { name: 'Apple / iCloud', pattern: /app[l1]e[-_]?id|icloud[-_]?find|apple[-_]?support/i },
  { name: 'Google / Gmail', pattern: /goog[l1]e[-_]?verify|gmail[-_]?security/i },
  { name: 'Microsoft', pattern: /micros[o0]ft[-_]?online|msft[-_]?account/i },
  { name: 'Meta / WhatsApp', pattern: /whatsapp[-_]?web[-_]?auth|facebook[-_]?security/i }
];

export function analyzeUrlStructure(rawUrl: string): UrlAnalysisOutput {
  const detections: RawUrlDetection[] = [];
  const flaggedKeywords: string[] = [];

  let sanitized = rawUrl.trim();
  if (!/^https?:\/\//i.test(sanitized)) {
    sanitized = 'https://' + sanitized;
  }

  let parsed: URL;
  try {
    parsed = new URL(sanitized);
  } catch {
    return {
      detections: [],
      urlDetails: {
        url: rawUrl,
        domain: '',
        tld: '',
        protocol: '',
        isHttps: false,
        subdomains: [],
        isIpAddress: false,
        isPunycode: false,
        domainAgeStatus: 'Domain age unavailable',
        domainRegistrarStatus: 'Unavailable',
        entropyScore: 0,
        flaggedKeywords: []
      },
      isValid: false,
      error: 'Invalid URL format. Please provide a standard domain or URL (e.g., https://example.com).'
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol.replace(':', '');
  const isHttps = protocol === 'https';
  const fullPath = parsed.pathname + parsed.search;

  // 1. IP Address Host Check
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || /^\[[a-f0-9:]+\]$/i.test(hostname);
  if (isIpAddress) {
    flaggedKeywords.push('Raw IP Host');
    detections.push({
      category: 'URL_STRUCTURE',
      name: 'Direct IP Address Host',
      severity: 'CRITICAL',
      baseWeight: 28,
      whatDetected: `Target host "${hostname}" is a raw IP address instead of a registered domain name.`,
      whyItMatters: 'Legitimate companies use registered brand domains. Cybercriminals frequently use raw IP addresses to host short-lived phishing landing kits that evade DNS blocklists.',
      evidence: [hostname],
      recommendedAction: 'Do not access this IP address or submit any credentials. Verify the official web address directly.'
    });
  }

  // 2. Punycode / IDN Homograph check
  const isPunycode = hostname.includes('xn--');
  if (isPunycode) {
    flaggedKeywords.push('Punycode IDN');
    detections.push({
      category: 'URL_STRUCTURE',
      name: 'Punycode / Homograph Domain Obfuscation',
      severity: 'CRITICAL',
      baseWeight: 28,
      whatDetected: `Detected Punycode encoded host "${hostname}" indicating potential homograph character substitution.`,
      whyItMatters: 'Homograph attacks use lookalike characters from Cyrillic or Greek alphabets (e.g., Cyrillic "а" instead of Latin "a") to spoof trusted brands seamlessly.',
      evidence: [hostname],
      recommendedAction: 'Treat this address as highly deceptive. Do not trust visible glyph similarities.'
    });
  }

  // 3. Subdomains and TLD parsing
  const hostParts = hostname.split('.');
  const tld = hostParts.length > 1 ? hostParts[hostParts.length - 1] : '';
  const domainBase = hostParts.length >= 2 ? hostParts[hostParts.length - 2] : hostname;
  const subdomains = hostParts.length > 2 ? hostParts.slice(0, hostParts.length - 2) : [];

  // TLD check
  if (HIGH_RISK_TLDS.has(tld)) {
    flaggedKeywords.push(`.${tld} TLD`);
    detections.push({
      category: 'DOMAIN_INTEL',
      name: `High-Risk Top-Level Domain (.${tld})`,
      severity: 'HIGH',
      baseWeight: 18,
      whatDetected: `Domain operates under the ".${tld}" top-level domain extension.`,
      whyItMatters: 'Certain inexpensive or unmoderated TLDs exhibit disproportionately high frequencies of disposable phishing pages and malicious command-and-control nodes.',
      evidence: [`.${tld} extension on ${hostname}`],
      recommendedAction: 'Exercise elevated caution. Confirm that the institution routinely operates from this specific TLD.'
    });
  }

  // Subdomain abuse (excessive subdomains, e.g. login.secure.bank.update.example.com)
  if (subdomains.length >= 3) {
    flaggedKeywords.push('Subdomain Chain');
    detections.push({
      category: 'URL_STRUCTURE',
      name: 'Excessive Subdomain Chaining',
      severity: 'HIGH',
      baseWeight: 16,
      whatDetected: `Detected deep subdomain hierarchy (${subdomains.length} levels): "${subdomains.join('.')}".`,
      whyItMatters: 'Attackers create long chains of subdomains that mimic genuine security or login hostnames to mislead users on mobile viewports.',
      evidence: [subdomains.join('.')],
      recommendedAction: 'Inspect the root domain at the far right before the slash. That represents the actual entity hosting the page.'
    });
  }

  // 4. Protocol Security (HTTP vs HTTPS)
  if (!isHttps) {
    flaggedKeywords.push('Insecure HTTP');
    detections.push({
      category: 'URL_STRUCTURE',
      name: 'Unencrypted Transmission (HTTP)',
      severity: 'MODERATE',
      baseWeight: 12,
      whatDetected: 'URL uses plaintext unencrypted HTTP instead of HTTPS.',
      whyItMatters: 'Modern financial, employment, and authentication services strictly require TLS encryption. Plaintext portals expose all entered credentials to eavesdropping and tamper attacks.',
      evidence: [`Protocol: ${protocol}://`],
      recommendedAction: 'Never input passwords, payment details, or identification documents over plaintext HTTP.'
    });
  }

  // 5. Lookalike Brand / Phishing Heuristics
  let lookalikeTarget: string | undefined;
  for (const b of BRAND_PATTERNS) {
    if (b.pattern.test(hostname)) {
      // Check if it's the actual legitimate brand domain
      const isLegitOfficial =
        (b.name.includes('PayPal') && hostname.endsWith('paypal.com')) ||
        (b.name.includes('SBI') && (hostname.endsWith('sbi.co.in') || hostname.endsWith('onlinesbi.sbi'))) ||
        (b.name.includes('HDFC') && hostname.endsWith('hdfcbank.com')) ||
        (b.name.includes('ICICI') && hostname.endsWith('icicibank.com')) ||
        (b.name.includes('Netflix') && hostname.endsWith('netflix.com')) ||
        (b.name.includes('Amazon') && hostname.endsWith('amazon.com')) ||
        (b.name.includes('Apple') && (hostname.endsWith('apple.com') || hostname.endsWith('icloud.com'))) ||
        (b.name.includes('Google') && hostname.endsWith('google.com')) ||
        (b.name.includes('Microsoft') && (hostname.endsWith('microsoft.com') || hostname.endsWith('live.com'))) ||
        (b.name.includes('Meta') && (hostname.endsWith('whatsapp.com') || hostname.endsWith('facebook.com')));

      if (!isLegitOfficial) {
        lookalikeTarget = b.name;
        flaggedKeywords.push(`Spoofed: ${b.name}`);
        detections.push({
          category: 'IDENTITY',
          name: `Brand Impersonation (${b.name})`,
          severity: 'CRITICAL',
          baseWeight: 32,
          whatDetected: `URL hostname references recognizable brand name "${b.name}" on an unaffiliated domain: "${hostname}".`,
          whyItMatters: 'Brand typosquatting and impersonation is the hallmark of credential-harvesting phishing operations.',
          evidence: [`Pattern matched "${b.name}" in host "${hostname}"`],
          recommendedAction: `Do not enter credentials. Navigate directly to the official portal for ${b.name} via bookmark or official app.`
        });
        break;
      }
    }
  }

  // 6. Suspicious Credential / Payment keywords in path
  const suspiciousPathKeywords = [
    'login', 'verify', 'kyc', 'update-kyc', 'pan-link', 'auth', 'account-blocked',
    'security-check', 'claim-reward', 'bonus', 'wallet-connect', 'refund'
  ];
  const matchedPathKeywords = suspiciousPathKeywords.filter(k => fullPath.toLowerCase().includes(k));
  if (matchedPathKeywords.length > 0) {
    flaggedKeywords.push(...matchedPathKeywords);
    detections.push({
      category: 'FINANCIAL',
      name: 'Sensitive Auth / Financial Action Traps in Path',
      severity: 'HIGH',
      baseWeight: 14,
      whatDetected: `Path contains security-sensitive action trigger keywords: "${matchedPathKeywords.join('", "')}".`,
      whyItMatters: 'Phishing kits commonly craft urgent action paths like "/kyc-update" or "/account-blocked" to stimulate reflexive panic logins.',
      evidence: [fullPath],
      recommendedAction: 'Authenticate only through official mobile apps or verified homepage navigation.'
    });
  }

  // 7. Path entropy / Obfuscated Hex / Base64 tokens
  const longHexRegex = /[a-f0-9]{32,}/i;
  const isHighEntropyPath = fullPath.length > 60 && longHexRegex.test(fullPath);
  const entropyScore = Math.min(100, Math.round((hostname.length * 1.5 + (fullPath.length > 40 ? 30 : 10))));

  if (isHighEntropyPath) {
    flaggedKeywords.push('Obfuscated Query/Token');
    detections.push({
      category: 'URL_STRUCTURE',
      name: 'High-Entropy Obfuscated Path / Token',
      severity: 'MODERATE',
      baseWeight: 10,
      whatDetected: 'URL features unusually long tokenized or obfuscated tracking payloads.',
      whyItMatters: 'Targeted spear-phishing campaigns embed victim-specific tracking identifiers to dynamically populate pre-filled phishing templates.',
      evidence: [fullPath.length > 50 ? fullPath.slice(0, 48) + '...' : fullPath],
      recommendedAction: 'Be cautious of personalized links distributed via SMS or unsolicited email campaigns.'
    });
  }

  // 8. Open Redirect indicators
  if (/(?:redirect|return_to|dest|goto|target|url)=https?%3A/i.test(parsed.search)) {
    flaggedKeywords.push('Open Redirect Param');
    detections.push({
      category: 'URL_STRUCTURE',
      name: 'Potential Open-Redirect Exploitation',
      severity: 'HIGH',
      baseWeight: 16,
      whatDetected: 'URL query string embeds secondary outbound destination redirect parameters.',
      whyItMatters: 'Attackers exploit legitimate domain open-redirect vulnerabilities to bypass initial link scanners and bounce victims to malicious payloads.',
      evidence: [parsed.search],
      recommendedAction: 'Check the destination URL specified in the redirect parameter before authorizing.'
    });
  }

  // Realistic domain intelligence notice (Never invent domain age)
  const domainAgeStatus = 'Domain age unavailable (Live registrar query required)';
  const domainRegistrarStatus = 'External WHOIS metadata connector ready';

  return {
    detections,
    urlDetails: {
      url: sanitized,
      domain: hostname,
      tld,
      protocol: protocol.toUpperCase(),
      isHttps,
      subdomains,
      isIpAddress,
      isPunycode,
      lookalikeTarget,
      domainAgeStatus,
      domainRegistrarStatus,
      entropyScore,
      flaggedKeywords
    },
    isValid: true
  };
}
