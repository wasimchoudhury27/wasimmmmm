import type { AnalysisResult, RiskSignal, SignalSeverity } from '../types.ts';

export interface ThreatCategoryData {
  id: string;
  name: string; // e.g. 'Phishing', 'Brand Impersonation', 'Urgency Manipulation'
  shortLabel: string;
  description: string;
  severity: SignalSeverity;
  score: number; // accumulated points / weight
  percentage: number; // 0-100 visual progress intensity
  signalCount: number;
  indicators: string[]; // specific observable clues
  defensiveAction: string;
  signals: RiskSignal[];
}

export interface ThreatCategorySummary {
  categories: ThreatCategoryData[];
  totalThreatPoints: number;
  dominantCategory: ThreatCategoryData | null;
  surfaceScore: number;
}

/**
 * Derives normalized threat categories identified across all observable signals,
 * URL telemetry, and extracted metadata.
 */
export function deriveThreatCategories(result: AnalysisResult): ThreatCategorySummary {
  const categoryMap = new Map<string, ThreatCategoryData>();

  // Helper to ensure or update a category
  const addIndicatorToCategory = (
    id: string,
    name: string,
    shortLabel: string,
    description: string,
    defensiveAction: string,
    severity: SignalSeverity,
    weight: number,
    indicatorText?: string,
    signal?: RiskSignal
  ) => {
    let cat = categoryMap.get(id);
    if (!cat) {
      cat = {
        id,
        name,
        shortLabel,
        description,
        severity,
        score: 0,
        percentage: 0,
        signalCount: 0,
        indicators: [],
        defensiveAction,
        signals: []
      };
      categoryMap.set(id, cat);
    }

    cat.score += weight;
    cat.signalCount += 1;

    // Elevate severity if higher
    const severityHierarchy: Record<SignalSeverity, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MODERATE: 2,
      LOW: 1
    };
    if (severityHierarchy[severity] > severityHierarchy[cat.severity]) {
      cat.severity = severity;
    }

    if (indicatorText && !cat.indicators.includes(indicatorText)) {
      cat.indicators.push(indicatorText);
    }

    if (signal && !cat.signals.some((s) => s.id === signal.id)) {
      cat.signals.push(signal);
    }
  };

  // 1. Process explicit RiskSignals
  result.signals.forEach((sig) => {
    const sigCategory = sig.category;
    const nameLower = sig.name.toLowerCase();
    const whatLower = sig.whatDetected.toLowerCase();
    const evidenceText = sig.evidence.join(' ').toLowerCase();

    // A. Phishing
    if (
      sigCategory === 'URL_STRUCTURE' ||
      nameLower.includes('phishing') ||
      nameLower.includes('embedded link') ||
      whatLower.includes('redirection') ||
      whatLower.includes('phishing') ||
      whatLower.includes('login') ||
      whatLower.includes('verify')
    ) {
      addIndicatorToCategory(
        'phishing',
        'Phishing',
        'Phishing Traps',
        'Deceptive links, fraudulent credential harvesting forms, or suspicious redirects attempting to hijack accounts.',
        'Never submit credentials or OTPs on unvetted URLs. Access account portals only via official bookmarks.',
        sig.severity,
        sig.scoreWeight,
        sig.evidence[0] || sig.name,
        sig
      );
    }

    // B. Brand Impersonation
    if (
      sigCategory === 'IDENTITY' ||
      nameLower.includes('impersonat') ||
      nameLower.includes('lookalike') ||
      nameLower.includes('spoofed') ||
      nameLower.includes('recruiter identity') ||
      whatLower.includes('generic public mailbox') ||
      whatLower.includes('impersonat') ||
      evidenceText.includes('gmail.com') ||
      evidenceText.includes('yahoo.com')
    ) {
      addIndicatorToCategory(
        'brand_impersonation',
        'Brand Impersonation',
        'Brand Spoofing',
        'Falsely presenting as an authentic brand, bank, government agency, or corporate recruiter using lookalike identifiers.',
        'Independently contact the alleged company through official directory listings or certified LinkedIn staff directory.',
        sig.severity,
        sig.scoreWeight,
        sig.evidence[0] || sig.name,
        sig
      );
    }

    // C. Urgency Manipulation
    if (
      sigCategory === 'URGENCY' ||
      nameLower.includes('urgency') ||
      nameLower.includes('pressure') ||
      nameLower.includes('deadline') ||
      whatLower.includes('time-pressure') ||
      whatLower.includes('expires') ||
      whatLower.includes('within')
    ) {
      addIndicatorToCategory(
        'urgency_manipulation',
        'Urgency Manipulation',
        'Time Pressure',
        'Manufactured deadlines and psychological pressure designed to rush victims into hurried financial or credential decisions.',
        'Pause and step back. Legitimate institutions and employers always grant time for independent verification.',
        sig.severity,
        sig.scoreWeight,
        sig.evidence[0] || sig.name,
        sig
      );
    }

    // D. Upfront Payment / Advance Fee
    if (
      sigCategory === 'PAYMENT' ||
      nameLower.includes('payment') ||
      nameLower.includes('deposit') ||
      nameLower.includes('fee') ||
      whatLower.includes('payment') ||
      whatLower.includes('gate pass') ||
      whatLower.includes('upi') ||
      whatLower.includes('crypto')
    ) {
      addIndicatorToCategory(
        'payment_fraud',
        'Upfront Payment Demand',
        'Payment Demand',
        'Demands for prepaid security deposits, equipment fees, gate pass tokens, registration fees, or untraceable transfers.',
        'Halt any money transfer. Genuine job offers, rentals, and official transactions never mandate advance wire/UPI deposits.',
        sig.severity,
        sig.scoreWeight,
        sig.evidence[0] || sig.name,
        sig
      );
    }

    // E. Employment & Recruitment Fraud
    if (
      sigCategory === 'EMPLOYMENT' ||
      nameLower.includes('recruitment') ||
      nameLower.includes('job offer') ||
      nameLower.includes('employment') ||
      whatLower.includes('without interview') ||
      whatLower.includes('salary')
    ) {
      addIndicatorToCategory(
        'employment_fraud',
        'Employment & Task Scam',
        'Fake Recruitment',
        'Fictitious job selections without interviews, unrealistic flexible salaries, or task-based chat platform recruitment.',
        'Cross-check job openings on the official corporate careers portal. Authentic recruiters never recruit exclusively via anonymous chat.',
        sig.severity,
        sig.scoreWeight,
        sig.evidence[0] || sig.name,
        sig
      );
    }

    // F. Credential & Financial Exfiltration
    if (
      sigCategory === 'FINANCIAL' ||
      nameLower.includes('sensitive') ||
      nameLower.includes('credential') ||
      whatLower.includes('otp') ||
      whatLower.includes('pin') ||
      whatLower.includes('remote access') ||
      whatLower.includes('anydesk')
    ) {
      addIndicatorToCategory(
        'credential_harvesting',
        'Credential Harvesting',
        'Data Exfiltration',
        'Explicit requests for one-time passwords, net-banking passwords, CVV codes, or remote desktop screen-sharing utilities.',
        'Never share OTPs or install remote access software (AnyDesk, TeamViewer) under guidance from unverified callers.',
        sig.severity,
        sig.scoreWeight,
        sig.evidence[0] || sig.name,
        sig
      );
    }

    // G. Social Engineering & Coercion
    if (
      sigCategory === 'SOCIAL_ENG' ||
      nameLower.includes('social engineering') ||
      nameLower.includes('coercion') ||
      whatLower.includes('secrecy') ||
      whatLower.includes('confidential') ||
      whatLower.includes('legal action') ||
      whatLower.includes('police')
    ) {
      addIndicatorToCategory(
        'social_engineering',
        'Social Engineering & Coercion',
        'Coercion Tactic',
        'Manipulation tactics including confidentiality mandates, threats of legal prosecution, or deceptive prize announcements.',
        'Do not succumb to intimidation or forced secrecy. Consult trusted advisors or law enforcement immediately.',
        sig.severity,
        sig.scoreWeight,
        sig.evidence[0] || sig.name,
        sig
      );
    }

    // H. Infrastructure Anomalies
    if (
      sigCategory === 'DOMAIN_INTEL' ||
      nameLower.includes('domain') ||
      nameLower.includes('infrastructure') ||
      nameLower.includes('registrar')
    ) {
      addIndicatorToCategory(
        'infrastructure_anomalies',
        'Suspicious Infrastructure',
        'Domain Anomalies',
        'Disposable server hosting, newly registered domain names, high entropy strings, or unencrypted data channels.',
        'Avoid visiting or authenticating against newly provisioned or disposable domain infrastructure.',
        sig.severity,
        sig.scoreWeight,
        sig.evidence[0] || sig.name,
        sig
      );
    }
  });

  // 2. Correlate URL Details specifically if available
  if (result.urlDetails) {
    const details = result.urlDetails;

    // Lookalike brand target
    if (details.lookalikeTarget) {
      addIndicatorToCategory(
        'brand_impersonation',
        'Brand Impersonation',
        'Brand Spoofing',
        `Targeting brand identity of ${details.lookalikeTarget} with typosquatted domain structure.`,
        `Navigate directly to official ${details.lookalikeTarget} address instead of clicking this link.`,
        'CRITICAL',
        22,
        `Lookalike target detected: ${details.lookalikeTarget}`
      );
    }

    // Phishing keywords in URL
    if (details.flaggedKeywords && details.flaggedKeywords.length > 0) {
      addIndicatorToCategory(
        'phishing',
        'Phishing',
        'Phishing Traps',
        `Contains suspicious authentication cues in URL (${details.flaggedKeywords.join(', ')}).`,
        'Never submit login credentials or card numbers on links received via SMS, email, or chat.',
        details.flaggedKeywords.some((k) => ['login', 'kyc', 'verify', 'update'].includes(k.toLowerCase()))
          ? 'HIGH'
          : 'MODERATE',
        16,
        `URL Keywords: ${details.flaggedKeywords.slice(0, 3).join(', ')}`
      );
    }

    // High risk domain age or IP address
    if (details.isIpAddress || details.isPunycode || details.domainAgeStatus === 'CRITICAL_NEW') {
      addIndicatorToCategory(
        'infrastructure_anomalies',
        'Suspicious Infrastructure',
        'Domain Anomalies',
        'Host operates on bare IP address or newly provisioned disposable registration.',
        'Halt interaction with unvetted domain registrar infrastructure.',
        'HIGH',
        14,
        details.isIpAddress ? 'Bare IP Address Host' : details.domainAgeStatus
      );
    }
  }

  // 3. Fallback: If threat score is elevated but no category matched yet, deduce from input snippet / entities
  if (categoryMap.size === 0 && result.threatScore >= 25) {
    const rawLower = (result.rawInputText || result.inputSnippet || '').toLowerCase();

    if (rawLower.includes('phish') || rawLower.includes('login') || rawLower.includes('verify link')) {
      addIndicatorToCategory(
        'phishing',
        'Phishing',
        'Phishing Traps',
        'Deceptive link structure attempting credential capture.',
        'Do not click embedded links or reveal login credentials.',
        'HIGH',
        18,
        'Suspicious portal pattern'
      );
    }

    if (rawLower.includes('urgent') || rawLower.includes('immediately') || rawLower.includes('today')) {
      addIndicatorToCategory(
        'urgency_manipulation',
        'Urgency Manipulation',
        'Time Pressure',
        'Artificially compressed deadline forcing immediate compliance.',
        'Take time to independently verify claims before reacting.',
        'MODERATE',
        12,
        'Artificial time pressure'
      );
    }

    if (result.extractedEntities.claimedOrg) {
      addIndicatorToCategory(
        'brand_impersonation',
        'Brand Impersonation',
        'Brand Spoofing',
        `Unverified entity claiming to represent ${result.extractedEntities.claimedOrg}.`,
        'Verify representative identity through official corporate telephone switchboard.',
        'MODERATE',
        14,
        `Claimed Entity: ${result.extractedEntities.claimedOrg}`
      );
    }
  }

  // Calculate percentages and sort
  const categoriesList = Array.from(categoryMap.values());
  const maxPossibleCategoryWeight = Math.max(1, ...categoriesList.map((c) => c.score));

  categoriesList.forEach((cat) => {
    // Calibrate percentage relative to threat score and category weight (capped between 25% and 100% when active)
    const baseProportion = (cat.score / maxPossibleCategoryWeight) * 100;
    const scoreFactor = Math.min(100, Math.max(25, (result.threatScore * 0.6) + (baseProportion * 0.4)));
    cat.percentage = Math.round(Math.min(100, Math.max(20, scoreFactor)));
  });

  const severityOrder: Record<SignalSeverity, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MODERATE: 2,
    LOW: 1
  };

  categoriesList.sort((a, b) => {
    const diff = severityOrder[b.severity] - severityOrder[a.severity];
    if (diff !== 0) return diff;
    return b.score - a.score;
  });

  const totalPoints = categoriesList.reduce((acc, c) => acc + c.score, 0);
  const dominantCategory = categoriesList.length > 0 ? categoriesList[0] : null;

  return {
    categories: categoriesList,
    totalThreatPoints: totalPoints,
    dominantCategory,
    surfaceScore: result.threatScore
  };
}
