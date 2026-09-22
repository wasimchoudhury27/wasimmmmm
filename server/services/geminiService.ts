import { GoogleGenAI, Type } from '@google/genai';
import type { RiskSignal, RiskBand, EvidenceStrength, ExtractedEntities } from '../../src/types.ts';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }
  return aiClient;
}

export interface AiExplanationPayload {
  inputText: string;
  threatScore: number;
  riskLevel: RiskBand;
  evidenceStrength: EvidenceStrength;
  signals: RiskSignal[];
  compoundRiskNotes: string[];
  extractedEntities: ExtractedEntities;
  inputType: 'message' | 'url' | 'document_image';
}

export interface AiExplanationResult {
  summary: string;
  whyThisScore: string;
  primaryQuote?: string;
  recommendedActions: string[];
  aiAssisted: boolean;
}

// gemini-3.1-flash-lite handles fast inference and avoids high-demand 503 spikes; gemini-3.8-flash serves as secondary
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

async function waitMs(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Synthesizes human-readable cybersecurity explanation and action advice.
 * Deterministic engine controls the score; Gemini provides nuanced natural language reasoning.
 */
export async function generateSecurityExplanation(payload: AiExplanationPayload): Promise<AiExplanationResult> {
  const ai = getAiClient();

  if (!ai) {
    return generateLocalFallbackExplanation(payload);
  }

  const prompt = `You are SCAMSHIELD's Senior Cybersecurity Investigator and Threat Analyst.
Analyze the following user-submitted ${payload.inputType} and the deterministic risk evaluation:

=== USER INPUT ===
${payload.inputText.slice(0, 1500)}

=== DETERMINISTIC RISK ENGINE FINDINGS ===
Threat Score: ${payload.threatScore}/100
Risk Level: ${payload.riskLevel}
Evidence Strength: ${payload.evidenceStrength}
Signals Detected:
${payload.signals.map((s, idx) => `${idx + 1}. [${s.category}] ${s.name} (Severity: ${s.severity}) - Evidence: ${s.evidence.join('; ')}`).join('\n')}
Compound Risk Factors:
${payload.compoundRiskNotes.join('\n')}

=== STRICT SAFETY & ETHICAL RULES ===
1. Tone: Calm, protective, objective, transparent, and authoritative. Never use sensationalized all-caps warnings like "YOU ARE BEING SCAMMED". Instead use calm professional warnings like "Pause before you pay" or "High-risk indicators detected."
2. NEVER state "This is definitely a scam" or "This is 100% fraud". State: "High-risk indicators detected" or "Strong scam indicators detected."
3. If risk is LOW (score < 25), NEVER state "This is completely safe." State: "No major scam indicators were detected in the available evidence. Always exercise standard vigilance."
4. "Why did I get this score?" explanation MUST directly reference the specific observable evidence and explain in 2-3 concise sentences why those factors trigger caution.
5. Provide 3-4 specific, actionable, context-aware steps the user should take immediately to protect themselves.

Generate a JSON response conforming strictly to the requested schema.`;

  // Try candidate models in order to gracefully absorb transient 503 high-demand spikes
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'A 1-2 sentence executive summary of the threat risk.'
              },
              whyThisScore: {
                type: Type.STRING,
                description: 'Clear, human-readable paragraph explaining why the user received this specific threat score based on the evidence.'
              },
              primaryQuote: {
                type: Type.STRING,
                description: 'The single most critical suspicious excerpt from the user input.'
              },
              recommendedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of 3-4 protective actions the user should take.'
              }
            },
            required: ['summary', 'whyThisScore', 'recommendedActions']
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.summary && parsed.whyThisScore && Array.isArray(parsed.recommendedActions)) {
          return {
            summary: parsed.summary,
            whyThisScore: parsed.whyThisScore,
            primaryQuote: parsed.primaryQuote || payload.signals[0]?.evidence[0] || undefined,
            recommendedActions: parsed.recommendedActions,
            aiAssisted: true
          };
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isTransient = errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('429');
      if (isTransient) {
        // High demand on current model; brief backoff and try next model
        console.warn(`Model ${model} experiencing temporary demand/503. Testing alternate model...`);
        await waitMs(350);
        continue;
      }
      console.warn(`Model ${model} request error (${errMsg.slice(0, 100)}). Falling back...`);
      break;
    }
  }

  // Gracefully fallback to deterministic explanation engine
  return generateLocalFallbackExplanation(payload);
}

/**
 * Multimodal analysis for screenshots, appointment letters, or photo evidence.
 */
export async function analyzeImageScreenshot(imageBase64: string, mimeType: string): Promise<{ extractedText: string; visualNotes: string }> {
  const ai = getAiClient();
  if (!ai) {
    return {
      extractedText: 'Image OCR unavailable: GEMINI_API_KEY is not configured.',
      visualNotes: 'Document uploaded. Visual inspection requires active Gemini API credentials.'
    };
  }

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType || 'image/png'
              }
            },
            {
              text: `Analyze this image (which may be a suspicious job offer letter, appointment letter, rental contract, SMS/chat screenshot, or payment demand).
1. Transcribe ALL visible text accurately.
2. Note any visual scam indicators (such as pixelated corporate logos, mismatched fonts, counterfeit stamps, amateur alignment, or unusual QR codes).
Format as JSON: { "extractedText": "...", "visualNotes": "..." }`
            }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              extractedText: { type: Type.STRING },
              visualNotes: { type: Type.STRING }
            },
            required: ['extractedText', 'visualNotes']
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          extractedText: parsed.extractedText || '',
          visualNotes: parsed.visualNotes || ''
        };
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isTransient = errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('429');
      if (isTransient) {
        console.warn(`Vision model ${model} experiencing temporary demand/503. Testing alternate model...`);
        await waitMs(350);
        continue;
      }
      console.warn(`Vision analysis on ${model} error (${errMsg.slice(0, 100)}). Falling back...`);
      break;
    }
  }

  return {
    extractedText: 'Unable to extract text from the provided image format.',
    visualNotes: 'Visual analysis encountered a processing limitation.'
  };
}

/**
 * Local deterministic fallback explanation generator when offline or without Gemini API key.
 */
function generateLocalFallbackExplanation(payload: AiExplanationPayload): AiExplanationResult {
  const sigCount = payload.signals.length;

  if (payload.threatScore < 25) {
    return {
      summary: 'No major scam indicators were detected in the available evidence.',
      whyThisScore: 'The submitted content does not exhibit standard indicators of upfront payment coercion, artificial urgency, or identity spoofing. However, always exercise standard independent verification.',
      recommendedActions: [
        'Always confirm critical details through verified, independent communication channels.',
        'Never disclose OTPs, banking credentials, or personal identification without verified necessity.',
        'Keep a record of all official correspondence in written form.'
      ],
      aiAssisted: false
    };
  }

  const signalCategories = Array.from(new Set(payload.signals.map(s => s.category)));
  const primaryEvidence = payload.signals[0]?.evidence[0] || 'observable risk markers';

  let explanation = `The assessment identified ${sigCount} distinct risk signal${sigCount > 1 ? 's' : ''} across ${signalCategories.length} categor${signalCategories.length > 1 ? 'ies' : 'y'}. `;

  if (payload.compoundRiskNotes.length > 0) {
    explanation += payload.compoundRiskNotes[0] + ' ';
  } else {
    explanation += `Specifically, ${payload.signals.map(s => s.name.toLowerCase()).join(' and ')} were detected. `;
  }

  explanation += 'Legitimate organizations and certified transactions rarely combine upfront financial demands with unverified contact credentials.';

  const actions: string[] = [];

  if (signalCategories.includes('PAYMENT')) {
    actions.push('Do not transfer money or pay refundable deposits. Legitimate employers and genuine rental viewings never charge advance security fees.');
  }
  if (signalCategories.includes('URGENCY')) {
    actions.push('Pause before reacting. Scammers create artificial 24-hour expiration limits specifically to induce panic and prevent consultation.');
  }
  if (signalCategories.includes('EMPLOYMENT')) {
    actions.push('Independently search the company\'s official career portal or LinkedIn directory to confirm whether the job position and recruiter officially exist.');
  }
  if (signalCategories.includes('URL_STRUCTURE') || signalCategories.includes('DOMAIN_INTEL')) {
    actions.push('Do not enter login credentials, passwords, or card numbers on this website. Navigate directly to the known official domain.');
  }
  if (signalCategories.includes('FINANCIAL')) {
    actions.push('Never share OTPs, PINs, or install remote-desktop software like AnyDesk or TeamViewer requested during onboarding or verification.');
  }

  if (actions.length === 0) {
    actions.push('Do not proceed with any payment until the party\'s credentials can be independently confirmed.');
    actions.push('Seek a second opinion from a colleague, family member, or official cybersecurity portal.');
  }

  return {
    summary: `${payload.riskLevel === 'CRITICAL' ? 'Strong' : 'Multiple'} risk indicators detected requiring immediate caution.`,
    whyThisScore: explanation,
    primaryQuote: primaryEvidence,
    recommendedActions: actions.slice(0, 4),
    aiAssisted: false
  };
}
