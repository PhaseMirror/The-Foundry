
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, AfterViewInit, viewChild } from '@angular/core';

declare const d3: any;

@Component({
  selector: 'app-sparkline',
  template: `<svg #svgContainer class="w-full h-full overflow-visible"></svg>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SparklineComponent implements AfterViewInit {
  data = input.required<number[]>();
  color = input<string>('#FFFFFF');
  
  svgContainer = viewChild.required<ElementRef<SVGElement>>('svgContainer');
  private host = inject(ElementRef);

  ngAfterViewInit(): void {
    this.drawChart();
  }

  private drawChart(): void {
    const data = this.data();
    if (!data || data.length === 0) return;

    const svgEl = this.svgContainer().nativeElement;
    const width = this.host.nativeElement.clientWidth;
    const height = this.host.nativeElement.clientHeight;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove(); // Clear previous chart

    const x = d3.scaleLinear().domain([0, data.length - 1]).range([0, width]);
    const y = d3.scaleLinear().domain(d3.extent(data)).range([height - 2, 2]);

    const line = d3.line()
      .x((d: any, i: number) => x(i))
      .y((d: any) => y(d))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', this.color())
      .attr('stroke-width', 2)
      .attr('d', line)
      .attr('class', 'sparkline-path');
  }
}
