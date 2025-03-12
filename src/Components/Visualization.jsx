import React, { useRef, useEffect } from "react";
import styles from "./Visualization.module.scss";
import * as d3 from "d3";

const Visualization = (props) => {
	const data = props.data;
	const visInfo = props.visInfo;
	const setVisInfo = props.setVisInfo;
	const columns = props.columns;

	const width = 700;
	const height = 700;
	// 전체 svg의 외부 여백은 그대로 사용하고,
	// 각 subplot(차트) 내부에 라벨을 위한 여백을 따로 지정합니다.
	const outerMargin = { top: 0, right: 20, bottom: 20, left: 20, middle: 20 };
	// 각 subplot 내부의 여백 (라벨 등 표시를 위해 넉넉하게)
	const subMargin = { top: 40, right: 40, bottom: 60, left: 60 };

	// 2 x 2 그리드이므로 각 subplot의 전체 크기
	const subWidth = width / 2;
	const subHeight = height / 2;
	// 각 차트 내부 영역 크기
	const innerWidth = subWidth - subMargin.left - subMargin.right;
	const innerHeight = subHeight - subMargin.top - subMargin.bottom;


	const brushingInfo = {
		0: new Array(data.length).fill(true),
		1: new Array(data.length).fill(true),
		2: new Array(data.length).fill(true),
		3: new Array(data.length).fill(true)
	}

	const svgRef = useRef();

	let svg11, svg12, svg21, svg22;

	useEffect(() => {
		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove();

		// add svg/xmarks file in the right corner



		// 각 subplot의 그룹을 생성할 때, 외부 margin과 subplot 내부 margin을 반영합니다.
		svg11 = svg.append("g")
			.attr("transform", `translate(${outerMargin.left + subMargin.left}, ${outerMargin.top + subMargin.top})`);

		svg12 = svg.append("g")
			.attr("transform", `translate(${subWidth + outerMargin.middle + subMargin.left}, ${outerMargin.top + subMargin.top})`);

		svg21 = svg.append("g")
			.attr("transform", `translate(${outerMargin.left + subMargin.left}, ${subHeight + outerMargin.middle + subMargin.top})`);

		svg22 = svg.append("g")
			.attr("transform", `translate(${subWidth + outerMargin.middle + subMargin.left}, ${subHeight + outerMargin.middle + subMargin.top})`);

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

				currSvg.append("image")
					.attr("xlink:href", "./svgs/xmark.svg")
					.attr("width", 30)
					.attr("height", 30)
					.attr("x", innerWidth + outerMargin.right - 35)
					.attr("y", -10)
					.style("cursor", "pointer")
					.on("click", () => {
						const currVisInfo = [...visInfo];
						currVisInfo.splice(itr, 1);
						props.setVisInfo(currVisInfo);
					});

				if (visType === "histogram") {
					drawHistogram(data, visInfoItem.index, currSvg);
				}
				if (visType === "scatter") {
					drawScatterplot(data, visInfoItem.x, visInfoItem.y, currSvg);
				}
			});
		};

		const brushLinkVisualizations = (brushingInfo) => {

			const isBrushed = new Array(data.length).fill(false);

			data.forEach((d, idx) => {
				if (brushingInfo[0][idx] && brushingInfo[1][idx] && brushingInfo[2][idx] && brushingInfo[3][idx]) {
					isBrushed[idx] = true;
				}
			});

			// [0, 1, 2, 3].forEach((iidx) => {
			// 	brushingInfo[iidx].forEach((d, idx) => {
			// 		if (d) {
			// 			isBrushed[idx] = true;
			// 		}
			// 	});
			// });
			const brushedSvg = [svg11, svg12, svg21, svg22];
			console.log(brushedSvg);
			console.log(visInfo);
			brushedSvg.forEach((currSvg, itr) => {
				if (visInfo.length <= itr) {
					return;
				}
				const visInfoItem = visInfo[itr];
				const visType = visInfoItem.type;
				const visIndex = visInfoItem.index;
				if (visType === "scatter") {
					const scatterG = currSvg.select("#scatterG");
					scatterG.selectAll("circle")
						.attr("fill", (d, idx) => {
							return isBrushed[idx] ? "steelblue" : "gray";
					});
				}
				else {
					const rectG = currSvg.select("#rectG");
					const dataArr = data.map(d => parseFloat(d[visIndex]));

					const x = d3.scaleLinear()
						.domain([d3.min(dataArr), d3.max(dataArr)])
						.range([0, innerWidth]);

					const histogram = d3.bin()
						.domain(x.domain())
						.thresholds(x.ticks(20))
						(dataArr);

					// if isBrushed dataARr points is included in each bin of the histogram, fill it with steelblue
					const isHistogramBrusehd = new Array(histogram.length).fill(false);
					dataArr.forEach((d, idx) => {
						if (isBrushed[idx]) {
							histogram.forEach((bin, binIdx) => {
								if (d >= bin.x0 && d <= bin.x1) {
									isHistogramBrusehd[binIdx] = true;
								}
							});
						}

					});

					rectG.selectAll("rect")
						.attr("fill", (d, idx) => {
							return isHistogramBrusehd[idx] ? "steelblue" : "gray";
						});
				}
			})
		}

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

			// x축 라벨 (x축 바로 아래)
			currSvg.append("text")
				.attr("x", innerWidth / 2)
				.attr("y", innerHeight + subMargin.bottom - 20)
				.attr("text-anchor", "middle")
				.text(columns[index]);

			// y축 라벨 (왼쪽, 회전)
			currSvg.append("text")
				.attr("transform", "rotate(-90)")
				.attr("x", -innerHeight / 2)
				.attr("y", -subMargin.left + 20)
				.attr("text-anchor", "middle")
				.text("Count");

			// 브러시 설정
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

					const isBrushed = data.map(d => {
						const dx = parseFloat(d[index]);
						return (dx >= x0 && dx <= x1);
					});
					isBrushed.forEach((d, idx) => {
						brushingInfo[index][idx] = d;
					});

					brushLinkVisualizations(brushingInfo);

					// rectG.selectAll("rect")
					// 	.attr("fill", d => (d.x1 >= x0 && d.x0 <= x1) ? "steelblue" : "gray");
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
					.attr("y", innerHeight + subMargin.bottom - 20)
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
					.attr("transform", "rotate(-90)")
					.attr("x", -innerHeight / 2)
					.attr("y", -subMargin.left + 20)
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
						const isBrushed = data.map(d => {
							const dx = parseFloat(d[xIndex]);
							const dy = parseFloat(d[yIndex]);
							return (dx >= x0 && dx <= x1 && dy >= y0 && dy <= y1);
						});
						isBrushed.forEach((d, idx) => {
							brushingInfo[0][idx] = d;
						});
						brushLinkVisualizations(brushingInfo);
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
			<h3>{"Annotate on Visualizations"}</h3>
			<div className={styles.chart}>
				<svg width={width} height={height} ref={svgRef}></svg>
			</div>
		</div>
	);
};

export default Visualization;
