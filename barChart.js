const renderBarChart = (ticketData, width, height) => {
    width = window.innerWidth * 0.8
    height = 0.5 * width
    //resize svg
    svg.attr("width", width)
    .attr("height", height)

    const ticketsByQuarter = d3.group(ticketData, d => {
        const date = new Date(d.EntryDate)
        const year = date.getFullYear()
        const quarter = Math.floor(date.getMonth() / 3) + 1
        return `${year}-Q${quarter}`
    })
    const ticketsByQuarterArray = Array.from(ticketsByQuarter, ([quarter, tickets]) => ({
        quarter, 
        count: tickets.length
    })).sort((a,b) => a.quarter.localeCompare(b.quarter))

    const xValue = d => d.quarter
    const yValue = d => d.count

    const margin = { top: 50, right: 40, bottom: 70, left: 200 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleBand()
    .domain(ticketsByQuarterArray.map(xValue))
    .range([0, innerWidth])
    .padding(0.1)

    const yScale = d3.scaleLinear()
    .domain([0, d3.max(ticketsByQuarterArray, yValue)])
    .range([innerHeight, 0])

    const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

    const xAxis = d3.axisBottom(xScale)
    const xAxisG = g.append("g")
    .call(xAxis)
    .attr("transform", `translate(0, ${innerHeight})`)

    xAxisG.select(".domain").remove()
    xAxisG.append("text")
    .attr("class", "axis-label")
    .attr("y", 60)
    .attr("x", innerWidth / 2)
    .attr("fill", "black")

    xAxisG.selectAll("text")
    .attr("transform", "rotate(-45)")
    .attr("text-anchor", "end")

    const yAxis = d3.axisLeft(yScale)
    const yAxisG = g.append("g").call(yAxis)
    yAxisG.select(".domain").remove();

    yAxisG.append("text")
    .attr("class", "axis-label")
    .attr("y", -90)
    .attr("x", -innerHeight / 2)
    .attr("fill", "black")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Tickets Issued");

    g.selectAll("rect")
    .data(ticketsByQuarterArray)
    .enter()
    .append("rect")
    .attr("x", d => xScale(xValue(d)))
    .attr("y", d => yScale(yValue(d)))
    .attr("width", xScale.bandwidth())
    .attr("height", d => innerHeight - yScale(yValue(d)))
    .attr("fill", "steelblue")
    .append("title")
    .text(d => `Tickets: ${d.count}`)
    
    g.append("text")
    .attr("class", "title")
    .attr("y", -10)
    .attr("x", innerWidth / 2)
    .attr("text-anchor", "middle")
    .text("Total Tickets By Quarter In Vancouver")
}

