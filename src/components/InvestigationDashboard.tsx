import React from 'react';
import { AnalysisResult } from '../types.js';
import { VerdictHeader } from './VerdictHeader.js';
import { ThreatCategoryBreakdown } from './ThreatCategoryBreakdown.js';
import { ThreatTimeline } from './ThreatTimeline.js';
import { EvidenceTimeline } from './EvidenceTimeline.js';
import { AiAssessmentPanel } from './AiAssessmentPanel.js';
import { ActionCenter } from './ActionCenter.js';
import { UrlDetailsCard } from './UrlDetailsCard.js';
import { ScoreBreakdown } from './ScoreBreakdown.js';
import { GeographicThreatMap } from './GeographicThreatMap.js';
import { FixedDisclaimer } from './FixedDisclaimer.js';
import { generateGeographicIntelligence } from '../utils/geoIntelligence.js';
import { motion } from 'motion/react';

interface InvestigationDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const InvestigationDashboard: React.FC<InvestigationDashboardProps> = ({
  result,
  onReset
}) => {
  const geoData =
    result.geographicIntelligence ||
    generateGeographicIntelligence({
      threatScore: result.threatScore,
      riskLevel: result.riskLevel,
      inputType: result.inputType,
      signals: result.signals,
      extractedEntities: result.extractedEntities,
      urlDetails: result.urlDetails,
      rawText: result.rawInputText || result.inputSnippet
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-10 pb-28"
    >
      {/* 1. Verdict & Signature AI Investigation Ring */}
      <VerdictHeader result={result} onReset={onReset} />

      {/* 2. Visual Threat Category Breakdown (Progress Bars & Tag List: Phishing, Impersonation, Urgency) */}
      <ThreatCategoryBreakdown result={result} />

      {/* 3. Chronological Threat Timeline (Input Text Analysis Sequence) */}
      <ThreatTimeline result={result} />

      {/* 3. URL & Domain Intelligence (if target has URL details) */}
      {result.urlDetails && (
        <UrlDetailsCard details={result.urlDetails} />
      )}

      {/* 4. Geographic Visualization: Where Similar Scam Patterns Originate (D3 Cartography) */}
      <GeographicThreatMap geoData={geoData} />

      {/* 5. "WHY SCAMSHIELD FLAGGED THIS" — Forensic Evidence Timeline */}
      <EvidenceTimeline signals={result.signals} />

      {/* 6. "SCAMSHIELD'S ASSESSMENT" — Plain Language Breakdown */}
      <AiAssessmentPanel result={result} />

      {/* 7. "WHAT SHOULD YOU DO NOW?" — Defensive Action Protocol */}
      <ActionCenter result={result} onReset={onReset} />

      {/* 8. Deterministic Score Breakdown */}
      <ScoreBreakdown
        breakdown={result.scoreBreakdown}
        totalScore={result.threatScore}
      />

      {/* Fixed bottom assessment notice */}
      <FixedDisclaimer />
    </motion.div>
  );
};

