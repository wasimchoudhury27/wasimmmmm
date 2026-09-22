import type { RiskSignal, ExtractedEntities } from '../../src/types.ts';

interface RawDetection {
  category: RiskSignal['category'];
  name: string;
  severity: RiskSignal['severity'];
  baseWeight: number;
  whatDetected: string;
  whyItMatters: string;
  evidence: string[];
  recommendedAction: string;
}

export interface MessageAnalysisOutput {
  detections: RawDetection[];
  extractedEntities: ExtractedEntities;
  detectedCategories: Set<string>;
}

export function analyzeMessageText(text: string): MessageAnalysisOutput {
  const detections: RawDetection[] = [];
  const normalized = text.toLowerCase();
  const detectedCategories = new Set<string>();

  // 1. Entity Extraction: Amounts, Contacts, Orgs
  const currencyRegex = /(?:₹|rs\.?|inr|\$|usd|eur|€|£)\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)/gi;
  const amountsFound: string[] = [];
  let currMatch;
  while ((currMatch = currencyRegex.exec(text)) !== null) {
    amountsFound.push(currMatch[0]);
  }

  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const contactsFound: string[] = text.match(phoneRegex) || [];

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailsFound: string[] = text.match(emailRegex) || [];

  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const linksFound: string[] = text.match(urlRegex) || [];

  // Claimed organization hint
  let claimedOrg: string | undefined;
  const orgMatch = text.match(/(?:at|for|from|with|company:?|organization:?)\s+([A-Z][A-Za-z0-9&.\s]{2,25}(?:ltd|inc|corp|technologies|solutions|services|pvt)?)/i);
  if (orgMatch && orgMatch[1]) {
    claimedOrg = orgMatch[1].trim();
  }

  // --- A. PAYMENT DEMAND SIGNALS ---
  const paymentKeywords = [
    { pattern: /(?:security\s*fee)/i, label: 'Security Fee Demand' },
    { pattern: /(?:refundable(?:\s*security)?\s*deposit)/i, label: 'Refundable Security Deposit' },
    { pattern: /(?:joining\s*kit)/i, label: 'Joining Kit Demand' },
    { pattern: /(?:processing\s*fee)/i, label: 'Processing Fee Demand' },
    { pattern: /(?:laptop\s*deposit)/i, label: 'Laptop Deposit Demand' },
    { pattern: /(?:registration|register)\s*(?:fee|charges?|amount|cost|payment)/i, label: 'Registration Fee Demand' },
    { pattern: /(?:security|caution)\s*(?:deposit|fee|amount|charges?|money)/i, label: 'Security Deposit Demand' },
    { pattern: /(?:refundable)/i, label: 'Refundable Advance Bait' },
    { pattern: /(?:deposit)/i, label: 'Deposit Demand' },
    { pattern: /(?:equipment|laptop|asset|hardware|kit)\s*(?:fee|cost|charge|deposit|payment|dispatch\s*charge)/i, label: 'Equipment / Asset Fee' },
    { pattern: /(?:procure|order|requisition|checkout)\s*(?:equipment|laptop|workstation|hardware|software|device|tools?|kit)?\s*(?:from|via|through)?\s*(?:our|the|an)?\s*(?:authorized\s*vendor|it\s*partner|vendor\s*portal|portal|link)/i, label: 'Vendor Procurement Trap' },
    { pattern: /(?:allowance|reimburse(?:ment)?|sign[\s-]on\s*bonus|stipend)\b.*?\b(?:spend|buy|purchase|procure|pay|own\s*money|checkout|first)/i, label: 'Illusion of Allowance Trap' },
    { pattern: /(?:spend|buy|purchase|procure|checkout|cover\s*(?:the\s*)?cost)\b.*?\b(?:allowance|reimburse(?:ment)?|refund|sign[\s-]on\s*bonus)/i, label: 'Illusion of Allowance / Reimbursement' },
    { pattern: /(?:vpn|credentials|login|payroll|onboarding|activation|appointment)\s*(?:conditional|requires?|dependent|activated\s*after|upon\s*(?:purchase|order|checkout|procuring))/i, label: 'Conditional Onboarding Purchase Trap' },
    { pattern: /(?:checkout|procure|cover\s*(?:the\s*)?cost|purchase\s*via\s*(?:our|the)?\s*portal|order\s*from\s*(?:our)?\s*(?:authorized\s*)?vendor)/i, label: 'Implicit Payment / Procurement Demand' },
    { pattern: /(?:processing|documentation|verification|file|application)\s*(?:fee|charges?|amount)/i, label: 'Processing / Verification Fee' },
    { pattern: /(?:training|induction|onboarding|course)\s*(?:fee|charge|cost|amount)/i, label: 'Training / Induction Fee' },
    { pattern: /(?:advance|upfront|token|booking)\s*(?:payment|money|amount|deposit)/i, label: 'Advance / Token Payment' },
    { pattern: /(?:pay\s*(?:before|prior\s*to)\s*(?:joining|interview|visit|flat|inspection|appointment))/i, label: 'Pay Before Joining / Visiting' },
    { pattern: /(?:upi|gpay|google\s*pay|phonepe|paytm|qr\s*code|scan\s*to\s*pay)/i, label: 'Instant Digital Payment (UPI/QR)' },
    { pattern: /(?:cryptocurrency|crypto|bitcoin|usdt|binance|gift\s*card|amazon\s*pay\s*card)/i, label: 'Unconventional / Irreversible Payment' },
    { pattern: /(?:send|transfer|deposit)\s*(?:money|funds|cash|amount|rs|₹|\$)/i, label: 'Direct Fund Transfer Request' },
    { pattern: /(?:gate\s*pass|visiting\s*card|inspection\s*token)\s*(?:fee|deposit|charges?)/i, label: 'Gate Pass / Visit Deposit' }
  ];

  const matchedPaymentEvidence: string[] = [];
  paymentKeywords.forEach((kw) => {
    const m = text.match(kw.pattern);
    if (m) {
      matchedPaymentEvidence.push(m[0]);
    }
  });

  if (matchedPaymentEvidence.length > 0) {
    const isCritical = matchedPaymentEvidence.some(e =>
      /crypto|gift\s*card|pay\s*before\s*joining|advance|equipment|gate\s*pass|vendor|procure|allowance|reimburse|checkout/i.test(e)
    );
    const severity: RiskSignal['severity'] = isCritical ? 'CRITICAL' : 'HIGH';
    detectedCategories.add('PAYMENT');
    detections.push({
      category: 'PAYMENT',
      name: 'Upfront Payment or Deposit Demand',
      severity,
      baseWeight: isCritical ? 32 : 24,
      whatDetected: `Detected direct payment requests: "${matchedPaymentEvidence.slice(0, 3).join('", "')}"${amountsFound.length > 0 ? ` with requested amounts: ${amountsFound.slice(0, 2).join(', ')}` : ''}.`,
      whyItMatters: 'Legitimate employers, authentic landlords, and official institutions do not charge applicants onboarding fees, equipment fees, or unverified upfront visit deposits.',
      evidence: matchedPaymentEvidence.slice(0, 4),
      recommendedAction: 'Do not transfer any money. Authentic corporate recruitment and legitimate tenancy visits never require prepaid security or gate passes.'
    });
  }

  // --- B. URGENCY & PSYCHOLOGICAL PRESSURE ---
  const urgencyKeywords = [
    { pattern: /(?:immediate|instant)\s*(?:joining|joining\s*letter|start|appointment)/i, label: 'Immediate Joining Pressure' },
    { pattern: /(?:within\s*(?:[0-9]+|one|two|three|24|12|2|1)\s*(?:hours?|hrs?|mins?|minutes?))/i, label: 'Strict Artificial Deadline' },
    { pattern: /(?:limited\s*(?:seats|vacancies|slots|flats?|offers?)|only\s*[0-9]+\s*left)/i, label: 'Artificial Scarcity' },
    { pattern: /(?:offer\s*expires\s*today|valid\s*only\s*today|last\s*(?:day|chance|date|call))/i, label: 'Immediate Offer Expiration' },
    { pattern: /(?:act\s*now|urgent|urgently|strictly\s*urgent|respond\s*immediately)/i, label: 'Urgent Action Coercion' },
    { pattern: /(?:first\s*come\s*first\s*serve|hurry\s*up)/i, label: 'High Urgency Cue' }
  ];

  const matchedUrgencyEvidence: string[] = [];
  urgencyKeywords.forEach((kw) => {
    const m = text.match(kw.pattern);
    if (m) matchedUrgencyEvidence.push(m[0]);
  });

  if (matchedUrgencyEvidence.length > 0) {
    detectedCategories.add('URGENCY');
    const isCritical = matchedUrgencyEvidence.length >= 2 || /(?:within\s*[0-9]+\s*hours?|expires\s*today)/i.test(matchedUrgencyEvidence.join(' '));
    detections.push({
      category: 'URGENCY',
      name: 'Psychological Urgency & Pressure',
      severity: isCritical ? 'HIGH' : 'MODERATE',
      baseWeight: isCritical ? 16 : 10,
      whatDetected: `Detected time-pressure language: "${matchedUrgencyEvidence.slice(0, 3).join('", "')}".`,
      whyItMatters: 'Scammers deliberately shorten the window of evaluation to provoke hurried emotional decisions before the recipient can consult friends or verify credentials.',
      evidence: matchedUrgencyEvidence.slice(0, 4),
      recommendedAction: 'Take a step back. Legitimate hiring processes and contractual lease discussions always permit independent review without severe time ultimatums.'
    });
  }

  // --- C. EMPLOYMENT & RECRUITMENT RED FLAGS ---
  const employmentKeywords = [
    { pattern: /(?:selected|hired|appointment\s*letter|job\s*offer|offer\s*of\s*employment|confirm\s*your\s*employment|candidate|role\s*of|starting\s*salary)/i, label: 'Job Offer / Selection Claim' },
    { pattern: /(?:without\s*(?:any\s*)?(?:interview|test|screening|assessment)|no\s*interview)/i, label: 'Selected Without Interview' },
    { pattern: /(?:direct\s*selection|direct\s*appointment|auto-selected)/i, label: 'Direct Unvetted Selection' },
    { pattern: /(?:guaranteed\s*job|100%\s*placement|guaranteed\s*income)/i, label: 'Guaranteed Employment Claim' },
    { pattern: /(?:part[\s-]time|work[\s-]from[\s-]home|wfh)\s*(?:earn\s*(?:₹|\$|[0-9]{3,})|daily\s*payout|weekly\s*payout)/i, label: 'Unrealistic Flexible Income' },
    { pattern: /(?:telegram|whatsapp)\s*(?:only|hr|coordinator|manager|task)/i, label: 'Chat-App Exclusive Hiring' },
    { pattern: /(?:salary|package|ctc)\s*(?:of|is|:)?\s*(?:₹|rs\.?|inr|\$)\s*[0-9]{2,3},[0-9]{3}/i, label: 'Salary Offer Quote' },
    { pattern: /(?:typing\s*work|data\s*entry|captcha\s*solving|sms\s*sending)\s*(?:job|earn)/i, label: 'High-Scam Task Archetype (Data/Typing)' }
  ];

  const matchedEmploymentEvidence: string[] = [];
  employmentKeywords.forEach((kw) => {
    const m = text.match(kw.pattern);
    if (m) matchedEmploymentEvidence.push(m[0]);
  });

  if (matchedEmploymentEvidence.length > 0) {
    detectedCategories.add('EMPLOYMENT');
    const isCritical = matchedEmploymentEvidence.some(e => /without\s*interview|telegram|whatsapp|guaranteed/i.test(e));
    detections.push({
      category: 'EMPLOYMENT',
      name: 'Unrealistic Recruitment Process',
      severity: isCritical ? 'HIGH' : 'MODERATE',
      baseWeight: isCritical ? 20 : 12,
      whatDetected: `Detected employment anomalies: "${matchedEmploymentEvidence.slice(0, 3).join('", "')}".`,
      whyItMatters: 'Authentic companies never offer formal employment or high-salary roles without rigorous identity verification, interviews, and official corporate portal tracking.',
      evidence: matchedEmploymentEvidence.slice(0, 4),
      recommendedAction: 'Verify through official corporate channels. Search the company careers portal independently and do not communicate strictly on messaging apps.'
    });
  }

  // --- D. IDENTITY & REPUTATION INCONSISTENCIES ---
  const genericEmailDomains = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com', '@rediffmail.com', '@proton.me', '@yandex.com'];
  const hasGenericEmail = emailsFound.some((email) =>
    genericEmailDomains.some((dom) => email.toLowerCase().endsWith(dom))
  );

  const matchedIdentityEvidence: string[] = [];
  if (hasGenericEmail && (claimedOrg || /hr|recruitment|company|hiring|officer/i.test(text))) {
    const genericEmail = emailsFound.find(email => genericEmailDomains.some(dom => email.toLowerCase().endsWith(dom)));
    matchedIdentityEvidence.push(`Generic public mailbox: ${genericEmail}`);
  }

  if (/(?:official\s*hr\s*on\s*whatsapp|contact\s*hr\s*via\s*telegram|inbox\s*me\s*personally)/i.test(text)) {
    matchedIdentityEvidence.push('Official recruitment redirected to personal messaging app');
  }

  if (matchedIdentityEvidence.length > 0) {
    detectedCategories.add('IDENTITY');
    detections.push({
      category: 'IDENTITY',
      name: 'Suspicious Recruiter Identity / Channel',
      severity: 'HIGH',
      baseWeight: 14,
      whatDetected: `Detected unverified identity indicators: ${matchedIdentityEvidence.join('; ')}.`,
      whyItMatters: 'Reputable corporate talent acquisition teams communicate from proprietary domain addresses (@company.com), not free consumer webmail or anonymous chat channels.',
      evidence: matchedIdentityEvidence,
      recommendedAction: 'Contact the alleged employer via their verified LinkedIn page or verified switchboard telephone to confirm the recruiter exists.'
    });
  }

  // --- E. FINANCIAL & SENSITIVE DATA EXFILTRATION ---
  const sensitiveKeywords = [
    { pattern: /(?:otp|one\s*time\s*password|verification\s*code)/i, label: 'OTP / Security Code Request' },
    { pattern: /(?:net\s*banking|internet\s*banking)\s*(?:password|pin|credentials)/i, label: 'Banking Credentials Request' },
    { pattern: /(?:cvv|card\s*number|expiry\s*date|atm\s*pin)/i, label: 'Payment Card Details Request' },
    { pattern: /(?:aadhaar|pan\s*card|passport|id\s*proof)\s*(?:front\s*and\s*back|photo\s*copy|share|send\s*immediately)/i, label: 'Unverified ID Document Harvesting' },
    { pattern: /(?:anydesk|teamviewer|rustdesk|quicksupport|screen\s*share)/i, label: 'Remote Access Tool Installation' }
  ];

  const matchedSensitiveEvidence: string[] = [];
  sensitiveKeywords.forEach((kw) => {
    const m = text.match(kw.pattern);
    if (m) {
      matchedSensitiveEvidence.push(m[0]);
    }
  });

  if (matchedSensitiveEvidence.length > 0) {
    const isCritical = matchedSensitiveEvidence.some(e =>
      /otp|pin|password|cvv|anydesk|teamviewer/i.test(e)
    );
    const severity: RiskSignal['severity'] = isCritical ? 'CRITICAL' : 'HIGH';
    detectedCategories.add('FINANCIAL');
    detections.push({
      category: 'FINANCIAL',
      name: 'Sensitive Financial / Access Request',
      severity,
      baseWeight: isCritical ? 30 : 18,
      whatDetected: `Detected demand for confidential information: "${matchedSensitiveEvidence.slice(0, 3).join('", "')}".`,
      whyItMatters: 'Demands for OTPs, CVVs, screen-sharing apps, or direct remote desktop software allow attackers to siphon funds or compromise accounts instantly.',
      evidence: matchedSensitiveEvidence,
      recommendedAction: 'NEVER reveal OTPs, PINs, or install remote access software (AnyDesk/TeamViewer) requested by third parties.'
    });
  }

  // --- F. SOCIAL ENGINEERING / PSYCHOLOGICAL MANIPULATION ---
  const socialEngKeywords = [
    { pattern: /(?:do\s*not\s*disclose|keep\s*(?:it\s*)?confidential|secret\s*process|do\s*not\s*tell\s*anyone)/i, label: 'Secrecy & Isolation Tactic' },
    { pattern: /(?:legal\s*action|police\s*complaint|arrest\s*warrant|penalty|fine\s*imposed|court\s*order)/i, label: 'Threat of Legal Action / Intimidation' },
    { pattern: /(?:lottery|lucky\s*draw|won\s*(?:prize|cash|car|iphone|crore))/i, label: 'Unsolicited Prize / Reward Bait' },
    { pattern: /(?:refundable\s*(?:in\s*10\s*minutes|instantly|with\s*first\s*salary|100%\s*guaranteed))/i, label: 'Deceptive Refund Guarantee' }
  ];

  const matchedSocialEvidence: string[] = [];
  socialEngKeywords.forEach((kw) => {
    const m = text.match(kw.pattern);
    if (m) matchedSocialEvidence.push(m[0]);
  });

  if (matchedSocialEvidence.length > 0) {
    detectedCategories.add('SOCIAL_ENG');
    detections.push({
      category: 'SOCIAL_ENG',
      name: 'Social Engineering & Coercion Tactic',
      severity: 'HIGH',
      baseWeight: 14,
      whatDetected: `Detected manipulation tactics: "${matchedSocialEvidence.slice(0, 3).join('", "')}".`,
      whyItMatters: 'Social engineering leverages isolation, fear of legal repercussions, or false assurances of "100% instant refund" to suppress the victim\'s natural skepticism.',
      evidence: matchedSocialEvidence,
      recommendedAction: 'Do not succumb to intimidation or secrecy mandates. Authentic regulatory and corporate actions are documented formally in verifiable writing.'
    });
  }

  // --- G. SUSPICIOUS EMBEDDED URLS IN TEXT ---
  if (linksFound.length > 0) {
    const suspiciousLinks = linksFound.filter(l =>
      /\.(xyz|top|work|click|buzz|rest|fit|loan|bar|link)\b/i.test(l) ||
      /(?:bit\.ly|tinyurl|t\.me|wa\.me|is\.gd|cutt\.ly)/i.test(l) ||
      /(?:login|verify|kyc|bonus|secure|update|claim|reward)/i.test(l)
    );

    if (suspiciousLinks.length > 0) {
      detectedCategories.add('URL_STRUCTURE');
      detections.push({
        category: 'URL_STRUCTURE',
        name: 'High-Risk Embedded Link in Message',
        severity: 'HIGH',
        baseWeight: 16,
        whatDetected: `Detected message links using redirection or high-risk domain patterns: "${suspiciousLinks.slice(0, 2).join('", "')}".`,
        whyItMatters: 'Shortened URLs and high-risk top-level domains are standard conduits for phishing portals designed to harvest credentials or banking tokens.',
        evidence: suspiciousLinks.slice(0, 3),
        recommendedAction: 'Do not click the embedded links. Use the URL Scanner mode below or independently navigate to the company official website.'
      });
    }
  }

  return {
    detections,
    extractedEntities: {
      amounts: amountsFound.length > 0 ? amountsFound : undefined,
      contacts: contactsFound.length > 0 ? contactsFound : undefined,
      links: linksFound.length > 0 ? linksFound : undefined,
      claimedOrg: claimedOrg || undefined
    },
    detectedCategories
  };
}
