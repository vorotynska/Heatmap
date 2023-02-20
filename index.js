const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const margin = {
    top: 50,
    right: 20,
    bottom: 70,
    left: 70
}

const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("body").append("svg")
    .attr("class", "axis")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
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


    const mouseover = function (event, d) {
        tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }

    const mousemove = function (event, d) {
        tooltip
            .html("The exact value of<br>this cell is: " + d.variance)
            .style("left", (event.xScale) / 2 + "px")
            .style("top", (event.yScale) / 2 + "px")
            .attr("data-year", d.year)
    }

    const mouseleave = function (event, d) {
        tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

    const color = d3.scaleOrdinal()
        .range(d3.schemeCategory10
            .map(function (c) {
                c = d3.rgb(c);
                c.opacity = 0.7;
                return c;
            }));

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
            return color(d.variance)

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
        .attr("y", -20)
        .attr("text-anchor", "center")
        .style("font-size", "22px")
        .text("Monthly Global Land-Surface Temperature");

    svg.append("text")
        .attr('id', 'description')
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .text("1753 - 2015: base temperature 8.66℃");

}
req.send()