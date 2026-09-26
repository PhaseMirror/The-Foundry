
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { CREDIT_CARD_DATA } from '../../models/credit-card.model';

declare const d3: any;

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizationComponent implements AfterViewInit {
  
  container = viewChild.required<ElementRef>('container');

  ngAfterViewInit(): void {
    this.createVisualization();
  }

  private createVisualization(): void {
    const data = CREDIT_CARD_DATA.filter(d => d.type !== 'Intrinsic');
    const totalBalance = d3.sum(data, (d: any) => d.balance);

    const width = 800;
    const height = 800;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(this.container().nativeElement)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Gradient for center
    const defs = svg.append('defs');
    const radialGradient = defs.append('radialGradient')
      .attr('id', 'center-gradient')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    radialGradient.append('stop').attr('offset', '0%').attr('stop-color', '#151821');
    radialGradient.append('stop').attr('offset', '100%').attr('stop-color', '#0D0F14');

    // Center circle
    svg.append('circle')
      .attr('r', radius * 0.3)
      .attr('fill', 'url(#center-gradient)')
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('stroke-width', 1);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('class', 'font-mono text-5xl font-bold fill-current text-[#F0F0F5]')
      .text(totalBalance.toLocaleString());
    
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('class', 'text-sm fill-current text-[#8B8FA3] uppercase tracking-wider')
      .text('Total Credit Value');

    // Inner ring (credit types)
    const pie = d3.pie().value((d: any) => d.balance).sort(null);
    const arc = d3.arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius * 0.55);

    const arcs = svg.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => d.data.accentColor)
      .attr('stroke', '#0D0F14')
      .attr('stroke-width', 3);

    // Outer ring (activity indicators)
    const outerArc = d3.arc()
      .innerRadius(radius * 0.65)
      .outerRadius(radius * 0.68);
      
    arcs.append('path')
      .attr('d', outerArc)
      .attr('fill', (d: any) => d.data.accentColor)
      .style('opacity', () => Math.random() * 0.7 + 0.3); // Random velocity

    // Faint animated paths (mock transactions)
    const numLines = 10;
    for (let i = 0; i < numLines; i++) {
        const startPoint = arcs.nodes()[Math.floor(Math.random() * arcs.size())].__data__;
        const endPoint = arcs.nodes()[Math.floor(Math.random() * arcs.size())].__data__;

        const startAngle = (startPoint.startAngle + startPoint.endAngle) / 2;
        const endAngle = (endPoint.startAngle + endPoint.endAngle) / 2;
        const lineRadius = radius * 0.5;

        const line = d3.line()
            .x((d:any) => d.x)
            .y((d:any) => d.y)
            .curve(d3.curveBundle.beta(0.5));

        const points = [
            { x: lineRadius * Math.sin(startAngle), y: -lineRadius * Math.cos(startAngle) },
            { x: 0, y: 0 },
            { x: lineRadius * Math.sin(endAngle), y: -lineRadius * Math.cos(endAngle) }
        ];

        svg.append("path")
            .datum(points)
            .attr("d", line)
            .attr("stroke", "#2DD4BF")
            .attr("stroke-width", 1.5)
            .attr("fill", "none")
            .style("opacity", 0.5);
    }
  }
}
