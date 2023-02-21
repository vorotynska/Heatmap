const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const margin = {
    top: 80,
    right: 20,
    bottom: 70,
    left: 70
}

const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const colors = ['#012840', '#2F5973', '#6595BF',
    '#91B7D9', '#CEDEF2', '#F2955E',
    '#A65221', '#4F7302', '#274001', '#F20544'
]


const svg = d3.select("body").append("svg")
    .attr("class", "axis")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .style('font-size', '14px')
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

const monthNames = ["January", "February", "March", "April",
    "May", "June", "July", "August", "September", "October", "November", "December"
];

const req = new XMLHttpRequest()

req.open('GET', url, true)
req.onload = () => {
    const data = JSON.parse(req.responseText)
    console.log(data)
    data.monthlyVariance.forEach((d) => {
        var parseTime = d3.timeFormat("%Y");
        d.month = monthNames[d.month - 1];
        // d.year = +d.year;
        d.year = parseTime(new Date(d.year, 0));
        d.variance = d.variance;
    });



    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(d3.map(data.monthlyVariance, d => d.year));

    const yScale = d3.scaleBand()
        .range([0, height])
        .domain(monthNames);

    // ! Introducing x axis
    const xAxisG = svg
        .append("g")
        .call(
            d3
            .axisBottom(xScale)
            .tickValues(
                xScale.domain().filter(function (d, i) {
                    return !(d % 10);
                })
            )
            .tickSizeOuter(0)
        )
        .attr("class", "forColoring")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + height + ")")

    const yAxisG = svg
        .append("g")
        .attr("class", "forColoring")
        .attr("id", "y-axis")
        .call(d3.axisLeft(yScale).tickSizeOuter(0));

    const myColor = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([1, 100]);

    const min = d3.min(data.monthlyVariance.map(d => d.variance));
    const max = d3.max(data.monthlyVariance.map(d => d.variance));
    const colorScale = d3.scaleQuantile()
        .domain([min + 8.66, max + 8.66])
        .range(colors);

    const tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .attr('id', 'tooltip')
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")


    const mouseover = function (e, d) {
        tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }

    const mousemove = function (e, d) {
        tooltip
            .html("<b>" + d.year + "</b>" +
                "<br>" + (baseTemp + d.variance).toFixed(3) + " °C" +
                "<br>" + d.variance.toFixed(3) + " °C")
            .style("left", (e.xScale) / 2 + "px")
            .style("top", (e.yScale) / 2 + "px")
            .attr("data-year", d.year)
    }

    const mouseleave = function (e, d) {
        tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }



    const baseTemp = 8.66

    svg.selectAll()
        .data(data.monthlyVariance, function (d) {
            return d.year + ':' + d.month;
        })
        .join('rect')
        .attr('class', 'cell')
        .attr("x", function (d) {
            return xScale(d.year)
        })
        .attr("y", function (d) {
            return yScale(d.month)
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", function (d) {
            return colorScale(d.variance + baseTemp);

        })
        .attr("data-month", (d) => monthNames.indexOf(d.month))
        .attr("data-year", (d) => d.year)
        .attr("data-temp", (d) => baseTemp + d.variance)
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)


    svg.append("text")
        .attr('id', 'title')
        .attr("x", 0)
        .attr("y", -45)
        .attr("text-anchor", "center")
        .style("font-size", "30px")
        .text("Monthly Global Land-Surface Temperature");

    svg.append("text")
        .attr('id', 'description')
        .attr("x", 0)
        .attr("y", -15)
        .attr("text-anchor", "left")
        .style("font-size", "20px")
        .style("fill", "grey")
        .text("1753 - 2015: base temperature 8.66℃");

    //LEGEND
    const leg = [0, 2.8, 4, 5.1, 6.2, 7.3, 8.4, 9.5, 10.6, 11.7, 12.8];

    const legendTable = d3.select('svg')

    const rectWidth = 30

    const legend = legendTable.selectAll('.legend')
        .data(leg)
        .enter().append('g')
        .attr('class', "legend")
        .attr('id', "legend")


    legend.append('rect')
        .attr("x", (d, i) => margin.left + (rectWidth * i))
        .attr("y", function (d, i) {
            return height + 100;
        })
        .attr("width", rectWidth)
        .attr("height", 20)
        .style("fill", (d) => {
            return colorScale(d)
        });

    legend.append('text')
        .attr("x", (d, i) => margin.left + (rectWidth * i))
        .attr("y", function (d, i) {
            return height + 135;
        })
        .text((d) => d.toString())


}
req.send()