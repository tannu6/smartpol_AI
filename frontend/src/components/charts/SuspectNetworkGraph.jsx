import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function SuspectNetworkGraph({ nodes = [], edges = [], width = 800, height = 500 }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g')

    const simulation = d3.forceSimulation(nodes.map(n => ({ ...n, id: n.node_id })))
      .force('link', d3.forceLink(edges.map(e => ({ source: e.source, target: e.target, ...e }))).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(30))

    const link = g.append('g').selectAll('line')
      .data(edges).join('line')
      .attr('stroke', '#434655').attr('stroke-width', d => (d.weight || 1) * 2)
      .attr('stroke-opacity', 0.6)

    const node = g.append('g').selectAll('g')
      .data(nodes).join('g')
      .call(d3.drag()
        .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
        .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null }))

    const colorMap = { person: '#2563eb', account: '#ffb4ab', domain: '#8343f4', phone: '#4cd7f6' }

    node.append('circle')
      .attr('r', d => 12 + (d.risk_score || 0.5) * 10)
      .attr('fill', d => colorMap[d.node_type] || '#b4c5ff')
      .attr('stroke', d => d.risk_score > 0.85 ? '#ffb4ab' : '#4cd7f6')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9)

    node.append('text')
      .text(d => d.name?.slice(0, 12))
      .attr('x', 0).attr('y', 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#d9e2fe')
      .attr('font-size', '8px')
      .attr('font-family', 'Space Mono')

    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => simulation.stop()
  }, [nodes, edges, width, height])

  return (
    <div className="w-full overflow-hidden rounded-xl border border-primary/15 bg-surface-container-low/40">
      <svg ref={svgRef} width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="bg-surface-container-lowest/50" />
    </div>
  )
}
