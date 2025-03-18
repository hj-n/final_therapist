import React, { useRef, useEffect, useState, use } from "react";
import styles from "./Visualization.module.scss";
import * as d3 from "d3";

import { annotatedData, setAnnotatedData } from "../Logic/_createQuestions";

const Visualization = (props) => {
	const data = props.data;
	const visInfo = props.visInfo;
	const setVisInfo = props.setVisInfo;
	const columns = props.columns;
	const clearSelections = props.clearSelections;
	const triggerVis = props.triggerVis;

	const width = 700;
	const height = 700;

	// 외부 여백
	const outerMargin = { top: 0, right: 20, bottom: 20, left: 20, middle: 20 };
	// 각 차트 내부 여백
	const subMargin = { top: 40, right: 40, bottom: 60, left: 60 };

	// 2 x 2 그리드이므로 각 subplot 크기
	const subWidth = width / 2;
	const subHeight = height / 2;

	// 실제 차트가 그려질 내부 크기
	const innerWidth = subWidth - subMargin.left - subMargin.right;
	const innerHeight = subHeight - subMargin.top - subMargin.bottom;

	// 브러싱 활성 여부 저장용 (기존 코드의 brushingInfo 개념)
	const brushingInfo = {
		0: new Array(data.length).fill(true),
		1: new Array(data.length).fill(true),
		2: new Array(data.length).fill(true),
		3: new Array(data.length).fill(true),
	};

	// ====== 브러싱 상태를 저장할 로컬 스테이트 추가 ======
	// 각 서브플롯(0,1,2,3)에 대해 다음 정보를 저장:
	// - brushedPoints: 브러시된 데이터 인덱스 배열
	// - attribute: 어떤 속성(열)을 기준으로 브러시했는지 (히스토그램일 때는 1개, 스캐터플롯이면 2개)
	// - range: 브러싱된 범위
	// - domain: 해당 속성(들)의 원본 데이터 전체 범위
	const [brushState, setBrushState] = useState({
		0: { brushedPoints: [], attribute: null, range: null, domain: null },
		1: { brushedPoints: [], attribute: null, range: null, domain: null },
		2: { brushedPoints: [], attribute: null, range: null, domain: null },
		3: { brushedPoints: [], attribute: null, range: null, domain: null },
	});

	console.log("RENDERING")
	useEffect(() => {
		console.log("TESTtesT")
		setAnnotatedData(JSON.parse(JSON.stringify(brushState)));
		console.log(annotatedData);
	}, [brushState]);

	const svgRef = useRef();

	let svg11, svg12, svg21, svg22;

	useEffect(() => {
		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove();

		svg11 = svg
			.append("g")
			.attr(
				"transform",
				`translate(${outerMargin.left + subMargin.left}, ${outerMargin.top + subMargin.top
				})`
			);

		svg12 = svg
			.append("g")
			.attr(
				"transform",
				`translate(${subWidth + outerMargin.middle + subMargin.left}, ${outerMargin.top + subMargin.top
				})`
			);

		svg21 = svg
			.append("g")
			.attr(
				"transform",
				`translate(${outerMargin.left + subMargin.left}, ${subHeight + outerMargin.middle + subMargin.top
				})`
			);

		svg22 = svg
			.append("g")
			.attr(
				"transform",
				`translate(${subWidth + outerMargin.middle + subMargin.left}, ${subHeight + outerMargin.middle + subMargin.top
				})`
			);

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

				// xmark 아이콘 (차트 삭제)
				currSvg
					.append("image")
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
					drawHistogram(data, visInfoItem.index, currSvg, itr);
				}
				if (visType === "scatter") {
					drawScatterplot(data, visInfoItem.x, visInfoItem.y, currSvg, itr);
				}
			});
		};

		// 브러시 연동 함수
		const brushLinkVisualizations = (brushingInfo) => {
			const isBrushed = new Array(data.length).fill(false);

			// 모든 subplot(0,1,2,3)에서 해당 데이터가 true(브러싱됨)인 경우만 최종 true
			data.forEach((_, idx) => {
				if (
					brushingInfo[0][idx] &&
					brushingInfo[1][idx] &&
					brushingInfo[2][idx] &&
					brushingInfo[3][idx]
				) {
					isBrushed[idx] = true;
				}
			});

			const brushedSvg = [svg11, svg12, svg21, svg22];
			brushedSvg.forEach((currSvg, itr) => {
				if (visInfo.length <= itr) {
					return;
				}
				const visInfoItem = visInfo[itr];
				const visType = visInfoItem.type;
				const visIndex = visInfoItem.index;

				if (visType === "scatter") {
					const scatterG = currSvg.select("#scatterG");
					scatterG.selectAll("circle").attr("fill", (d, idx) => {
						return isBrushed[idx] ? "steelblue" : "gray";
					});
				} else if (visType === "histogram") {
					const rectG = currSvg.select("#rectG");
					const dataArr = data.map((d) => parseFloat(d[visIndex]));

					const x = d3
						.scaleLinear()
						.domain([d3.min(dataArr), d3.max(dataArr)])
						.range([0, innerWidth]);

					const histogram = d3
						.bin()
						.domain(x.domain())
						.thresholds(x.ticks(20))(dataArr);

					const isHistogramBrushed = new Array(histogram.length).fill(false);

					dataArr.forEach((val, idx) => {
						if (isBrushed[idx]) {
							histogram.forEach((bin, binIdx) => {
								if (val >= bin.x0 && val <= bin.x1) {
									isHistogramBrushed[binIdx] = true;
								}
							});
						}
					});

					rectG.selectAll("rect").attr("fill", (d, idx) => {
						return isHistogramBrushed[idx] ? "steelblue" : "gray";
					});
				}
			});
		};

		// 히스토그램 그리기
		const drawHistogram = (data, index, currSvg, itr) => {
			const dataArr = data.map((d) => parseFloat(d[index]));

			const minVal = d3.min(dataArr);
			const maxVal = d3.max(dataArr);

			const x = d3.scaleLinear().domain([minVal, maxVal]).range([0, innerWidth]);

			const histogram = d3
				.bin()
				.domain(x.domain())
				.thresholds(x.ticks(20))(dataArr);

			const y = d3
				.scaleLinear()
				.domain([0, d3.max(histogram, (d) => d.length)])
				.range([innerHeight, 0]);

			const rectG = currSvg.append("g").attr("id", "rectG");

			rectG
				.selectAll("rect")
				.data(histogram)
				.join("rect")
				.attr("x", (d) => x(d.x0))
				.attr("y", (d) => y(d.length))
				.attr("width", (d) => x(d.x1) - x(d.x0))
				.attr("height", (d) => innerHeight - y(d.length))
				.attr("fill", "steelblue");

			// x축
			currSvg
				.append("g")
				.attr("transform", `translate(0, ${innerHeight})`)
				.call(d3.axisBottom(x));

			// y축
			currSvg.append("g").call(d3.axisLeft(y));

			// x축 라벨
			currSvg
				.append("text")
				.attr("x", innerWidth / 2)
				.attr("y", innerHeight + subMargin.bottom - 20)
				.attr("text-anchor", "middle")
				.text(columns[index]);

			// y축 라벨
			currSvg
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("x", -innerHeight / 2)
				.attr("y", -subMargin.left + 20)
				.attr("text-anchor", "middle")
				.text("Count");

			// 브러시 설정
			const brushX = d3
				.brushX()
				.extent([
					[0, 0],
					[innerWidth, innerHeight],
				])
				.on("end", brushed)
				.on("brush", brushed);

			currSvg.append("g").call(brushX);

			// 브러시 이벤트
			function brushed(event) {
				clearSelections();
				const selection = event.selection;

				if (selection) {
					const [x0, x1] = selection.map(x.invert);

					// brushingInfo 업데이트
					const isBrushedArr = data.map((rowData) => {
						const dx = parseFloat(rowData[index]);
						return dx >= x0 && dx <= x1;
					});
					isBrushedArr.forEach((d, i) => {
						brushingInfo[itr][i] = d;
					});

					// ====== brushState 업데이트 ======
					const brushedPoints = isBrushedArr
						.map((flag, idx) => (flag ? idx : null))
						.filter((v) => v !== null);

					setBrushState((prev) => {
						const newState = { ...prev };
						newState[itr] = {
							brushedPoints,
							attribute: columns[index], // 어떤 열로 브러시가 이루어졌는지
							range: [x0, x1], // 히스토그램이므로 1차원 범위
							domain: [minVal, maxVal], // 원본 데이터 전체 범위
						};
						return newState;
					});

					// 다른 차트에 링크
					brushLinkVisualizations(brushingInfo);
				} else {
					// 브러시 영역 해제 시
					rectG.selectAll("rect").attr("fill", "steelblue");

					// brushingInfo 초기화
					brushingInfo[itr] = new Array(data.length).fill(true);

					// brushState도 초기화
					setBrushState((prev) => {
						const newState = { ...prev };
						newState[itr] = {
							brushedPoints: [],
							attribute: columns[index],
							range: null,
							domain: [minVal, maxVal],
						};
						return newState;
					});

					brushLinkVisualizations(brushingInfo);
				}
			}
		};

		// 스캐터플롯 그리기
		const drawScatterplot = (data, xIndex, yIndex, currSvg, itr) => {
			// x축 domain
			const xMin = d3.min(data, (d) => parseFloat(d[xIndex]));
			const xMax = d3.max(data, (d) => parseFloat(d[xIndex]));
			// y축 domain
			const yMin = d3.min(data, (d) => parseFloat(d[yIndex]));
			const yMax = d3.max(data, (d) => parseFloat(d[yIndex]));

			let x = null;
			let y = null;

			if (xIndex !== null) {
				x = d3
					.scaleLinear()
					.domain([xMin, xMax])
					.range([0, innerWidth]);

				currSvg
					.append("g")
					.attr("transform", `translate(0, ${innerHeight})`)
					.call(d3.axisBottom(x));

				currSvg
					.append("text")
					.attr("x", innerWidth / 2)
					.attr("y", innerHeight + subMargin.bottom - 20)
					.attr("text-anchor", "middle")
					.text(columns[xIndex]);
			}
			if (yIndex !== null) {
				y = d3
					.scaleLinear()
					.domain([yMin, yMax])
					.range([innerHeight, 0]);

				currSvg.append("g").call(d3.axisLeft(y));

				currSvg
					.append("text")
					.attr("transform", "rotate(-90)")
					.attr("x", -innerHeight / 2)
					.attr("y", -subMargin.left + 20)
					.attr("text-anchor", "middle")
					.text(columns[yIndex]);
			}

			if (x !== null && y !== null) {
				const scatterG = currSvg.append("g").attr("id", "scatterG");

				scatterG
					.selectAll("circle")
					.data(data)
					.join("circle")
					.attr("cx", (d) => x(parseFloat(d[xIndex])))
					.attr("cy", (d) => y(parseFloat(d[yIndex])))
					.attr("r", 4)
					.attr("fill", "steelblue");

				// 브러시
				const brush = d3
					.brush()
					.extent([
						[0, 0],
						[innerWidth, innerHeight],
					])
					.on("end", brushed)
					.on("brush", brushed);

				currSvg.append("g").call(brush);

				function brushed(event) {
					clearSelections();
					const selection = event.selection;

					if (selection) {
						// selection은 픽셀 좌표
						// 좌상단(sx0, sy1), 우하단(sx1, sy0)
						const [[sx0, sy1], [sx1, sy0]] = selection.map((d) => [
							x.invert(d[0]),
							y.invert(d[1]),
						]);

						// brushingInfo 업데이트
						const isBrushedArr = data.map((rowData) => {
							const dx = parseFloat(rowData[xIndex]);
							const dy = parseFloat(rowData[yIndex]);
							return dx >= sx0 && dx <= sx1 && dy >= sy0 && dy <= sy1;
						});
						isBrushedArr.forEach((d, i) => {
							brushingInfo[itr][i] = d;
						});

						// ====== brushState 업데이트 ======
						const brushedPoints = isBrushedArr
							.map((flag, idx) => (flag ? idx : null))
							.filter((v) => v !== null);

						setBrushState((prev) => {
							const newState = { ...prev };
							// scatter인 경우, attribute를 [x축열, y축열] 둘 다 저장
							newState[itr] = {
								brushedPoints,
								attribute: [columns[xIndex], columns[yIndex]],
								// 2차원 영역
								range: [
									[sx0, sy0],
									[sx1, sy1],
								],
								// 각 축의 전체 도메인
								domain: [
									[xMin, xMax],
									[yMin, yMax],
								],
							};
							return newState;
						});

						// 다른 차트에 링크
						brushLinkVisualizations(brushingInfo);
					} else {
						// 브러시 해제
						scatterG.selectAll("circle").attr("fill", "steelblue");

						// brushingInfo 초기화
						brushingInfo[itr] = new Array(data.length).fill(true);

						// brushState도 초기화
						setBrushState((prev) => {
							const newState = { ...prev };
							newState[itr] = {
								brushedPoints: [],
								attribute: [columns[xIndex], columns[yIndex]],
								range: null,
								domain: [
									[xMin, xMax],
									[yMin, yMax],
								],
							};
							return newState;
						});

						brushLinkVisualizations(brushingInfo);
					}
				}
			}
		};

		// 최종 시각화 함수 호출
		drawVisualization(data, visInfo);
	}, [visInfo, data, columns, triggerVis]);

	return (
		<div className={styles.visualization}>
			<h3>{"Annotate on Visualizations"}</h3>
			<div className={styles.chart}>
				<svg width={width} height={height} ref={svgRef}></svg>
			</div>

			{/* 브러싱된 상태를 확인/디버깅하기 위해 보여주고 싶다면: */}
			{/* <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
				{JSON.stringify(brushState, null, 2)}
			</pre> */}
		</div>
	);
};

export default Visualization;
