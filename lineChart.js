const renderLineChart = (ticketData, width, height) => {
    width = window.innerWidth * 0.8
    height = 0.5 * width
    //resize svg
    svg.attr("width", width)
    .attr("height", height)

    const xValue = d => d.Year
    const xAxisLabel = "Year";
    const yValue = y => y.Count
    const yAxisLabel = "Tickets Issued";
    const title = `Tickets Issued In Past 5 Years In Vancouver`
    const margin = { top: 60, right: 40, bottom: 90, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const ticketsPerYear = d3.group(ticketData, d => d.Year)
    const ticketsPerYearArray = Array.from(ticketsPerYear, ([year, tickets]) => ({
        Year: new Date(+year, 0 , 1),
        Count: tickets.length
    })).sort((a,b) => a.Year - b.Year);

    const xScale = d3.scaleTime()
    .domain(d3.extent(ticketsPerYearArray, xValue))
    .range([0, innerWidth])
    .nice();

    const yScale = d3.scaleLinear()
    .domain(d3.extent(ticketsPerYearArray, yValue))
    .range([innerHeight, 0])
    .nice();

    const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.right})`);

    const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(15);

    const xAxisG = g.append("g")
    .call(xAxis)
    .attr("transform", `translate(0, ${innerHeight})`);

    xAxisG.select(".domain").remove();

    xAxisG.append("text")
    .attr("class", "axis-label")
    .attr("y", 75)
    .attr("x", innerWidth / 2)
    .attr("fill", "black")
    .text(xAxisLabel);

    const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(10);

    const yAxisG = g.append("g").call(yAxis);

    yAxisG.select(".domain").remove();

    yAxisG.append("text")
    .attr("class", "axis-label")
    .attr("y", -90)
    .attr("x", -innerHeight / 2)
    .attr("fill", "black")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text(yAxisLabel)

    const lineGenerator = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(yValue(d)))
    .curve(d3.curveBasis);

    g.append("path")
    .attr("class", "line-path")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", lineGenerator(ticketsPerYearArray));

    g.selectAll(".data-point-label")
        .data(ticketsPerYearArray)
        .enter()
        .append("text")
        .attr("class", "data-point-label")
        .attr("x", d => xScale(xValue(d)))
        .attr("y", d => yScale(yValue(d)) - 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(d => d.Count);

    g.append("text")
    .attr("class", "title")
    .attr("y", -10)
    .text(title);
};