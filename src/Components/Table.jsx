import React, { useState, useEffect, useRef } from 'react';
import styles from './Table.module.scss';
import Visualization from './Visualization';

import { annotatedData, setAnnotatedData } from '../Logic/_createQuestions';

function Table({ data: propData, dataid }) {
	// ---------------------------------------------
	// 0) rowIds, selectedRowIds 추가
	// ---------------------------------------------
	// data: 실제 화면에 뿌리는 2차원 배열 (정렬에 따라 순서 바뀜)
	// rowIds: data의 각 행이 "원본에서 어떤 row ID"인가를 기록하는 배열
	// selectedRowIds: 원본 row ID들 중 현재 선택된 것들
	const [data, setData] = useState([]);
	const [rowIds, setRowIds] = useState([]);
	const [selectedRowIds, setSelectedRowIds] = useState([]);

	// originalData: Reset 시점을 위해 보관 (2차원 배열)
	// originalRowIds: Reset 시 원본 행 순서 복구
	const [originalData, setOriginalData] = useState([]);
	const [originalRowIds, setOriginalRowIds] = useState([]);

	// 기타 기존 상태들
	const [columns, setColumns] = useState([]);
	const [sortStates, setSortStates] = useState([]);
	const [originalSort, setOriginalSort] = useState([]);
	const [selectedCols, setSelectedCols] = useState([]);

	const [triggerVis, setTriggerVis] = useState(false);

	// 셀 편집, 드래그 등등
	const [editingCell, setEditingCell] = useState({ row: null, col: null });
	const [dragState, setDragState] = useState({
		mode: null,
		startIndex: null,
		startRow: null,
		startCol: null,
		isDragging: false,
		shiftKey: false,
		baseSelectedRows: [],
		baseSelectedCols: [],
	});
	const dragMovedRef = useRef(false);

	useEffect(() => {
		if (selectedRowIds.length === 0 && selectedCols.length === 0) {
			return;
		}
		setAnnotatedData({
			"cols": JSON.parse(JSON.stringify(selectedCols)),
			"rows": JSON.parse(JSON.stringify(selectedRowIds))
		});
	}, [selectedCols, selectedRowIds]);


	// 아주 아주 중요한 코드 250317
	const clearSelections = () => {
		setSelectedRowIds([]);
		setSelectedCols([]);
		setDragState({
			mode: null,
			startIndex: null,
			startRow: null,
			startCol: null,
			isDragging: false,
			shiftKey: false,
			baseSelectedRows: [],
			baseSelectedCols: [],
		});
		setEditingCell({ row: null, col: null });
		// 필요한 경우 visInfo 등도 초기화할 수 있음
	};
	// useEffect(() => {
	// 	const newVisInfo = JSON.parse(JSON.stringify(visInfo));
	// 	setVisInfo(newVisInfo);
	// }, [selectedCols, selectedRowIds]);

	// ---------------------------------------------
	// 1) propData 로부터 초기 세팅
	// ---------------------------------------------
	useEffect(() => {
		if (!propData || propData.length === 0) {
			setColumns([]);
			setData([]);
			setOriginalData([]);
			setSortStates([]);
			setOriginalSort([]);
			setRowIds([]);
			setOriginalRowIds([]);
			setSelectedRowIds([]);
			return;
		}

		// 컬럼 키 추출
		const keys = Object.keys(propData[0]);
		setColumns(keys);

		// 2차원 배열 변환
		const tableData = propData.map((obj) =>
			keys.map((key) => (obj[key] !== undefined ? obj[key] : ''))
		);
		setData(tableData);

		// rowIds = [0, 1, 2, 3, ... propData.length-1]
		// (여기서는 index를 ID로 삼았지만, 실제론 uuid등도 가능)
		const initialRowIds = propData.map((_, i) => i);
		setRowIds(initialRowIds);

		// originalData, originalRowIds 백업
		setOriginalData(JSON.parse(JSON.stringify(tableData)));
		setOriginalRowIds([...initialRowIds]);

		// sort 상태
		const initialSort = Array(keys.length).fill(null);
		setSortStates(initialSort);
		setOriginalSort([...initialSort]);

		// 선택 해제
		setSelectedRowIds([]);
		setSelectedCols([]);
		setTriggerVis(!triggerVis);
	}, [propData]);

	const rowCount = data.length;
	const colCount = columns.length;

	// ---------------------------------------------
	// (공통) 마우스 업 시 드래그 해제
	// ---------------------------------------------
	const handleMouseUp = () => {
		if (dragState.isDragging) {
			setDragState({
				mode: null,
				startIndex: null,
				startRow: null,
				startCol: null,
				isDragging: false,
				shiftKey: false,
				baseSelectedRows: [],
				baseSelectedCols: [],
			});
			dragMovedRef.current = false;
		}
	};
	useEffect(() => {
		window.addEventListener('mouseup', handleMouseUp);
		return () => window.removeEventListener('mouseup', handleMouseUp);
	}, [dragState.isDragging]);

	// ---------------------------------------------
	// 2) 행 드래그 선택 → selectedRowIds 업데이트
	// ---------------------------------------------
	const handleRowMouseDown = (rowIndex, e) => {
		const shiftDown = e.shiftKey;

		// 현재 rowIds[rowIndex]가 원본 ID
		const thisId = rowIds[rowIndex];

		// shift키면 기존 선택과 합집합
		let baseSelected = [...selectedRowIds];
		if (!shiftDown) {
			// shift 아니면 새로 선택
			baseSelected = [thisId];
		} else {
			// shiftKey: 클릭한 행 id가 아직 없으면 추가
			if (!baseSelected.includes(thisId)) {
				baseSelected.push(thisId);
			}
		}

		setSelectedRowIds(baseSelected);
		setSelectedCols([]); // 행 선택이므로 열 선택 해제
		setTriggerVis(!triggerVis);

		setDragState({
			mode: 'row',
			startIndex: rowIndex,
			startRow: null,
			startCol: null,
			isDragging: true,
			shiftKey: shiftDown,
			baseSelectedRows: baseSelected,
			baseSelectedCols: [],
		});
	};

	const handleRowMouseEnter = (rowIndex) => {
		if (!dragState.isDragging || dragState.mode !== 'row') return;

		const { startIndex, shiftKey, baseSelectedRows } = dragState;
		const start = Math.min(startIndex, rowIndex);
		const end = Math.max(startIndex, rowIndex);

		// 현재 표시 순서에서 start~end 범위에 해당하는 rowIds 추출
		const rangeIds = rowIds.slice(start, end + 1);

		if (!shiftKey) {
			// shift가 아니면 단순히 범위만
			setSelectedRowIds(rangeIds);
			setTriggerVis(!triggerVis);
		} else {
			// shiftKey면 기존과 합집합
			const setUnion = new Set([...baseSelectedRows, ...rangeIds]);
			setSelectedRowIds(Array.from(setUnion));
			setTriggerVis(!triggerVis);
		}
	};

	// ---------------------------------------------
	// 3) 열 드래그 선택은 기존과 동일(열은 원본 ID를 따로 두지 않았다고 가정)
	// ---------------------------------------------
	// const [selectedCols, setSelectedCols] = useState([]);

	const handleColMouseDown = (colIndex, e) => {
		const shiftDown = e.shiftKey;
		let baseSelected = [...selectedCols];

		if (!shiftDown) {
			// 새 선택
			baseSelected = [colIndex];
			setSelectedCols(baseSelected);
			setSelectedRowIds([]); // 열 선택이므로 행 선택 해제
			setTriggerVis(!triggerVis);
		} else {
			// shift면 합집합
			if (!baseSelected.includes(colIndex)) {
				baseSelected.push(colIndex);
			}
			setSelectedCols(baseSelected);
			setTriggerVis(!triggerVis);
		}

		setDragState({
			mode: 'col',
			startIndex: colIndex,
			startRow: null,
			startCol: null,
			isDragging: true,
			shiftKey: shiftDown,
			baseSelectedRows: [],
			baseSelectedCols: baseSelected,
		});
	};

	const handleColMouseEnter = (colIndex) => {
		if (!dragState.isDragging || dragState.mode !== 'col') return;
		const { startIndex, shiftKey, baseSelectedCols } = dragState;
		const start = Math.min(startIndex, colIndex);
		const end = Math.max(startIndex, colIndex);
		const range = [];
		for (let i = start; i <= end; i++) range.push(i);

		if (!shiftKey) {
			setSelectedCols(range);
			setTriggerVis(!triggerVis);
		} else {
			const setUnion = new Set([...baseSelectedCols, ...range]);
			setSelectedCols(Array.from(setUnion));
			setTriggerVis(!triggerVis);
		}
	};

	// ---------------------------------------------
	// 4) 셀 드래그 선택 → rowIds/colIndex로 변환
	//    (이 예제에서는 '셀 단위' 선택도 rowIds 사용)
	// ---------------------------------------------
	const handleCellMouseDown = (rowIndex, colIndex, e) => {
		dragMovedRef.current = false;

		const rowId = rowIds[rowIndex];
		setSelectedRowIds([rowId]);
		setSelectedCols([colIndex]);
		setTriggerVis(!triggerVis);

		setDragState({
			mode: 'cell',
			startIndex: null,
			startRow: rowIndex,
			startCol: colIndex,
			isDragging: true,
			shiftKey: e.shiftKey,
			baseSelectedRows: [],
			baseSelectedCols: [],
		});
	};

	const handleCellMouseEnter = (rowIndex, colIndex) => {
		if (!dragState.isDragging || dragState.mode !== 'cell') return;
		dragMovedRef.current = true;

		const { startRow, startCol } = dragState;
		const minRow = Math.min(startRow, rowIndex);
		const maxRow = Math.max(startRow, rowIndex);
		const minCol = Math.min(startCol, colIndex);
		const maxCol = Math.max(startCol, colIndex);

		// 행 범위 IDs
		const rowRangeIds = rowIds.slice(minRow, maxRow + 1);
		// 열 범위
		const colRange = [];
		for (let c = minCol; c <= maxCol; c++) {
			colRange.push(c);
		}
		setSelectedRowIds(rowRangeIds);
		setSelectedCols(colRange);
		setTriggerVis(!triggerVis);
	};

	const handleCellClick = () => {
		// 드래그 없이 클릭만 했다면 선택 해제 (기존 로직)
		if (!dragMovedRef.current) {
			setSelectedRowIds([]);
			setSelectedCols([]);
			setTriggerVis(!triggerVis);
		}
	};

	// ---------------------------------------------
	// 5) 셀 편집 로직은 기존과 동일
	// ---------------------------------------------
	// const [editingCell, setEditingCell] = useState({ row: null, col: null });

	const handleCellDoubleClick = (r, c) => {
		setEditingCell({ row: r, col: c });
	};

	const handleBlur = (e, r, c) => {
		const val = e.target.value;
		setData((prev) => {
			const newData = [...prev];
			newData[r] = [...newData[r]];
			newData[r][c] = val;
			return newData;
		});
		setEditingCell({ row: null, col: null });
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') e.target.blur();
	};

	// ---------------------------------------------
	// 6) 정렬 → data, rowIds를 같은 기준으로 재배열
	// ---------------------------------------------
	function parseValue(v) {
		if (v === '' || isNaN(Number(v))) return v;
		return Number(v);
	}

	const handleSortClick = (colIndex, e) => {
		e.stopPropagation();

		// 정렬 방향 업데이트
		const current = sortStates[colIndex];
		let newDirection;
		if (current === 'asc') newDirection = 'desc';
		else if (current === 'desc') newDirection = 'asc';
		else newDirection = 'asc';

		const newSort = Array(colCount).fill(null);
		newSort[colIndex] = newDirection;
		setSortStates(newSort);

		const isAsc = newDirection === 'asc';

		// data와 rowIds를 함께 sort
		const newData = [...data];
		const newRowIds = [...rowIds];

		// sort를 위한 comparator
		const comparator = (i, j) => {
			const valA = parseValue(newData[i][colIndex]);
			const valB = parseValue(newData[j][colIndex]);
			if (valA < valB) return isAsc ? -1 : 1;
			if (valA > valB) return isAsc ? 1 : -1;
			return 0;
		};

		// custom sort: i, j는 인덱스가 아니라 rowIds에서의 index
		// → 간단하게 newRowIds 자체를 sort하고, 그 결과를 기준으로 newData를 재매핑
		// 혹은 그냥 둘을 zip해서 정렬해도 됨
		const zipped = newRowIds.map((id, idx) => ({ id, row: newData[idx] }));
		zipped.sort((a, b) => {
			const valA = parseValue(a.row[colIndex]);
			const valB = parseValue(b.row[colIndex]);
			if (valA < valB) return isAsc ? -1 : 1;
			if (valA > valB) return isAsc ? 1 : -1;
			return 0;
		});

		// 재할당
		const sortedRowIds = zipped.map((z) => z.id);
		const sortedData = zipped.map((z) => z.row);

		setRowIds(sortedRowIds);
		setData(sortedData);

		// 정렬 시 기존 선택(드래그) 해제할 경우
		setSelectedRowIds([]);
		setSelectedCols([]);
		setTriggerVis(!triggerVis);
	};

	function sortIndicator(c) {
		const st = sortStates[c];
		if (!st) {
			return <img src="/imgs/sort.png" alt="sort" style={{ width: '16px', height: '16px' }} />;
		}
		if (st === 'asc') {
			return <img src="/imgs/sortup.png" alt="sort up" style={{ width: '16px', height: '16px' }} />;
		}
		if (st === 'desc') {
			return <img src="/imgs/sortdown.png" alt="sort down" style={{ width: '16px', height: '16px' }} />;
		}
		return null;
	}

	// ---------------------------------------------
	// 7) 행/열 삭제, Reset
	//    - 행 삭제: rowIndex -> rowIds[rowIndex] 추출 → 실제 data/rowIds에서 제거
	// ---------------------------------------------
	const handleDeleteRow = (rowIndex, e) => {
		e.stopPropagation();
		const thisId = rowIds[rowIndex];

		// data/rowIds에서 rowIndex 위치 제거
		const newData = [...data];
		newData.splice(rowIndex, 1);

		const newRowIds = [...rowIds];
		newRowIds.splice(rowIndex, 1);

		setData(newData);
		setRowIds(newRowIds);

		// 선택 목록에서도 해당 ID 제거
		setSelectedRowIds((prev) => prev.filter((id) => id !== thisId));
		setTriggerVis(!triggerVis);
	};

	const handleDeleteCol = (colIndex, e) => {
		e.stopPropagation();
		const newData = data.map((row) => {
			const newRow = [...row];
			newRow.splice(colIndex, 1);
			return newRow;
		});
		setData(newData);

		const updCols = selectedCols
			.filter((c) => c !== colIndex)
			.map((c) => (c > colIndex ? c - 1 : c));
		setSelectedCols(updCols);
		setTriggerVis(!triggerVis);

		const newSort = [...sortStates];
		newSort.splice(colIndex, 1);
		setSortStates(newSort);

		const newCols = [...columns];
		newCols.splice(colIndex, 1);
		setColumns(newCols);
	};

	const handleReset = () => {
		// 원본으로 복원
		const copy = JSON.parse(JSON.stringify(originalData));
		setData(copy);
		setRowIds([...originalRowIds]);
		setSortStates([...originalSort]);

		setSelectedRowIds([]);
		setSelectedCols([]);
		setEditingCell({ row: null, col: null });
		setTriggerVis(!triggerVis);
	};

	// ---------------------------------------------
	// 8) 연산(예: sum, diff, avg)도, 행에 대해선 rowIds가 있지만
	//    실제 수치 연산은 data 쪽 값을 사용하므로 기존 방식 그대로 유지 가능
	// ---------------------------------------------
	function canUseOperation() {
		// 예시 그대로
		if (selectedRowIds.length > 0 && selectedCols.length > 0) return false;
		if (selectedCols.length !== 2) return false;
		if (rowCount === 0) return false;

		// 열 2개 모두 숫자인지 검사
		for (let r = 0; r < rowCount; r++) {
			for (const c of selectedCols) {
				const val = data[r][c];
				if (val === '' || isNaN(Number(val))) {
					return false;
				}
			}
		}
		return true;
	}

	function handleOperation(type) {
		if (!canUseOperation()) return;
		const [c1, c2] = selectedCols;
		const newHeader = `${type}(${columns[c1]},${columns[c2]})`;

		const newData = data.map((row) => {
			const v1 = Number(row[c1]);
			const v2 = Number(row[c2]);
			let res = 0;
			if (type === 'sum') res = v1 + v2;
			else if (type === 'diff') res = v1 - v2;
			else if (type === 'avg') res = (v1 + v2) / 2;
			return [...row, res.toString()];
		});
		setData(newData);
		setSortStates((prev) => [...prev, null]);
		setColumns((prev) => [...prev, newHeader]);

		setSelectedRowIds([]);
		setSelectedCols([]);
		setTriggerVis(!triggerVis);
	}

	// ---------------------------------------------
	// 9) 시각화 (Histogram, Scatter) → 기존 로직
	// ---------------------------------------------
	const [visInfo, setVisInfo] = useState([]);

	const handleHistogram = (colIndex, e) => {
		e.stopPropagation();
		const curr = [...visInfo];
		if (curr.length === 4) {
			alert('You can only select up to 4 visualization');
			return;
		}
		curr.push({ type: 'histogram', index: colIndex });
		setVisInfo(curr);
	};

	const handleScatterX = (colIndex, e) => {
		e.stopPropagation();
		const curr = [...visInfo];
		if (curr.length === 4) {
			alert('You can only select up to 4 visualization');
			return;
		}
		const existing = curr.filter((x) => x.type === 'scatter');
		const filled = existing.filter((x) => x.x !== null && x.y !== null);
		if (existing.length === filled.length) {
			// 새로운 scatter
			curr.push({ type: 'scatter', x: colIndex, y: null });
		} else {
			// 아직 x나 y 하나가 비어있는 scatter 찾기
			const idx = curr.findIndex((x) => x.type === 'scatter' && (x.x === null || x.y === null));
			if (idx >= 0) {
				if (curr[idx].y === colIndex) {
					alert('Please select a different column for X-axis');
				} else {
					curr[idx].x = colIndex;
				}
			}
		}
		setVisInfo(curr);
	};

	const handleScatterY = (colIndex, e) => {
		e.stopPropagation();
		const curr = [...visInfo];
		const existing = curr.filter((x) => x.type === 'scatter');
		const filled = existing.filter((x) => x.x !== null && x.y !== null);
		if (existing.length === filled.length) {
			curr.push({ type: 'scatter', x: null, y: colIndex });
		} else {
			const idx = curr.findIndex((x) => x.type === 'scatter' && (x.x === null || x.y === null));
			if (idx >= 0) {
				if (curr[idx].x === colIndex) {
					alert('Please select a different column for Y-axis');
				} else {
					curr[idx].y = colIndex;
				}
			}
		}
		setVisInfo(curr);
	};

	// ---------------------------------------------
	// 10) CSS 클래스 (하이라이팅) → rowIndex→rowIds[rowIndex] 가 selectedRowIds에 있나?
	// ---------------------------------------------
	function getRowHeaderClass(rowIndex) {
		const rowId = rowIds[rowIndex];
		return selectedRowIds.includes(rowId) ? styles.selectedHeader : '';
	}
	function getColHeaderClass(c) {
		return selectedCols.includes(c) ? styles.selectedHeader : '';
	}
	function getCornerClass() {
		// 임의로 “행 또는 열이 선택되었을 때” 강조
		if (selectedRowIds.length > 0 || selectedCols.length > 0) {
			return styles.selectedHeader;
		}
		return '';
	}
	function getCellClass(r, c) {
		const rowId = rowIds[r];
		const rowSel = selectedRowIds.includes(rowId);
		const colSel = selectedCols.includes(c);
		const haveRowSel = selectedRowIds.length > 0;
		const haveColSel = selectedCols.length > 0;

		// “행·열 교차 선택” 시 교차 부분만 빨간색, 등등 기존 로직
		if (haveRowSel && haveColSel) {
			return rowSel && colSel ? styles.selected : '';
		} else if (haveRowSel && rowSel) {
			return styles.selected;
		} else if (haveColSel && colSel) {
			return styles.selected;
		}
		return '';
	}

	// ---------------------------------------------
	// 렌더링
	// ---------------------------------------------
	return (
		<div className={styles.finalWrapper}>
			<div>
				<div className={styles.topBarContainer}>
					<h3>Data Table</h3>
					<button type="button" onClick={handleReset} className={styles.topButton}>
						Reset
					</button>
					{canUseOperation() && (
						<>
							<button
								type="button"
								onClick={() => handleOperation('sum')}
								className={styles.topButton}
							>
								Sum
							</button>
							<button
								type="button"
								onClick={() => handleOperation('diff')}
								className={styles.topButton}
							>
								Diff
							</button>
							<button
								type="button"
								onClick={() => handleOperation('avg')}
								className={styles.topButton}
							>
								Avg
							</button>
						</>
					)}
				</div>

				<div className={styles.tableContainer}>
					<table className={styles.table}>
						<thead>
							<tr>
								{/* 왼쪽 상단 corner */}
								<th className={`${styles.header} ${getCornerClass()}`} />
								{columns.map((col, colIndex) => (
									<th
										key={`col-header-${colIndex}`}
										className={`${styles.header} ${getColHeaderClass(colIndex)}`}
										onMouseDown={(e) => handleColMouseDown(colIndex, e)}
										onMouseEnter={() => handleColMouseEnter(colIndex)}
									>
										<div className={styles.headerContent}>
											<span>{col}</span>
											<div className={styles.iconContainer}>
												{dataid !== "accounting" && 
												<button
													type="button"
													onMouseDown={(e) => e.stopPropagation()}
													onClick={(e) => handleSortClick(colIndex, e)}
													style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
												>
													{sortIndicator(colIndex)}
												</button>
												}
												<button
													type="button"
													onMouseDown={(e) => e.stopPropagation()}
													onClick={(e) => handleHistogram(colIndex, e)}
													style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
												>
													<img
														src="/imgs/histogram.png"
														alt="histogram"
														style={{ width: '16px', height: '16px' }}
													/>
												</button>
												<button
													type="button"
													onMouseDown={(e) => e.stopPropagation()}
													onClick={(e) => handleScatterX(colIndex, e)}
													style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
												>
													<img
														src="/imgs/scatterX.png"
														alt="scatterX"
														style={{ width: '16px', height: '16px' }}
													/>
												</button>
												<button
													type="button"
													onMouseDown={(e) => e.stopPropagation()}
													onClick={(e) => handleScatterY(colIndex, e)}
													style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
												>
													<img
														src="/imgs/scatterY.png"
														alt="scatterY"
														style={{ width: '16px', height: '16px' }}
													/>
												</button>
												<button
													type="button"
													onMouseDown={(e) => e.stopPropagation()}
													onClick={(e) => handleDeleteCol(colIndex, e)}
													style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
												>
													<img
														src="/imgs/trash.png"
														alt="trash"
														style={{ width: '16px', height: '16px' }}
													/>
												</button>
											</div>
										</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{data.map((row, rowIndex) => (
								<tr key={`row-${rowIndex}`}>
									<th
										className={`${styles.header} ${getRowHeaderClass(rowIndex)}`}
										onMouseDown={(e) => handleRowMouseDown(rowIndex, e)}
										onMouseEnter={() => handleRowMouseEnter(rowIndex)}
									>
										<div className={styles.rowHeaderContent}>
											{/* 화면상 '행 번호'는 rowIndex+1 로 표시하되,
                          실제 선택은 rowIds[rowIndex]를 통해 원본 ID를 추적 */}
											<span>{rowIndex + 1}</span>
											<div className={styles.iconContainer}>
												<button
													type="button"
													onMouseDown={(e) => e.stopPropagation()}
													onClick={(e) => handleDeleteRow(rowIndex, e)}
													style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
												>
													<img
														src="/imgs/trash.png"
														alt="trash"
														style={{ width: '16px', height: '16px' }}
													/>
												</button>
											</div>
										</div>
									</th>
									{row.map((cell, colIndex) => {
										const isEditing = editingCell.row === rowIndex && editingCell.col === colIndex;
										const cellClass = getCellClass(rowIndex, colIndex);
										return (
											<td
												key={`cell-${rowIndex}-${colIndex}`}
												className={`${styles.cell} ${cellClass}`}
												onMouseDown={(e) => handleCellMouseDown(rowIndex, colIndex, e)}
												onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
												onClick={handleCellClick}
												onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
											>
												{isEditing ? (
													<input
														type="text"
														className={styles.editCell}
														defaultValue={cell}
														autoFocus
														onBlur={(e) => handleBlur(e, rowIndex, colIndex)}
														onKeyDown={handleKeyDown}
													/>
												) : (
													cell
												)}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* 시각화 */}
			{dataid !== "accounting" &&
				<Visualization 
					data={data} 
					visInfo={visInfo} 
					columns={columns} 
					setVisInfo={setVisInfo} 
					clearSelections={clearSelections}
					triggerVis={triggerVis}
				/>
			}	
		</div>
	);
}

export default Table;
