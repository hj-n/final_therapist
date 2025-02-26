import React, { useRef, useEffect } from "react";


import styles from "./Visualization.module.scss";

import * as d3 from "d3";

const Visualization = (props) => {
	
	const data = props.data;
	const visInfo = props.visInfo;
	const columns = props.columns;

	const width = 700;
	const height = 700;
	const margin = { top: 50, right: 50, bottom: 50, left: 50, middle: 50 };

	const svgRef = useRef();

	let svg11, svg12, svg21, svg22;

	useEffect(() => {
		const svg = d3.select(svgRef.current);


		svg11 = svg.append("g")
			.attr("transform", `translate(${margin.left}, ${margin.top})`);

		svg12 = svg.append("g")
			.attr("transform", `translate(${width / 2 + margin.middle}, ${margin.top})`);

		svg21 = svg.append("g")
			.attr("transform", `translate(${margin.left}, ${height / 2})`);

		svg22 = svg.append("g")
			.attr("transform", `translate(${width / 2 + margin.middle}, ${height / 2})`);


		const drawVisualization = (data, visInfo) => {
			visInfo.forEach((visInfoItem, itr) => {
				// get iteration count

				let currSvg;

				if (itr === 0) {
					currSvg = svg11;
				}
				if (itr === 1) {
					currSvg = svg12;
				}
				if (itr === 2) {
					currSvg = svg21;
				}
				if (itr === 3) {
					currSvg = svg22;
				}

				const visType = visInfoItem.type;
				if (visType === "histogram") {
					drawHistogram(data, visInfoItem.index, currSvg);
				}
				if (visType === "scatter") {
					drawScatterplot(data, visInfoItem.x, visInfoItem.y, currSvg);
				}
			});
		}

		const drawHistogram = (data, index, currSvg) => {

			console.log(data, columns);
			const dataArr = data.map((d) => parseFloat(d[index]));
			const x = d3.scaleLinear()
				.domain([d3.min(dataArr), d3.max(dataArr)])
				.range([0, (width - 3 * margin.middle) / 2]);


			const histogram = d3.bin()
				.domain(x.domain())
				.thresholds(x.ticks(20))
				(dataArr);

			console.log(dataArr);
			console.log(histogram);

			const y = d3.scaleLinear()
				.domain([0, d3.max(histogram, (d) => d.length)])
				.range([(height - margin.middle * 3) / 2, 0]);

			

			const rectG = currSvg.append("g").attr("id", "rectG");

			rectG.selectAll("rect")
				.data(histogram)
				.join("rect")
				.attr("x", (d) => x(d.x0))
				.attr("y", (d) => y(d.length))
				.attr("width", (d) => x(d.x1) - x(d.x0) - 1)
				.attr("height", (d) => (height - margin.middle * 3) / 2 - y(d.length))
				.attr("fill", "steelblue");

			
			currSvg.append("g")
				.attr("transform", `translate(0, ${(height - margin.middle * 3) / 2})`)
				.call(d3.axisBottom(x));

			currSvg.append("g")
				.call(d3.axisLeft(y));

		  // add x label

			currSvg.append("g")
				.append("text")
				.attr("x", (width - 3 * margin.middle) / 4)
				.attr("y", (height - margin.middle * 3) / 2 + margin.middle )
				.attr("text-anchor", "middle")
				.text(columns[index]);

			// add y label (count)

			currSvg.append("g")
				.append("text")
				.attr("transform", `translate(${-margin.left + 7}, ${(height - margin.middle * 3) / 4}) rotate(-90)`)
				.attr("text-anchor", "middle")
				.text("Count");


			// add brushing & filtering where filtered bins are highlighted

			const brushX = d3.brushX()
				.extent([[0, 0], [(width - 3 * margin.middle) / 2, (height - margin.middle * 3) / 2]])
				.on("end", brushed)
				.on("brush", brushed)
			
			currSvg.append("g")
				.call(brushX);
			

			
			function brushed(event) {
				const selection = event.selection;
				if (selection) {
					const [x0, x1] = selection.map(x.invert);

					// highlight the bins
					const highlightBins = histogram.map((d) => {
						if (d.x1 >= x0 && d.x0 <= x1) {
							return true;
						}
						return false;
					});

					rectG.selectAll("rect")
						.attr("fill", (d, i) => {
							if (highlightBins[i]) {
								return "steelblue";
							}
							return "gray";
						});
				}
				else {
					rectG.selectAll("rect")
						.attr("fill", "steelblue");
				}
			}

		}


		const drawScatterplot = (data, xIndex, yIndex, currSvg) => {

			let x = null;
			let y = null;
			if (xIndex !== null) {
				x = d3.scaleLinear()
					.domain([d3.min(data, (d) => parseFloat(d[xIndex])), d3.max(data, (d) => parseFloat(d[xIndex]))])
					.range([0, width / 2 - margin.middle]);

				currSvg.append("g")
					.attr("transform", `translate(0, ${height / 2 - margin.middle})`)
					.call(d3.axisBottom(x));

				
				currSvg.append("g")
					.append("text")
					.attr("x", (width / 4))
					.attr("y", (height / 2 - margin.middle) + margin.middle)
					.attr("text-anchor", "middle")
					.text(columns[xIndex]);

			}
			if (yIndex !== null) {
				y = d3.scaleLinear()
					.domain([d3.min(data, (d) => parseFloat(d[yIndex])), d3.max(data, (d) => parseFloat(d[yIndex]))])
					.range([height / 2 - margin.middle, 0]);

				currSvg.append("g")
					.call(d3.axisLeft(y));
			}

			if (x !== null && y !== null) {

				currSvg.append("g")
					.attr("id", "scatterG")
					.selectAll("circle")
					.data(data)
					.join("circle")
					.attr("cx", (d) => x(parseFloat(d[xIndex])))
					.attr("cy", (d) => y(parseFloat(d[yIndex])))
					.attr("r", 4)
					.attr("fill", "steelblue");

				currSvg.append("g")
					.append("text")
					.attr("transform", `translate(${-margin.left + 12}, ${(height - margin.middle * 3) / 4}) rotate(-90)`)
					.attr("text-anchor", "middle")
					.text(columns[yIndex]);

				// add brush

				const brush = d3.brush()
					.extent([[0, 0], [width / 2 - margin.middle, height / 2 - margin.middle]])
					.on("end", brushed)
					.on("brush", brushed);
				
				currSvg.append("g")
					.call(brush);
				
				function brushed(event) {
					const selection = event.selection;
					if (selection) {
						const [[x0, y1], [x1, y0]] = selection.map((d) => [x.invert(d[0]), y.invert(d[1])]);
						
						console.log(currSvg.select("#scatterG").selectAll("circle"));
						currSvg.select("#scatterG")
							.selectAll("circle")
							.attr("fill", (d) => {
								const dxIndex = parseFloat(d[xIndex]);
								const dyIndex = parseFloat(d[yIndex]);


								if (dxIndex >= x0 && dxIndex <= x1 && dyIndex >= y0 && dyIndex <= y1) {
									
									return "steelblue";
								}
								else {
									return "gray";
								}

							});
					}
					else {
						currSvg.select("#scatterG").selectAll("circle")
							.attr("fill", "steelblue");
					}
				}


			}



			// add x label


			// add y label

		}

		drawVisualization(data, visInfo);

	}, [visInfo])

	return (
		<div className={styles.visualization}>
			<h3>Visualization</h3>
			<div className={styles.chart}>
				<svg width="650" height="650" ref={svgRef}>
				</svg>

				
			</div>
		</div>
	)
}


export default Visualization;
