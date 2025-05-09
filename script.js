/* 
Columns: [
"Block"
"Street"
"EntryDate"
"Bylaw"
"Section"
"Status"
"InfractionText"
"Year"
"BI_ID"
]
In street dataset, it uses AV for avenue, but in ticket dataset, it uses AVE for abbreviation.
So, I decided to rename AV in the street dataset with AVE.

Parse year and entryDate to float and instantiate Date object when needed
*/

let streetMap;
let cleanedStreetData;
let ticketData;
const yearFilter = d3.select("#year-filter")
const streetFilter = d3.select("#street-filter")
const width = window.innerWidth * 0.8
const height = width * 0.5
const svg = d3.select("svg")
const chartButtons = d3.selectAll(".toggle-btn")
const contextDescription = document.getElementById("context-description")

// load data
const loadData = () => {
    Promise.all(
        [
            d3.dsv(";", "./datasets/parking-tickets.csv"),
            d3.json("./datasets/lanes.geojson")
        ]
    ).then(([loadedTicketData, loadedStreetData]) => {
        streetMap = loadedStreetData
        ticketData = loadedTicketData

        //data cleaning - replacing AV with AVE in street dataset
        cleanedStreetData = streetMap.features.map(street => {
            return {
                ...street,
                properties: {
                    ...street.properties,
                    std_street: street.properties.std_street.replace(/\bAV\b/, "AVE").replace(/\./g, "")
                }
            }
        })

        //year dropdown list
        const years = Array.from(new Set(ticketData.map(ticket => ticket.Year)))
        .sort((a, b)=> a - b)
        
        yearFilter
            .selectAll("option.year-option")
            .data(years)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d);

        //year onChangeListener
        yearFilter.on("change", function () {
            const selectedYear = this.value;
            // clear svg
            svg.selectAll("*").remove();
            const filterYearData = selectedYear === "All" ? ticketData :
                ticketData.filter(ticket => ticket.Year === selectedYear)
            
            renderChart(filterYearData)
        });
        //line chart
        renderLineChart(ticketData, width, height)
    })
}
loadData()

window.addEventListener("resize", () => {
    //reser year filter to All
    yearFilter.property("value", "All")
    // clear svg
    svg.selectAll("*").remove();
    renderChart(ticketData)
})

chartButtons.on("click", function() {
    //reser year filter to All
    yearFilter.property("value", "All")
    // clear svg
    svg.selectAll("*").remove();
    // handle active button
    chartButtons.classed("active", false)
    d3.select(this).classed("active", true)
    renderChart(ticketData);
})

const renderChart = (ticketData) => {
    //get current active button id
    const clickedId = document.querySelector(".toggle-btn.active").id
    if(clickedId === "line-chart-btn"){
        renderLineChart(ticketData, width, height)
    }else if(clickedId === "map-chart-btn"){
        renderMap(streetMap, cleanedStreetData, ticketData, width, height)
    }else if(clickedId === "bar-chart-btn"){
        renderBarChart(ticketData, width, height)
    }
}

const lineChartDescription = () => {
    contextDescription.innerHTML = `
        This line chart shows the number of parking tickets issued each year in Vancouver.
        A rising trend may indicate stricter enforcement or increased population,
        while a dip could suggest policy changes or external factors like the pandemic.`;
}

const mapDescription = () => {
    contextDescription.innerHTML = `This map visualizes the distribution 
    of parking tickets across Vancouver streets. Streets highlighted with 
    deeper colors represent areas with a higher concentration of tickets. 
    Use this view to identify hotspots for parking enforcement and potential 
    areas with stricter regulations or higher vehicle activity`
}

const barChartDescription = () => {
    contextDescription.innerHTML = `This bar chart displays the total number 
    of parking tickets issued in Vancouver, grouped by quarter. It helps identify 
    seasonal patterns in ticketing activity—such as spikes during certain 
    months—and observe how enforcement trends have changed over time`
}