import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import { analyzeMessageText } from './server/analyzers/messageAnalyzer.ts';
import { analyzeUrlStructure } from './server/analyzers/urlAnalyzer.ts';
import { computeThreatIndex } from './server/analyzers/riskEngine.ts';
import { generateSecurityExplanation, analyzeImageScreenshot } from './server/services/geminiService.ts';
import { generateGeographicIntelligence } from './src/utils/geoIntelligence.ts';
import type { AnalysisResult } from './src/types.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser with generous limit for screenshot uploads
  app.use(express.json({ limit: '12mb' }));

  // --- HEALTH CHECK ---
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'scamshield',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // --- MESSAGE & DOCUMENT SCANNER ---
  app.post('/api/analyze/message', async (req, res) => {
    try {
      const { text, imageBase64, mimeType } = req.body;

      if (!text && !imageBase64) {
        return res.status(400).json({
          error: 'Please provide either a message text or an image/document screenshot to analyze.'
        });
      }

      let combinedText = (text || '').trim();
      let inputType: AnalysisResult['inputType'] = 'message';
      let visualNotes = '';

      // If image is attached, run OCR & visual analysis
      if (imageBase64) {
        inputType = 'document_image';
        const imgAnalysis = await analyzeImageScreenshot(imageBase64, mimeType || 'image/png');
        if (imgAnalysis.extractedText) {
          combinedText = `${combinedText}\n[Extracted Document Text]:\n${imgAnalysis.extractedText}`;
        }
        visualNotes = imgAnalysis.visualNotes;
      }

      if (combinedText.length > 25000) {
        return res.status(400).json({
          error: 'Input content exceeds maximum allowed length (25,000 characters).'
        });
      }

      // 1. Deterministic Message Threat Analysis
      const messageAnalysis = analyzeMessageText(combinedText);

      // 2. Deterministic Risk Engine
      const threatModel = computeThreatIndex(messageAnalysis.detections);

      // 3. AI Nuance & Explanation Layer
      const explanation = await generateSecurityExplanation({
        inputText: combinedText,
        threatScore: threatModel.threatScore,
        riskLevel: threatModel.riskLevel,
        evidenceStrength: threatModel.evidenceStrength,
        signals: threatModel.signals,
        compoundRiskNotes: threatModel.compoundRiskNotes,
        extractedEntities: messageAnalysis.extractedEntities,
        inputType
      });

      const result: AnalysisResult = {
        id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        inputType,
        inputSnippet: (text || 'Document Image Analysis').slice(0, 200),
        rawInputText: combinedText,
        threatScore: threatModel.threatScore,
        riskLevel: threatModel.riskLevel,
        evidenceStrength: threatModel.evidenceStrength,
        headline: threatModel.headline,
        summary: explanation.summary,
        primaryQuote: explanation.primaryQuote,
        whyThisScore: explanation.whyThisScore + (visualNotes ? `\n\nVisual Inspection Notes: ${visualNotes}` : ''),
        signals: threatModel.signals,
        scoreBreakdown: threatModel.scoreBreakdown,
        recommendedActions: explanation.recommendedActions,
        extractedEntities: messageAnalysis.extractedEntities,
        geographicIntelligence: generateGeographicIntelligence({
          threatScore: threatModel.threatScore,
          riskLevel: threatModel.riskLevel,
          inputType,
          signals: threatModel.signals,
          extractedEntities: messageAnalysis.extractedEntities,
          rawText: combinedText
        }),
        aiAssisted: explanation.aiAssisted
      };

      res.json(result);
    } catch (err: any) {
      console.error('Error analyzing message:', err);
      res.status(500).json({
        error: 'We encountered an issue during threat analysis. Please try again with your input.'
      });
    }
  });

  // --- URL THREAT SCANNER ---
  app.post('/api/analyze/url', async (req, res) => {
    try {
      const { url } = req.body;

      if (!url || typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({
          error: 'Please enter a valid website URL or domain (e.g., https://example.com).'
        });
      }

      const rawUrl = url.trim();
      if (rawUrl.length > 2048) {
        return res.status(400).json({
          error: 'Submitted URL exceeds standard character limit.'
        });
      }

      // 1. Structural URL and Domain Analysis
      const urlAnalysis = analyzeUrlStructure(rawUrl);
      if (!urlAnalysis.isValid) {
        return res.status(400).json({
          error: urlAnalysis.error || 'Invalid URL structure.'
        });
      }

      // 2. Deterministic Risk Engine
      const threatModel = computeThreatIndex(urlAnalysis.detections);

      // 3. AI Explanation Layer
      const explanation = await generateSecurityExplanation({
        inputText: `Analyzed URL: ${urlAnalysis.urlDetails.url}
Domain: ${urlAnalysis.urlDetails.domain}
Protocol: ${urlAnalysis.urlDetails.protocol}
TLD: .${urlAnalysis.urlDetails.tld}
Subdomains: ${urlAnalysis.urlDetails.subdomains.join('.') || 'None'}
Flagged Indicators: ${urlAnalysis.urlDetails.flaggedKeywords.join(', ') || 'None'}`,
        threatScore: threatModel.threatScore,
        riskLevel: threatModel.riskLevel,
        evidenceStrength: threatModel.evidenceStrength,
        signals: threatModel.signals,
        compoundRiskNotes: threatModel.compoundRiskNotes,
        extractedEntities: { links: [urlAnalysis.urlDetails.url] },
        inputType: 'url'
      });

      const result: AnalysisResult = {
        id: `urlscan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        inputType: 'url',
        inputSnippet: urlAnalysis.urlDetails.url,
        rawInputText: rawUrl,
        threatScore: threatModel.threatScore,
        riskLevel: threatModel.riskLevel,
        evidenceStrength: threatModel.evidenceStrength,
        headline: threatModel.headline,
        summary: explanation.summary,
        primaryQuote: explanation.primaryQuote || urlAnalysis.urlDetails.url,
        whyThisScore: explanation.whyThisScore,
        signals: threatModel.signals,
        scoreBreakdown: threatModel.scoreBreakdown,
        recommendedActions: explanation.recommendedActions,
        extractedEntities: { links: [urlAnalysis.urlDetails.url] },
        urlDetails: urlAnalysis.urlDetails,
        geographicIntelligence: generateGeographicIntelligence({
          threatScore: threatModel.threatScore,
          riskLevel: threatModel.riskLevel,
          inputType: 'url',
          signals: threatModel.signals,
          urlDetails: urlAnalysis.urlDetails,
          rawText: rawUrl
        }),
        aiAssisted: explanation.aiAssisted
      };

      res.json(result);
    } catch (err: any) {
      console.error('Error analyzing URL:', err);
      res.status(500).json({
        error: 'Unable to evaluate URL threat indicators. Please verify the URL format.'
      });
    }
  });

  // --- VITE MIDDLEWARE (DEV) & STATIC FILES (PROD) ---
  const isDev = process.env.NODE_ENV === 'development' || !fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'));
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SCAMSHIELD server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
