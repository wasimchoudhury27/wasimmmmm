export type RiskBand = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type EvidenceStrength = 'Strong' | 'Moderate' | 'Limited';

export type SignalCategory =
  | 'PAYMENT'
  | 'URGENCY'
  | 'EMPLOYMENT'
  | 'IDENTITY'
  | 'FINANCIAL'
  | 'SOCIAL_ENG'
  | 'URL_STRUCTURE'
  | 'DOMAIN_INTEL';

export type SignalSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RiskSignal {
  id: string;
  category: SignalCategory;
  name: string;
  severity: SignalSeverity;
  scoreWeight: number;
  whatDetected: string;
  whyItMatters: string;
  evidence: string[];
  recommendedAction: string;
}

export interface ScoreBreakdownItem {
  category: string;
  label: string;
  points: number;
}

export interface ExtractedEntities {
  paymentsDetected?: string[];
  amounts?: string[];
  contacts?: string[];
  links?: string[];
  claimedOrg?: string;
}

export interface UrlDetails {
  url: string;
  domain: string;
  tld: string;
  protocol: string;
  isHttps: boolean;
  subdomains: string[];
  isIpAddress: boolean;
  isPunycode: boolean;
  lookalikeTarget?: string;
  domainAgeStatus: string;
  domainRegistrarStatus: string;
  entropyScore: number;
  flaggedKeywords: string[];
}

export interface ScanStage {
  id: string;
  stepNumber: string;
  label: string;
  detail: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

export interface ScamOriginNode {
  id: string;
  region: 'Asia-Pacific' | 'Americas' | 'Europe & Middle East' | 'Africa' | 'Global';
  country: string;
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
  patternType: string;
  hubType: 'Syndicate Call Hub' | 'Bulletproof Server Farm' | 'Mule Account Network' | 'SMS Gateway' | 'Phishing Reverse-Proxy' | 'Crypto Siphon Desk';
  incidentCount: number;
  severity: SignalSeverity;
  confidenceScore: number; // 0 - 100
  primaryPaymentRail: string;
  infrastructureAsn?: string;
  description: string;
  correlatedSignals: string[];
  historicalLossEstimate: string;
  recentIncidentDate: string;
}

export interface OriginArc {
  id: string;
  sourceId: string;
  targetId: string;
  sourceCoords: [number, number]; // [lon, lat]
  targetCoords: [number, number]; // [lon, lat]
  label: string;
  transitType: 'Victim Targeting' | 'Wire Siphon' | 'Command & Control Relay' | 'Mule Laundering';
}

export interface GeographicIntelligence {
  activePatternCluster: string;
  patternSignature: string;
  totalRelatedIncidents: number;
  estimatedGlobalImpact: string;
  primaryJurisdictions: string[];
  topVectors: string[];
  nodes: ScamOriginNode[];
  arcs: OriginArc[];
  analystSummary: string;
  advisoryLevel: 'INTERPOL PURPLE NOTICE' | 'CERT-IN HIGH ADVISORY' | 'IC3 CRITICAL ALERT' | 'ELEVATED REGIONAL TELEMETRY' | 'MONITORING PATTERNS';
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  inputType: 'message' | 'url' | 'document_image';
  inputSnippet: string;
  rawInputText?: string;
  threatScore: number; // 0 - 100
  riskLevel: RiskBand;
  evidenceStrength: EvidenceStrength;
  headline: string;
  summary: string;
  primaryQuote?: string;
  whyThisScore: string;
  signals: RiskSignal[];
  scoreBreakdown: ScoreBreakdownItem[];
  recommendedActions: string[];
  extractedEntities: ExtractedEntities;
  urlDetails?: UrlDetails;
  geographicIntelligence?: GeographicIntelligence;
  aiAssisted: boolean;
}

export interface DemoScenario {
  id: string;
  title: string;
  category: string;
  type: 'message' | 'url';
  label: string;
  description: string;
  content: string;
}
