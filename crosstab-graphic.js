
d3.dsv(",", "board_games.csv", function(d) {
    return {
        source: d.source,
        target: d.target,
        value: +d.value
    }
}).then(function(data) {

    var links = data;

    var nodes = {};

    // compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, degree: 0});
        link.target = nodes[link.target] || (nodes[link.target] = {name: link.target, degree: 0});
    });

    var width = 1200,
        height = 700;

    var force = d3.forceSimulation()
        .nodes(d3.values(nodes))
        .force("link", d3.forceLink(links).distance(100))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody().strength(-250))
        .alphaTarget(1)
        .on("tick", tick);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // add the links
    var path = svg.append("g")
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("class", function(d) { if (d.value) { return "link"; } else { return "similarLink"; }; });

    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("dblclick", function(d) {d.fixed = false; d.fx = null; d.fy = null;});

    // create colors for the nodes
    var colors = d3.scaleSequential()
        .domain([1,10])
        .interpolator(d3.interpolateYlGnBu)

    // add the nodes
    var minRadius = 5;
    node.append("circle")
        .attr("id", function(d){
            return (d.name.replace(/\s+/g,'').toLowerCase());
        })
        .attr("r", function(d) {   
            d.degree = path.filter(function(p) {
              return p.source.index == d.index || p.target.index == d.index
            }).size();
            return minRadius + ((0.5 * d.degree) ** 2);
        });

    // add the node labels
    node.append("text")
        .text(function(d){
            return (d.name);
        })
        .attr("x", function(d){
            return (minRadius + ((0.5 * d.degree) ** 2));
        })
        .attr("y", function(d){
            return -(minRadius + ((0.5 * d.degree) ** 2));
        });

    // add the curvy lines
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });
        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; 
            }).attr("fill", function(d) {
                return d.fixed ? "yellow" : colors(d.degree);
            });
    };

    function dragstarted(d) {
        if (!d3.event.active) force.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    };

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    };

    function dragended(d) {
        if (!d3.event.active) force.alphaTarget(0);
        d.fixed = true;
        if (d.fixed == true) {
            d.fx = d.x;
            d.fy = d.y;
        }
        else {
            d.fx = null;
            d.fy = null;
        }
    };

    svg.append("text")
        .attr("id", "credit")
        .text("sparker33")
        .attr("x", width)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .attr("class", "credit")
  
}).catch(function(error) {
  console.log(error);
});