/*-------------------------------------- Map Chart --------------------------------------*/
// const viewBoxWidth = 960;
// const viewBoxHeight = 500;
const renderMap = (streetData, cleanedStreetData, ticketData, width, height) => {
    mapDescription()
    width = window.innerWidth * 0.8
    height = 0.5 * width
    svg
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", "100%")
    .attr("height", "100%");

    const projection = d3.geoMercator().fitSize([width, height], streetData)
    const pathGenerator = d3.geoPath().projection(projection)

    //Draw street map
    svg.selectAll("path")
        .data(cleanedStreetData)
        .enter()
        .append("path")
        .attr("class", "street")
        .attr("d", pathGenerator)

    const cleanedTicketData = ticketData.filter(ticket => {
        let newData = {}
        if (ticket.Year === "2023") {
            ticketData.columns.forEach(column => {
                newData[column] = ticket[column]
            })
            newData["BI_ID"] = +ticket["BI_ID"]
            newData["Block"] = +ticket["Block"]
            newData["Bylaw"] = +ticket["Bylaw"]
            newData["Year"] = +ticket["Year"]
            return newData
        }
    })

    const groupedTickets = d3.group(cleanedTicketData, d => d.Street, d => d.Block);
    const ticketCounts = [];

    groupedTickets.forEach((blocks, street) => {
        blocks.forEach((tickets, block) => {
            ticketCounts.push({
                street,
                block,
                count: tickets.length
            });
        });
    });

    svg.selectAll(".street")
        .classed("highlight", (d) => {
            const street = d.properties.std_street;
            const block = d.properties.from_hundred_block;

            return ticketCounts.some(t =>
                t.street === street && +t.block === +block
            );
        });

    const ticketCountMap = new Map();

    ticketCounts.forEach(({ street, block, count }) => {
        ticketCountMap.set(`${street}_${block}`, count);
    });

    const maxCount = d3.max(ticketCounts, d => d.count)
    const minCount = d3.min(ticketCounts, d => d.count)

    const colorScale = d3.scaleSequentialLog()
        .domain([minCount, maxCount * 0.8])
        .interpolator(d3.interpolateYlOrRd)
        .clamp(true);

    svg.selectAll(".street")
        .attr("fill", d => {
            const street = d.properties.std_street;
            const block = d.properties.from_hundred_block;
            const count = ticketCountMap.get(`${street}_${block}`) || 0;
            return colorScale(count);
        })
        .attr("stroke", "#999")
        .attr("stroke-width", 1);

    svg.selectAll(".street")
        .append("title")
        .text(d => {
            const street = d.properties.std_street;
            const block = d.properties.from_hundred_block;
            const count = ticketCountMap.get(`${street}_${block}`) || 0;
            return `${street} Block ${block}: ${count} tickets`;
        });
}
