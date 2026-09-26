import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Tensor, SimulationNode, SimulationLink, Policy } from '../types';

interface HypergraphCanvasProps {
  tensors: Tensor[];
  lambdaM: number;
  policies: Policy[];
}

const HypergraphCanvas: React.FC<HypergraphCanvasProps> = ({ tensors, lambdaM, policies }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomGroupRef = useRef<SVGGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, tensor: Tensor | null } | null>(null);

  // Calculate policy impacts for Visual Overlay
  const activePolicies = policies.filter(p => p.active);
  const netDignityImpact = activePolicies.reduce((acc, p) => acc + p.impactVector.dignityModifier, 0);
  
  // Determine overlay style based on net impact
  // Positive dignity -> Greenish tint/border
  // Negative dignity -> Reddish tint/border indicating systemic stress
  const getOverlayStyle = () => {
      if (activePolicies.length === 0) return {};
      
      if (netDignityImpact < -0.2) {
          // High stress
          return {
              boxShadow: 'inset 0 0 80px rgba(239, 68, 68, 0.2)',
              borderColor: 'rgba(239, 68, 68, 0.4)'
          };
      } else if (netDignityImpact > 0.2) {
          // Dignity conservation
          return {
              boxShadow: 'inset 0 0 80px rgba(16, 185, 129, 0.15)',
              borderColor: 'rgba(16, 185, 129, 0.3)'
          };
      }
      // Neutral / Mixed
      return {
          borderColor: 'rgba(99, 102, 241, 0.3)'
      };
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !zoomGroupRef.current) return;

    // Clear previous elements inside the zoom group
    d3.select(zoomGroupRef.current).selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    
    // Zoom Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        d3.select(zoomGroupRef.current).attr("transform", event.transform);
      });

    svg.call(zoom);

    // --- Prepare Data ---
    // Calculate global policy modifiers for simulation physics
    let globalDignityMod = 0;
    let globalHarmMod = 0;
    
    policies.forEach(p => {
        if(p.active) {
            globalDignityMod += p.impactVector.dignityModifier;
            if (p.impactVector.dignityModifier < 0) globalHarmMod += 0.2;
        }
    });

    // Convert tensors to nodes
    const nodes: SimulationNode[] = tensors.map(t => ({
      id: t.id,
      type: 'survivor',
      group: t.primeIndex,
      tensor: t,
      // Radius affected by policy dignity impact (lower dignity = smaller, fragile node)
      radius: t.consent.isRevoked 
        ? 5 
        : Math.max(4, (8 + (t.entanglementFactor * 5)) + (globalDignityMod * 3)),
      x: width / 2 + (Math.random() - 0.5) * 50,
      y: height / 2 + (Math.random() - 0.5) * 50
    }));

    // Generate links based on entanglement factor proximity or shared axes
    const links: SimulationLink[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const t1 = nodes[i].tensor!;
        const t2 = nodes[j].tensor!;
        
        if (t1.consent.isRevoked || t2.consent.isRevoked) continue;

        const harmDiff = Math.abs(t1.semanticAxes.systemicHarm - t2.semanticAxes.systemicHarm);
        
        // Policies increasing harm might weaken entanglement connections
        const threshold = 0.25 - (globalHarmMod * 0.05);

        if (harmDiff < Math.max(0.1, threshold)) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            value: (1 - harmDiff),
            type: 'entanglement'
          } as any);
        }
      }
    }

    // --- Background Field ---
    const fieldColor = d3.interpolateLab("#1e293b", "#450a0a")(Math.min(lambdaM / 10, 1));
    d3.select(containerRef.current)
      .style("background", `radial-gradient(circle at center, ${fieldColor} 0%, #050508 100%)`);

    // --- Simulation ---
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => d.radius + 10));

    // --- Drawing ---
    const g = d3.select(zoomGroupRef.current);

    // Edges
    const link = g.append("g")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#6366f1")
      // Thinner links if policies are harmful (fragile social fabric)
      .attr("stroke-width", d => Math.max(0.5, (Math.sqrt(d.value) * 2) - globalHarmMod));

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "cursor-pointer");

    // Glow effect
    node.append("circle")
      .attr("r", d => d.radius * 1.5)
      .attr("fill", d => {
          if (d.tensor?.consent.isRevoked) return "transparent";
          // If high harm policy active, glow gets redder
          const isHarmful = d.tensor?.semanticAxes.systemicHarm! > 0.8 || globalHarmMod > 0.1;
          return isHarmful ? "rgba(239, 68, 68, 0.3)" : "rgba(6, 182, 212, 0.2)";
      })
      .attr("class", "blur-md");

    // Core circle
    node.append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => {
         if (d.tensor?.consent.isRevoked) return "#334155";
         return "#cbd5e1";
      })
      .attr("stroke", d => {
          if (d.tensor?.consent.isRevoked) return "#475569";
          // Visualize Policy Impact on Node Borders
          if (globalDignityMod > 0.3) return "#10b981"; // Green stroke for high dignity support
          if (globalHarmMod > 0.1) return "#ef4444"; // Red stroke for high systemic harm
          return d.tensor?.semanticAxes.systemicHarm! > 0.8 ? "#ef4444" : "#06b6d4";
      })
      .attr("stroke-width", d => globalDignityMod > 0.3 ? 3 : 2);

    // Labels
    node.append("text")
      .text(d => `p=${d.tensor?.primeIndex}`)
      .attr("x", d => d.radius + 5)
      .attr("y", 4)
      .attr("font-family", "monospace")
      .attr("font-size", "10px")
      .attr("fill", "#94a3b8");

    // --- Interactions ---
    node.on("mouseover", (event, d) => {
        if (!d.tensor) return;
        setTooltip({
            x: event.pageX,
            y: event.pageY,
            tensor: d.tensor
        });
    })
    .on("mousemove", (event) => {
        setTooltip(prev => prev ? { ...prev, x: event.pageX, y: event.pageY } : null);
    })
    .on("mouseout", () => {
        setTooltip(null);
    });

    node.call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };

  }, [tensors, lambdaM, policies]);

  return (
    <div 
        ref={containerRef} 
        className="w-full h-full relative overflow-hidden bg-moral-900 rounded-xl border border-moral-800 shadow-2xl transition-all duration-1000"
        style={getOverlayStyle()}
    >
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-moral-accent font-mono text-xs uppercase tracking-widest">Synthetic Moral Universe</h3>
        <p className="text-gray-500 text-[10px] font-mono">Quantum Moral Entanglement View (QME)</p>
        <p className="text-[9px] text-gray-600 font-mono mt-1">Hold Shift + Drag to Pan, Scroll to Zoom</p>
      </div>
      
      {/* Field Indicators */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none flex flex-col items-end space-y-1">
        <div className="flex items-center space-x-2">
            <span className="text-gray-500 text-[10px] font-mono">Λm (Drift):</span>
            <span className={`text-xs font-mono font-bold ${lambdaM > 5 ? 'text-red-500' : 'text-green-500'}`}>
                {lambdaM.toFixed(4)}
            </span>
        </div>
        <div className="flex items-center space-x-2">
            <span className="text-gray-500 text-[10px] font-mono">System Entropy:</span>
            <span className="text-xs font-mono text-blue-400">
                {(tensors.length * 0.42).toFixed(2)} J/K
            </span>
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full block cursor-move">
          <g ref={zoomGroupRef}></g>
      </svg>
      
      {/* Custom Tooltip */}
      {tooltip && tooltip.tensor && (
          <div 
            className="fixed z-50 bg-moral-900/95 border border-moral-700 text-gray-200 p-3 rounded-lg shadow-xl pointer-events-none backdrop-blur-md w-64"
            style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}
          >
            <div className="flex justify-between items-start border-b border-moral-800 pb-2 mb-2">
                <div>
                    <span className="text-[10px] font-mono text-moral-500">p={tooltip.tensor.primeIndex}</span>
                    <h4 className="text-xs font-bold">{tooltip.tensor.name}</h4>
                </div>
                <div className={`w-2 h-2 rounded-full ${tooltip.tensor.consent.isRevoked ? 'bg-red-500' : 'bg-green-500'}`}></div>
            </div>
            <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">{tooltip.tensor.narrativeSummary}</p>
            <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-gray-500">
                <div className="flex flex-col items-center p-1 bg-moral-800/50 rounded">
                    <span className="text-green-400">{(tooltip.tensor.semanticAxes.dignity * 100).toFixed(0)}</span>
                    <span>DIG</span>
                </div>
                 <div className="flex flex-col items-center p-1 bg-moral-800/50 rounded">
                    <span className="text-red-400">{(tooltip.tensor.semanticAxes.systemicHarm * 100).toFixed(0)}</span>
                    <span>HRM</span>
                </div>
                 <div className="flex flex-col items-center p-1 bg-moral-800/50 rounded">
                    <span className="text-blue-400">{(tooltip.tensor.semanticAxes.resilience * 100).toFixed(0)}</span>
                    <span>RES</span>
                </div>
            </div>
          </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none bg-moral-900/80 p-2 rounded border border-moral-800 backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 rounded-full border border-moral-accent bg-moral-900"></div>
            <span className="text-[9px] text-gray-400">Stable Tensor</span>
        </div>
         <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 rounded-full border border-red-500 bg-red-900/30 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            <span className="text-[9px] text-gray-400">High Systemic Harm</span>
        </div>
        <div className="flex items-center space-x-2">
            <div className="w-8 h-[1px] bg-moral-500"></div>
            <span className="text-[9px] text-gray-400">Entanglement Link</span>
        </div>
      </div>
      
      {/* Policy Overlay Indicator Text */}
      {netDignityImpact !== 0 && (
          <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
              <span className={`text-[9px] font-mono uppercase px-2 py-1 rounded border ${
                  netDignityImpact < -0.2 ? 'bg-red-900/40 text-red-400 border-red-800' :
                  netDignityImpact > 0.2 ? 'bg-green-900/40 text-green-400 border-green-800' :
                  'bg-moral-900/40 text-moral-400 border-moral-800'
              }`}>
                  Field Modifier: {netDignityImpact > 0 ? '+' : ''}{netDignityImpact.toFixed(1)} Dig
              </span>
          </div>
      )}
    </div>
  );
};

export default HypergraphCanvas;