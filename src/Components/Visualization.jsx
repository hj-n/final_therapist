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

	// 공통 inner width/height 정의 (예: 275)
	const innerWidth = (width - 3 * margin.middle) / 2;
	const innerHeight = (height - 3 * margin.middle) / 2;

	const svgRef = useRef();

	let svg11, svg12, svg21, svg22;

	useEffect(() => {
		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove();

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
				let currSvg;
				if (itr === 0) {
					currSvg = svg11;
				} else if (itr === 1) {
					currSvg = svg12;
				} else if (itr === 2) {
					currSvg = svg21;
				} else if (itr === 3) {
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
		};

		const drawHistogram = (data, index, currSvg) => {
			const dataArr = data.map(d => parseFloat(d[index]));

			const x = d3.scaleLinear()
				.domain([d3.min(dataArr), d3.max(dataArr)])
				.range([0, innerWidth]);

			const histogram = d3.bin()
				.domain(x.domain())
				.thresholds(x.ticks(20))
				(dataArr);

			const y = d3.scaleLinear()
				.domain([0, d3.max(histogram, d => d.length)])
				.range([innerHeight, 0]);

			const rectG = currSvg.append("g").attr("id", "rectG");

			rectG.selectAll("rect")
				.data(histogram)
				.join("rect")
				.attr("x", d => x(d.x0))
				.attr("y", d => y(d.length))
				.attr("width", d => x(d.x1) - x(d.x0) - 1)
				.attr("height", d => innerHeight - y(d.length))
				.attr("fill", "steelblue");

			// x축
			currSvg.append("g")
				.attr("transform", `translate(0, ${innerHeight})`)
				.call(d3.axisBottom(x));

			// y축
			currSvg.append("g")
				.call(d3.axisLeft(y));

			// x축 레이블
			currSvg.append("text")
				.attr("x", innerWidth / 2)
				.attr("y", innerHeight + margin.middle)
				.attr("text-anchor", "middle")
				.text(columns[index]);

			// y축 레이블
			currSvg.append("text")
				.attr("transform", `translate(${-margin.left + 7}, ${innerHeight / 2}) rotate(-90)`)
				.attr("text-anchor", "middle")
				.text("Count");

			// 브러시 (brush) 설정
			const brushX = d3.brushX()
				.extent([[0, 0], [innerWidth, innerHeight]])
				.on("end", brushed)
				.on("brush", brushed);

			currSvg.append("g")
				.call(brushX);

			function brushed(event) {
				const selection = event.selection;
				if (selection) {
					const [x0, x1] = selection.map(x.invert);
					rectG.selectAll("rect")
						.attr("fill", d => (d.x1 >= x0 && d.x0 <= x1) ? "steelblue" : "gray");
				} else {
					rectG.selectAll("rect").attr("fill", "steelblue");
				}
			}
		};

		const drawScatterplot = (data, xIndex, yIndex, currSvg) => {
			let x = null;
			let y = null;
			if (xIndex !== null) {
				x = d3.scaleLinear()
					.domain([d3.min(data, d => parseFloat(d[xIndex])), d3.max(data, d => parseFloat(d[xIndex]))])
					.range([0, innerWidth]);

				currSvg.append("g")
					.attr("transform", `translate(0, ${innerHeight})`)
					.call(d3.axisBottom(x));

				currSvg.append("text")
					.attr("x", innerWidth / 2)
					.attr("y", innerHeight + margin.middle)
					.attr("text-anchor", "middle")
					.text(columns[xIndex]);
			}
			if (yIndex !== null) {
				y = d3.scaleLinear()
					.domain([d3.min(data, d => parseFloat(d[yIndex])), d3.max(data, d => parseFloat(d[yIndex]))])
					.range([innerHeight, 0]);

				currSvg.append("g")
					.call(d3.axisLeft(y));

				currSvg.append("text")
					.attr("transform", `translate(${-margin.left + 12}, ${innerHeight / 2}) rotate(-90)`)
					.attr("text-anchor", "middle")
					.text(columns[yIndex]);
			}
			if (x !== null && y !== null) {
				const scatterG = currSvg.append("g").attr("id", "scatterG");

				scatterG.selectAll("circle")
					.data(data)
					.join("circle")
					.attr("cx", d => x(parseFloat(d[xIndex])))
					.attr("cy", d => y(parseFloat(d[yIndex])))
					.attr("r", 4)
					.attr("fill", "steelblue");

				const brush = d3.brush()
					.extent([[0, 0], [innerWidth, innerHeight]])
					.on("end", brushed)
					.on("brush", brushed);

				currSvg.append("g")
					.call(brush);

				function brushed(event) {
					const selection = event.selection;
					if (selection) {
						const [[x0, y1], [x1, y0]] = selection.map(d => [x.invert(d[0]), y.invert(d[1])]);
						scatterG.selectAll("circle")
							.attr("fill", d => {
								const dx = parseFloat(d[xIndex]);
								const dy = parseFloat(d[yIndex]);
								return (dx >= x0 && dx <= x1 && dy >= y0 && dy <= y1) ? "steelblue" : "gray";
							});
					} else {
						scatterG.selectAll("circle").attr("fill", "steelblue");
					}
				}
			}
		};

		drawVisualization(data, visInfo);
	}, [visInfo, data, columns]);

	return (
		<div className={styles.visualization}>
			<h3>Visualization</h3>
			<div className={styles.chart}>
				<svg width="650" height="650" ref={svgRef}></svg>
			</div>
		</div>
	);
};

export default Visualization;
