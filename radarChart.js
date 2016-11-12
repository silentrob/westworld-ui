/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////
	
	// 85,151,175 - Dot color
function RadarChart(id, data, options) {
	var cfg = {
		w: 600,				//Width of the circle
	 	h: 600,				//Height of the circle
	 	margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
	 	levels: 20,				//How many levels or inner circles should there be drawn
	 	opacityArea: 0.35, 	//The opacity of the area of the blob
	 	dotRadius: 4, 			//The size of the colored circles of each blog
	 	opacityCircles: 0.0, 	//The opacity of the circles of each blob
	 	strokeWidth: 2, 		//The width of the stroke around each blob
	 	color: d3.scale.ordinal().range(["#3c8aba"])
	};
	
	//Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var i in options){
			if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	  }
	}
		
	var allAxis = (data[0].map(function(i, j){return i.axis.toUpperCase()})),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
		
	var rScale = d3.scale.linear()
		.range([20, radius])
		.domain([0, 20]);

	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();
	
	//Initiate the radar chart SVG
	var svg = d3.select(id).append("svg")
			.attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
			.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
			.attr("class", "radar"+id);
	//Append a g element		
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
	
	/////////////////////////////////////////////////////////
	////////// Glow filter for some extra pizzazz ///////////
	/////////////////////////////////////////////////////////
	
	//Filter for the outside glow
	var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

	/////////////////////////////////////////////////////////
	/////////////// Draw the Circular grid //////////////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");
	
	//Draw the background circles
	axisGrid.selectAll(".levels")
	  .data(d3.range(1,(cfg.levels+1)).reverse())
	  .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d,i){return radius / cfg.levels*d;})
		.style("stroke", "#435865")
		.style("fill-opacity", cfg.opacityCircles)


	/////////////////////////////////////////////////////////
	//////////////////// Draw the axes //////////////////////
	/////////////////////////////////////////////////////////
	
	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(20) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(20) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "#628194")
		.style("stroke-width", "2px");

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "13px")
		.attr("text-anchor", function(d,i) {
			var pos = Math.round(rScale(20) * Math.cos(angleSlice*i - Math.PI/2));;
			if (pos === 0) {
				return "middle";
			} else if (pos > 0) {
				return "start";
			} else {
				return "end";
			}
		})
		// manually tweak the label positions kinda hacky
		.attr("dy", function(d,i) {
			if (i == 0) {
				// top
				return "-10px";
			} else if (i == 10) {
				// bottom
				return "20px";
			} else if (i == 1 || i == 19) {
				return "-3px";
			} else if (i == 9 || i == 11) {
				// 5/7oclock
				return "10px";
			} else {
				// general bump
				return "3px";	
			}
		})
		.attr("dx", function(d,i) {
			var pos = Math.round(rScale(20) * Math.cos(angleSlice*i - Math.PI/2));
			if (pos === 0) {
				return "0px";
			} else if (pos > 0) {
				return "10px";
			} else {
				return "-10px";
			}
		})
		.attr("x", function(d, i){ return rScale(20) * Math.cos(angleSlice *i - Math.PI/2); })
		.attr("y", function(d, i){ return rScale(20) * Math.sin(angleSlice *i - Math.PI/2); })
		.text(function(d){ return d; })

	// These are the circles on the outside parimiter.
	axis.append("circle")
		.attr("class", "radarEndCircle")
		.attr("r", cfg.dotRadius*1.1)
		.attr("cx", function(d,i){ return rScale(20) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(20) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("stroke", "#3c8aba")
		.style("stroke-width", "2px")
		.style("fill", "#33434d")

	// Inner circle
	axis.append("circle")
		.attr("class", "innerCircle")
		.attr("r", 20)
		.style("stroke", "#3c8aba")
		.style("stroke-width", "2px")
		.style("fill", "#33434d")

	/////////////////////////////////////////////////////////
	///////////// Draw the radar chart blobs ////////////////
	/////////////////////////////////////////////////////////
	
	//The radial line function
	var radarLine = d3.svg.line.radial()
		.interpolate("linear-closed")
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) { return i*angleSlice; });

	//Create a wrapper for the blobs	
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper");
			
	//Append the backgrounds	
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", function(d,i) { return cfg.color(i); })
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.4); 
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.6);	
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
		});
		
	//Create the outlines	
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function(d,i){ return cfg.color(i); })
		.style("fill", "none")
		.style("filter" , "url(#glow)");		
	
	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", function(d,i,j) { return cfg.color(j); })
		.style("fill-opacity", 0.8);
}