import type {
  RiskSignal,
  ScoreBreakdownItem,
  RiskBand,
  EvidenceStrength,
  SignalCategory
} from '../../src/types.ts';

export interface EvaluatedThreatModel {
  threatScore: number;
  riskLevel: RiskBand;
  evidenceStrength: EvidenceStrength;
  headline: string;
  signals: RiskSignal[];
  scoreBreakdown: ScoreBreakdownItem[];
  compoundRiskNotes: string[];
}

export function computeThreatIndex(rawSignals: Array<Omit<RiskSignal, 'id' | 'scoreWeight'> & { baseWeight: number }>): EvaluatedThreatModel {
  if (rawSignals.length === 0) {
    return {
      threatScore: 6,
      riskLevel: 'LOW',
      evidenceStrength: 'Limited',
      headline: 'No major scam indicators detected in the available evidence.',
      signals: [],
      scoreBreakdown: [
        {
          category: 'BASELINE',
          label: 'Baseline Assessment',
          points: 6
        }
      ],
      compoundRiskNotes: []
    };
  }

  // Category tracking
  const categorySignalsMap = new Map<SignalCategory, typeof rawSignals>();
  rawSignals.forEach((sig) => {
    const list = categorySignalsMap.get(sig.category) || [];
    list.push(sig);
    categorySignalsMap.set(sig.category, list);
  });

  const breakdown: ScoreBreakdownItem[] = [];
  const processedSignals: RiskSignal[] = [];
  let rawScore = 0;

  // 1. Process Individual Signal Contributions
  rawSignals.forEach((sig, idx) => {
    const finalWeight = sig.baseWeight;
    rawScore += finalWeight;

    breakdown.push({
      category: sig.category,
      label: sig.name,
      points: finalWeight
    });

    processedSignals.push({
      id: `sig-${idx + 1}`,
      category: sig.category,
      name: sig.name,
      severity: sig.severity,
      scoreWeight: finalWeight,
      whatDetected: sig.whatDetected,
      whyItMatters: sig.whyItMatters,
      evidence: sig.evidence,
      recommendedAction: sig.recommendedAction
    });
  });

  // 2. Contextual Interaction Multipliers (Compound Risk)
  const compoundRiskNotes: string[] = [];
  const hasPayment = categorySignalsMap.has('PAYMENT');
  const hasUrgency = categorySignalsMap.has('URGENCY');
  const hasEmployment = categorySignalsMap.has('EMPLOYMENT');
  const hasIdentity = categorySignalsMap.has('IDENTITY');
  const hasFinancial = categorySignalsMap.has('FINANCIAL');
  const hasUrlStructure = categorySignalsMap.has('URL_STRUCTURE');
  const hasDomainIntel = categorySignalsMap.has('DOMAIN_INTEL');

  // Rule 2: Payment Demand + Irregular Employment / No Interview (Advance-Fee Job Scam)
  // ZERO TOLERANCE FOR UPFRONT PAYMENTS: If employment context asks for any money, force score 90-100 & CRITICAL RISK.
  const isAdvanceFeeJobScam = hasPayment && hasEmployment;
  if (isAdvanceFeeJobScam) {
    const compoundBonus = 35;
    rawScore += compoundBonus;
    breakdown.push({
      category: 'COMPOUND',
      label: 'Zero Tolerance: Advance-Fee Job Scam (Upfront Payment + Selection)',
      points: compoundBonus
    });
    compoundRiskNotes.push('ZERO TOLERANCE: Legitimate employers never demand security fees, equipment deposits, or registration charges. Demanding money for a job is a confirmed advance-fee fraud archetype.');
  }

  // Rule 1: Upfront Payment Demand + High Urgency / Time-limit
  // URGENCY PENALTY: When payment demand is combined with urgency coercion, enforce immediate CRITICAL RISK threshold.
  if (hasPayment && hasUrgency) {
    const compoundBonus = 20;
    rawScore += compoundBonus;
    breakdown.push({
      category: 'COMPOUND',
      label: 'Urgency Penalty: Payment Demand + Coercive Deadline',
      points: compoundBonus
    });
    compoundRiskNotes.push('The concurrent presence of upfront financial demand and aggressive time pressure creates a high probability of fraudulent intent designed to preempt verification.');
  }

  // Rule 3: Brand Impersonation + High-risk TLD or Insecure Transport
  if (hasIdentity && (hasUrlStructure || hasDomainIntel)) {
    const compoundBonus = 14;
    rawScore += compoundBonus;
    breakdown.push({
      category: 'COMPOUND',
      label: 'Contextual Compound: Brand Impersonation + Unofficial Host',
      points: compoundBonus
    });
    compoundRiskNotes.push('Impersonating a known banking/corporate identity while hosted on disposable TLD infrastructure is typical of credential phishing operations.');
  }

  // Rule 4: Financial Data/OTP + High Urgency
  if (hasFinancial && hasUrgency) {
    const compoundBonus = 15;
    rawScore += compoundBonus;
    breakdown.push({
      category: 'COMPOUND',
      label: 'Contextual Compound: Credential Demand + Urgent Deadline',
      points: compoundBonus
    });
    compoundRiskNotes.push('Demanding security credentials or OTPs under threat of immediate account blockage is a known social-engineering takeover pattern.');
  }

  // Clamp threat score to 0 - 100 with zero-tolerance floors
  let finalScore = Math.min(100, Math.max(5, Math.round(rawScore)));

  // Rule 1 Enforcement: If selected for job + money requested, threat score MUST BE between 90 and 100.
  if (isAdvanceFeeJobScam) {
    finalScore = Math.max(92, Math.min(98, finalScore));
  }

  // Risk band determination
  let riskLevel: RiskBand;
  let headline: string;

  // Rule 2 Enforcement: If payment demand combined with urgency coercion, classify directly as CRITICAL RISK.
  const isUrgentPaymentDemand = hasPayment && hasUrgency;

  if (finalScore >= 75 || isAdvanceFeeJobScam || isUrgentPaymentDemand) {
    riskLevel = 'CRITICAL';
    headline = 'Critical scam risk detected: Confirmed advance-fee or high-pressure fraud vectors.';
  } else if (finalScore >= 50) {
    riskLevel = 'HIGH';
    headline = 'High-risk scam indicators detected.';
  } else if (finalScore >= 25) {
    riskLevel = 'MODERATE';
    headline = 'Moderate risk indicators detected. Caution advised.';
  } else {
    riskLevel = 'LOW';
    headline = 'No major scam indicators were detected in the available evidence.';
  }

  // Evidence Strength
  const uniqueCategoriesCount = categorySignalsMap.size;
  let evidenceStrength: EvidenceStrength;
  if (uniqueCategoriesCount >= 3 || processedSignals.length >= 4 || compoundRiskNotes.length >= 1) {
    evidenceStrength = 'Strong';
  } else if (uniqueCategoriesCount >= 2 || processedSignals.length >= 2) {
    evidenceStrength = 'Moderate';
  } else {
    evidenceStrength = 'Limited';
  }

  return {
    threatScore: finalScore,
    riskLevel,
    evidenceStrength,
    headline,
    signals: processedSignals,
    scoreBreakdown: breakdown,
    compoundRiskNotes
  };
}
