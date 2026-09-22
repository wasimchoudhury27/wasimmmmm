import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import {
  GeographicIntelligence,
  ScamOriginNode,
  OriginArc
} from '../types.js';
import {
  Globe,
  Radio,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  Building2,
  Server,
  CreditCard,
  Network,
  Info,
  Maximize2,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Flame
} from 'lucide-react';

interface GeographicThreatMapProps {
  geoData: GeographicIntelligence;
}

type RegionFilter = 'All' | 'Asia-Pacific' | 'Europe & Middle East' | 'Americas' | 'Africa';

export const GeographicThreatMap: React.FC<GeographicThreatMapProps> = ({ geoData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<ScamOriginNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ScamOriginNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('All');
  const [showArcs, setShowArcs] = useState(true);
  const [radarPulse, setRadarPulse] = useState(true);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 480
  });

  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  // ResizeObserver for container fluidity
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          const height = Math.max(380, Math.min(540, Math.round(width * 0.52)));
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter nodes based on region
  const filteredNodes = useMemo(() => {
    if (selectedRegion === 'All') return geoData.nodes;
    return geoData.nodes.filter((n) => n.region === selectedRegion);
  }, [geoData.nodes, selectedRegion]);

  // Filter arcs based on visible nodes
  const filteredArcs = useMemo(() => {
    if (!showArcs) return [];
    if (selectedRegion === 'All') return geoData.arcs;
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return geoData.arcs.filter(
      (a) => nodeIds.has(a.sourceId) || nodeIds.has(a.targetId)
    );
  }, [geoData.arcs, filteredNodes, selectedRegion, showArcs]);

  // Main D3 Rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // 1. Create projection
    // Natural Earth projection gives an authentic, low-distortion tactical global look
    const projection = d3
      .geoNaturalEarth1()
      .scale(width / 5.6)
      .translate([width / 2, height / 1.85]);

    const pathGenerator = d3.geoPath().projection(projection);

    // 2. Zoom & Pan behavior
    const g = svg.append('g').attr('class', 'map-stage');
    gRef.current = g.node();

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.85, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // 3. Defs for SVG filters & gradients
    const defs = svg.append('defs');

    // Pulse glow filter
    const glowFilter = defs
      .append('filter')
      .attr('id', 'radar-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    glowFilter
      .append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Linear gradient for arcs
    const arcGradient = defs
      .append('linearGradient')
      .attr('id', 'threat-arc-gradient')
      .attr('gradientUnits', 'userSpaceOnUse');
    arcGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', '0.8');
    arcGradient.append('stop').attr('offset', '50%').attr('stop-color', '#f59e0b').attr('stop-opacity', '0.9');
    arcGradient.append('stop').attr('offset', '100%').attr('stop-color', '#f43f5e').attr('stop-opacity', '0.8');

    // 4. Background ocean rect
    g.append('rect')
      .attr('width', width * 3)
      .attr('height', height * 3)
      .attr('x', -width)
      .attr('y', -height)
      .attr('fill', '#090a0f');

    // 5. Graticules (Latitude / Longitude coordinate grid)
    const graticule = d3.geoGraticule10();
    g.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', (d: any) => pathGenerator(d) || '')
      .attr('fill', 'none')
      .attr('stroke', '#1a1d28')
      .attr('stroke-width', 0.6)
      .attr('stroke-dasharray', '2,4')
      .attr('opacity', 0.7);

    // 6. Draw world land / countries
    const countries = topojson.feature(
      worldData as any,
      (worldData as any).objects.countries
    ) as any;

    g.append('g')
      .attr('class', 'countries')
      .selectAll('path')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('d', (d: any) => pathGenerator(d) || '')
      .attr('fill', '#141722')
      .attr('stroke', '#222838')
      .attr('stroke-width', 0.65)
      .attr('transition', 'fill 0.2s')
      .on('mouseover', function () {
        d3.select(this).attr('fill', '#1b2030');
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', '#141722');
      });

    // 7. Draw Threat Flow Arcs
    if (showArcs && filteredArcs.length > 0) {
      const arcsGroup = g.append('g').attr('class', 'arcs-layer');

      filteredArcs.forEach((arc) => {
        const source = projection(arc.sourceCoords);
        const target = projection(arc.targetCoords);
        if (!source || !target) return;

        const [sx, sy] = source;
        const [tx, ty] = target;

        // Quadratic bezier arc calculation
        const dx = tx - sx;
        const dy = ty - sy;
        const dr = Math.sqrt(dx * dx + dy * dy);
        // Curve offset height proportional to distance
        const bend = Math.min(dr * 0.35, 90);
        const mx = (sx + tx) / 2 - (dy / dr) * bend;
        const my = (sy + ty) / 2 + (dx / dr) * bend;

        const pathD = `M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`;

        // Base glow path
        arcsGroup
          .append('path')
          .attr('d', pathD)
          .attr('fill', 'none')
          .attr('stroke', '#f43f5e')
          .attr('stroke-width', 1.8)
          .attr('stroke-opacity', 0.25)
          .attr('stroke-linecap', 'round');

        // Animated dashed transit line
        arcsGroup
          .append('path')
          .attr('d', pathD)
          .attr('fill', 'none')
          .attr('stroke', 'url(#threat-arc-gradient)')
          .attr('stroke-width', 1.6)
          .attr('stroke-opacity', 0.85)
          .attr('stroke-dasharray', '6,6')
          .attr('class', 'animate-pulse')
          .append('title')
          .text(`${arc.label} (${arc.transitType})`);
      });
    }

    // 8. Draw Origin Nodes
    const nodesGroup = g.append('g').attr('class', 'nodes-layer');

    filteredNodes.forEach((node) => {
      const coords = projection([node.longitude, node.latitude]);
      if (!coords) return;
      const [cx, cy] = coords;

      const nodeG = nodesGroup
        .append('g')
        .attr('class', 'origin-node-group cursor-pointer')
        .attr('transform', `translate(${cx}, ${cy})`)
        .on('click', () => {
          setSelectedNode(node);
        })
        .on('mouseenter', (event) => {
          setHoveredNode(node);
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
            });
          }
        })
        .on('mouseleave', () => {
          setHoveredNode(null);
          setTooltipPos(null);
        });

      const color =
        node.severity === 'CRITICAL'
          ? '#f43f5e'
          : node.severity === 'HIGH'
          ? '#f59e0b'
          : '#10b981';

      const baseRadius = Math.max(
        6,
        Math.min(14, Math.round(Math.sqrt(node.incidentCount) / 3.5))
      );

      // Radar Pulse Halo
      if (radarPulse) {
        nodeG
          .append('circle')
          .attr('r', baseRadius + 10)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 1.2)
          .attr('stroke-opacity', 0.4)
          .attr('class', 'animate-ping origin-center')
          .attr('style', 'animation-duration: 2.8s;');
      }

      // Outer targeting ring
      nodeG
        .append('circle')
        .attr('r', baseRadius + 4)
        .attr('fill', color)
        .attr('fill-opacity', 0.18)
        .attr('stroke', color)
        .attr('stroke-width', 1.2);

      // Solid Core Dot
      nodeG
        .append('circle')
        .attr('r', baseRadius)
        .attr('fill', color)
        .attr('stroke', '#090a0f')
        .attr('stroke-width', 1.8)
        .attr('filter', 'url(#radar-glow)');

      // Center crosshair / dot
      nodeG
        .append('circle')
        .attr('r', 2)
        .attr('fill', '#ffffff');

      // Tactical City Callout Label
      nodeG
        .append('text')
        .attr('x', baseRadius + 7)
        .attr('y', 3)
        .attr('fill', '#f1f5f9')
        .attr('font-size', '10px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', '600')
        .attr('text-shadow', '0 1px 3px rgba(0,0,0,0.9)')
        .text(node.city.split('(')[0].trim());
    });
  }, [dimensions, filteredNodes, filteredArcs, showArcs, radarPulse]);

  // Zoom handlers
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.4);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.transform, d3.zoomIdentity);
  };

  const regions: RegionFilter[] = ['All', 'Asia-Pacific', 'Europe & Middle East', 'Americas', 'Africa'];

  return (
    <div
      id="geographic-threat-visualization"
      className="rounded-2xl bg-[#12141a]/95 border border-zinc-800 p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden"
    >
      {/* Tactical Grid Background Ambient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* 1. Header & Telemetry Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wider">
              Geographic Scam Pattern Telemetry
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-rose-500/40 bg-rose-950/60 text-rose-300 font-semibold flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>{geoData.advisoryLevel}</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
            Correlated syndicate origin nodes, money-laundering hops, and infrastructure hosting footprints linked to this investigation’s modus operandi.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-[#161922] px-3 py-2 rounded-xl border border-zinc-800 text-center">
            <span className="text-slate-500 text-[10px] block uppercase">Correlated Incidents</span>
            <span className="text-emerald-400 font-bold text-sm">
              {geoData.totalRelatedIncidents.toLocaleString()}+
            </span>
          </div>
          <div className="bg-[#161922] px-3 py-2 rounded-xl border border-zinc-800 text-center">
            <span className="text-slate-500 text-[10px] block uppercase">Active Origin Hubs</span>
            <span className="text-amber-400 font-bold text-sm">{geoData.nodes.length} Clusters</span>
          </div>
        </div>
      </div>

      {/* 2. Tactical Controls Bar */}
      <div className="py-3 flex flex-wrap items-center justify-between gap-3 relative z-10 text-xs font-mono">
        {/* Region Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-500 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Scope:</span>
          </span>
          {regions.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => {
                setSelectedRegion(reg);
                handleResetZoom();
              }}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                selectedRegion === reg
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold shadow-sm'
                  : 'bg-[#161922] border-zinc-800 text-slate-400 hover:text-slate-200 hover:border-zinc-700'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>

        {/* View Options & Zoom */}
        <div className="flex items-center gap-2">
          {/* Toggle Flow Arcs */}
          <button
            type="button"
            onClick={() => setShowArcs(!showArcs)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              showArcs
                ? 'bg-zinc-800 border-zinc-700 text-slate-200'
                : 'bg-[#161922] border-zinc-800 text-slate-500'
            }`}
            title="Toggle Threat Flow Arcs"
          >
            <Network className="w-3.5 h-3.5 text-rose-400" />
            <span>Transit Vectors</span>
          </button>

          {/* Toggle Radar Pulse */}
          <button
            type="button"
            onClick={() => setRadarPulse(!radarPulse)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              radarPulse
                ? 'bg-zinc-800 border-zinc-700 text-emerald-300'
                : 'bg-[#161922] border-zinc-800 text-slate-500'
            }`}
            title="Toggle Sensor Radar Pulse"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Radar</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-[#161922] rounded-lg border border-zinc-800 p-0.5">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-zinc-800"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-zinc-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-zinc-800"
              title="Reset Map"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. D3 Map Stage Container */}
      <div
        ref={containerRef}
        className="w-full relative rounded-xl border border-zinc-800/80 bg-[#090a0f] overflow-hidden my-2 shadow-inner"
        style={{ minHeight: '380px', height: `${dimensions.height}px` }}
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full block cursor-grab active:cursor-grabbing select-none"
        />

        {/* Live Hover Tooltip */}
        {hoveredNode && tooltipPos && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-xl bg-[#161922]/95 border border-zinc-700 shadow-2xl text-xs font-mono backdrop-blur-md max-w-xs"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 12}px`
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-1.5 mb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    hoveredNode.severity === 'CRITICAL'
                      ? 'bg-rose-400'
                      : hoveredNode.severity === 'HIGH'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                {hoveredNode.city}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{hoveredNode.country}</span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Classification:</span>
                <span className="text-amber-300 font-medium">{hoveredNode.hubType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Incident Volume:</span>
                <span className="text-emerald-400 font-bold">{hoveredNode.incidentCount.toLocaleString()}+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Confidence:</span>
                <span className="text-slate-200">{hoveredNode.confidenceScore}%</span>
              </div>
              <div className="pt-1 text-[10px] text-slate-400 border-t border-zinc-800">
                Click node to inspect forensic dossier
              </div>
            </div>
          </div>
        )}

        {/* Legend Overlay at Bottom-Left */}
        <div className="absolute bottom-3 left-3 bg-[#12141a]/90 border border-zinc-800/90 rounded-lg p-2.5 text-[11px] font-mono backdrop-blur-md space-y-1.5 text-slate-400 pointer-events-none">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Threat Severity
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300">Critical Hub</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300">High Density</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Transit/Mule</span>
            </span>
          </div>
        </div>

        {/* Watermark / Map Status at Bottom-Right */}
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500 bg-[#12141a]/80 px-2.5 py-1 rounded border border-zinc-800 pointer-events-none">
          D3 Cyber-Forensic Cartography • Natural Earth Projection
        </div>
      </div>

      {/* 4. Selected Node Forensic Intelligence Dossier */}
      {selectedNode ? (
        <div className="mt-4 p-4 sm:p-5 rounded-xl bg-[#161922] border border-zinc-700/80 relative">
          <button
            type="button"
            onClick={() => setSelectedNode(null)}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-zinc-800"
            title="Close dossier"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
              CLUSTER DOSSIER // {selectedNode.countryCode}
            </span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                selectedNode.severity === 'CRITICAL'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
              }`}
            >
              {selectedNode.severity} RISK
            </span>
            <span className="text-xs font-mono text-slate-400">
              Confidence Score: {selectedNode.confidenceScore}%
            </span>
          </div>

          <h4 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span>{selectedNode.city}, {selectedNode.country}</span>
            <span className="text-xs font-mono text-amber-400 font-normal">
              [{selectedNode.patternType}]
            </span>
          </h4>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            {selectedNode.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#0e1015] border border-zinc-800">
              <span className="text-slate-500 block mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                Primary Payment Rail
              </span>
              <span className="text-slate-200 font-medium">{selectedNode.primaryPaymentRail}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e1015] border border-zinc-800">
              <span className="text-slate-500 block mb-1 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-amber-400" />
                Infrastructure & Transit
              </span>
              <span className="text-slate-200 font-medium">
                {selectedNode.infrastructureAsn || 'Rotational Proxy / Mobile SIMs'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0e1015] border border-zinc-800">
              <span className="text-slate-500 block mb-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Historical Loss Telemetry
              </span>
              <span className="text-rose-300 font-bold">{selectedNode.historicalLossEstimate}</span>
            </div>
          </div>

          {selectedNode.correlatedSignals.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-slate-500">Correlated Markers:</span>
              {selectedNode.correlatedSignals.map((sig, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-zinc-800/70 border border-zinc-700 text-slate-300"
                >
                  {sig}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Summary Analyst Strip when no specific node is selected */
        <div className="mt-4 p-4 rounded-xl bg-[#161922] border border-zinc-800/90 text-xs sm:text-sm font-sans flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold font-mono block mb-0.5">
                Syndicate Cluster Analysis: {geoData.activePatternCluster}
              </span>
              <p className="text-slate-400 leading-relaxed text-xs">
                {geoData.analystSummary}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Estimated Global Losses:</span>
            <span className="text-amber-400 font-bold">{geoData.estimatedGlobalImpact}</span>
          </div>
        </div>
      )}
    </div>
  );
};
