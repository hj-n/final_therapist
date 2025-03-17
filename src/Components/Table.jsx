import React, { useState, useEffect, useRef } from 'react';
import styles from './Table.module.scss';
import Visualization from './Visualization';

function Table({ data: propData }) {
	// 1) 2차원 배열로 변환
	const [data, setData] = useState([]);
	const [originalData, setOriginalData] = useState([]);
	const [columns, setColumns] = useState([]);

	// 2) 정렬 상태
	const [sortStates, setSortStates] = useState([]);
	const [originalSort, setOriginalSort] = useState([]);

	// 3) 행/열 선택 상태
	const [selectedRows, setSelectedRows] = useState([]);
	const [selectedCols, setSelectedCols] = useState([]);

	// 4) 드래그 상태
	const [dragState, setDragState] = useState({
		mode: null, // 'row' | 'col' | 'cell' | null
		startIndex: null,
		startRow: null,
		startCol: null,
		isDragging: false,
		shiftKey: false,
		baseSelectedRows: [],
		baseSelectedCols: [],
	});

	// 5) 셀 편집 상태
	const [editingCell, setEditingCell] = useState({ row: null, col: null });

	// 6) 클릭/드래그 구분 ref
	const dragMovedRef = useRef(false);

	// 7) 초기 데이터 세팅
	useEffect(() => {
		if (propData && propData.length > 0) {
			const keys = Object.keys(propData[0]);
			setColumns(keys);

			const tableData = propData.map((obj) =>
				keys.map((key) => (obj[key] !== undefined ? obj[key] : ''))
			);
			setData(tableData);
			setOriginalData(JSON.parse(JSON.stringify(tableData)));

			const initialSort = Array(keys.length).fill(null);
			setSortStates(initialSort);
			setOriginalSort([...initialSort]);
		} else {
			setColumns([]);
			setData([]);
			setOriginalData([]);
			setSortStates([]);
			setOriginalSort([]);
		}
	}, [propData]);

	const rowCount = data.length;
	const colCount = columns.length;

	/* ---------------------------------------------
	 * 1) 행 드래그 선택
	 * -------------------------------------------- */
	const handleRowMouseDown = (rowIndex, e) => {
		// "버튼" 클릭이 아니면(TH 어디든) → 행 선택 드래그 시작
		// ※ 굳이 if (e.target !== e.currentTarget) 조건을 쓰면, 자식 div/span 클릭도 막혀버림
		// => 아래처럼 제거하면 TH 안을 누르면 모두 행 드래그가 가능합니다.
		const shiftDown = e.shiftKey;
		const baseRows = [...selectedRows];
		const baseCols = [...selectedCols];

		if (shiftDown) {
			if (!baseRows.includes(rowIndex)) baseRows.push(rowIndex);
			setSelectedRows(baseRows);
		} else {
			setSelectedRows([rowIndex]);
			setSelectedCols([]);
		}

		setDragState({
			mode: 'row',
			startIndex: rowIndex,
			startRow: null,
			startCol: null,
			isDragging: true,
			shiftKey: shiftDown,
			baseSelectedRows: baseRows,
			baseSelectedCols: baseCols,
		});
	};

	const handleRowMouseEnter = (rowIndex) => {
		if (dragState.isDragging && dragState.mode === 'row') {
			const { startIndex, shiftKey, baseSelectedRows } = dragState;
			const start = Math.min(startIndex, rowIndex);
			const end = Math.max(startIndex, rowIndex);
			const range = [];
			for (let r = start; r <= end; r++) {
				range.push(r);
			}
			if (shiftKey) {
				const union = new Set([...baseSelectedRows, ...range]);
				setSelectedRows(Array.from(union));
			} else {
				setSelectedRows(range);
			}
		}
	};

	/* ---------------------------------------------
	 * 2) 열 드래그 선택
	 * -------------------------------------------- */
	const handleColMouseDown = (colIndex, e) => {
		const shiftDown = e.shiftKey;
		const baseRows = [...selectedRows];
		const baseCols = [...selectedCols];

		if (shiftDown) {
			if (!baseCols.includes(colIndex)) baseCols.push(colIndex);
			setSelectedCols(baseCols);
		} else {
			setSelectedCols([colIndex]);
			setSelectedRows([]);
		}

		setDragState({
			mode: 'col',
			startIndex: colIndex,
			startRow: null,
			startCol: null,
			isDragging: true,
			shiftKey: shiftDown,
			baseSelectedRows: baseRows,
			baseSelectedCols: baseCols,
		});
	};

	const handleColMouseEnter = (colIndex) => {
		if (dragState.isDragging && dragState.mode === 'col') {
			const { startIndex, shiftKey, baseSelectedCols } = dragState;
			const start = Math.min(startIndex, colIndex);
			const end = Math.max(startIndex, colIndex);
			const range = [];
			for (let c = start; c <= end; c++) {
				range.push(c);
			}
			if (shiftKey) {
				const union = new Set([...baseSelectedCols, ...range]);
				setSelectedCols(Array.from(union));
			} else {
				setSelectedCols(range);
			}
		}
	};

	/* ---------------------------------------------
	 * 3) 셀 드래그 선택
	 * -------------------------------------------- */
	const handleCellMouseDown = (rowIndex, colIndex, e) => {
		dragMovedRef.current = false;
		// (굳이 e.preventDefault() 안씀)

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
		// 셀 하나만 우선 선택
		setSelectedRows([rowIndex]);
		setSelectedCols([colIndex]);
	};

	const handleCellMouseEnter = (rowIndex, colIndex) => {
		if (dragState.isDragging && dragState.mode === 'cell') {
			dragMovedRef.current = true;
			const { startRow, startCol } = dragState;
			const minRow = Math.min(startRow, rowIndex);
			const maxRow = Math.max(startRow, rowIndex);
			const minCol = Math.min(startCol, colIndex);
			const maxCol = Math.max(startCol, colIndex);
			const rowsRange = [];
			for (let r = minRow; r <= maxRow; r++) {
				rowsRange.push(r);
			}
			const colsRange = [];
			for (let c = minCol; c <= maxCol; c++) {
				colsRange.push(c);
			}
			setSelectedRows(rowsRange);
			setSelectedCols(colsRange);
		}
	};

	const handleCellClick = () => {
		// 드래그 없이 클릭만 했다면 선택 해제
		if (!dragMovedRef.current) {
			setSelectedRows([]);
			setSelectedCols([]);
		}
	};

	// 마우스 업 시 드래그 해제
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
		const globalUp = () => handleMouseUp();
		window.addEventListener('mouseup', globalUp);
		return () => window.removeEventListener('mouseup', globalUp);
	}, [dragState.isDragging]);

	/* ---------------------------------------------
	 * 4) 셀 편집
	 * -------------------------------------------- */
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

	/* ---------------------------------------------
	 * 5) 정렬
	 * -------------------------------------------- */
	const handleSortClick = (colIndex, e) => {
		e.stopPropagation(); // 상위로 이벤트가 올라가서 드래그가 시작되지 않도록
		console.log('Sorting column', colIndex);

		const current = sortStates[colIndex];
		const newSort = Array(colCount).fill(null);

		let newState;
		if (current === 'asc') {
			newState = 'desc';
		} else if (current === 'desc') {
			newState = 'asc';
		} else {
			newState = 'asc';
		}
		newSort[colIndex] = newState;
		setSortStates(newSort);

		const isAsc = newState === 'asc';
		const newData = [...data];
		newData.sort((rowA, rowB) => {
			const valA = parseValue(rowA[colIndex]);
			const valB = parseValue(rowB[colIndex]);
			if (valA < valB) return isAsc ? -1 : 1;
			if (valA > valB) return isAsc ? 1 : -1;
			return 0;
		});
		setData(newData);

		// 정렬 시 기존 선택 해제
		setSelectedRows([]);
		setSelectedCols([]);
	};

	function parseValue(v) {
		if (v === '' || isNaN(Number(v))) return v;
		return Number(v);
	}

	function sortIndicator(c) {
		const st = sortStates[c];
		if (!st) {
			return (
				<img
					src="/imgs/sort.png"
					alt="sort"
					style={{ width: '16px', height: '16px' }}
				/>
			);
		}
		if (st === 'asc') {
			return (
				<img
					src="/imgs/sortup.png"
					alt="sort up"
					style={{ width: '16px', height: '16px' }}
				/>
			);
		}
		if (st === 'desc') {
			return (
				<img
					src="/imgs/sortdown.png"
					alt="sort down"
					style={{ width: '16px', height: '16px' }}
				/>
			);
		}
		return null;
	}

	/* ---------------------------------------------
	 * 6) 행/열 삭제, 리셋
	 * -------------------------------------------- */
	const handleDeleteRow = (rowIndex, e) => {
		e.stopPropagation();
		const newData = [...data];
		newData.splice(rowIndex, 1);
		setData(newData);

		const upd = selectedRows
			.filter((x) => x !== rowIndex)
			.map((x) => (x > rowIndex ? x - 1 : x));
		setSelectedRows(upd);
	};

	const handleDeleteCol = (colIndex, e) => {
		e.stopPropagation();
		const newData = data.map((row) => {
			const newRow = [...row];
			newRow.splice(colIndex, 1);
			return newRow;
		});
		setData(newData);

		const upd = selectedCols
			.filter((x) => x !== colIndex)
			.map((x) => (x > colIndex ? x - 1 : x));
		setSelectedCols(upd);

		const newSort = [...sortStates];
		newSort.splice(colIndex, 1);
		setSortStates(newSort);

		const newCols = [...columns];
		newCols.splice(colIndex, 1);
		setColumns(newCols);
	};

	const handleReset = () => {
		const copy = JSON.parse(JSON.stringify(originalData));
		setData(copy);
		setSortStates([...originalSort]);
		setSelectedRows([]);
		setSelectedCols([]);
		setEditingCell({ row: null, col: null });
	};

	/* ---------------------------------------------
	 * 7) 열 연산 (Sum, Diff, Avg)
	 * -------------------------------------------- */
	function canUseOperation() {
		// 행/열 동시선택인 경우 불가
		if (selectedRows.length > 0 && selectedCols.length > 0) {
			return false;
		}
		// 2개 열만 선택해야 가능
		if (selectedCols.length !== 2) return false;
		if (rowCount === 0) return false;

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

		setSelectedRows([]);
		setSelectedCols([]);
	}

	/* ---------------------------------------------
	 * 8) 시각화 관련
	 * -------------------------------------------- */
	const [visInfo, setVisInfo] = useState([]);

	const handleHistogram = (colIndex, e) => {
		e.stopPropagation();
		console.log(`Histogram clicked for column ${colIndex}`);

		const currVisInfo = JSON.parse(JSON.stringify(visInfo));
		currVisInfo.push({ type: 'histogram', index: colIndex });
		setVisInfo(currVisInfo);
	};

	const handleScatterX = (colIndex, e) => {
		e.stopPropagation();
		console.log(`Scatterplot X clicked for column ${colIndex}`);

		const currVisInfo = JSON.parse(JSON.stringify(visInfo));
		const checkIfScatterExists = currVisInfo.filter((x) => x.type === 'scatter');
		const checkIfScatterFull = currVisInfo.filter(
			(x) => x.type === 'scatter' && x.x !== null && x.y !== null
		);
		if (checkIfScatterExists.length === checkIfScatterFull.length) {
			currVisInfo.push({ type: 'scatter', x: colIndex, y: null });
			setVisInfo(currVisInfo);
		} else {
			const scatterIndex = currVisInfo.findIndex(
				(x) => x.type === 'scatter' && (x.x === null || x.y === null)
			);
			if (currVisInfo[scatterIndex].y !== colIndex) {
				currVisInfo[scatterIndex].x = colIndex;
				setVisInfo(currVisInfo);
			} else {
				alert('Please select a different column for X-axis');
			}
		}
	};

	const handleScatterY = (colIndex, e) => {
		e.stopPropagation();
		console.log(`Scatterplot Y clicked for column ${colIndex}`);

		const currVisInfo = JSON.parse(JSON.stringify(visInfo));
		const checkIfScatterExists = currVisInfo.filter((x) => x.type === 'scatter');
		const checkIfScatterFull = currVisInfo.filter(
			(x) => x.type === 'scatter' && x.x !== null && x.y !== null
		);
		if (checkIfScatterExists.length === checkIfScatterFull.length) {
			currVisInfo.push({ type: 'scatter', x: null, y: colIndex });
			setVisInfo(currVisInfo);
		} else {
			const scatterIndex = currVisInfo.findIndex(
				(x) => x.type === 'scatter' && (x.x === null || x.y === null)
			);
			if (currVisInfo[scatterIndex].x !== colIndex) {
				currVisInfo[scatterIndex].y = colIndex;
				setVisInfo(currVisInfo);
			} else {
				alert('Please select a different column for Y-axis');
			}
		}
	};

	/* ---------------------------------------------
	 * 9) CSS 클래스 (하이라이팅 등)
	 * -------------------------------------------- */
	function getRowHeaderClass(r) {
		return selectedRows.includes(r) ? styles.selectedHeader : '';
	}
	function getColHeaderClass(c) {
		return selectedCols.includes(c) ? styles.selectedHeader : '';
	}
	function getCornerClass() {
		if (selectedRows.length > 0 || selectedCols.length > 0) {
			return styles.selectedHeader;
		}
		return '';
	}
	function getCellClass(r, c) {
		const rowSel = selectedRows.includes(r);
		const colSel = selectedCols.includes(c);
		const haveRowSel = selectedRows.length > 0;
		const haveColSel = selectedCols.length > 0;

		if (haveRowSel && haveColSel) {
			return rowSel && colSel ? styles.selected : '';
		} else if (haveRowSel && rowSel) {
			return styles.selected;
		} else if (haveColSel && colSel) {
			return styles.selected;
		}
		return '';
	}

	return (
		<div className={styles.finalWrapper}>
			<div>
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
				</div>

				<div className={styles.tableContainer}>
					<table className={styles.table}>
						<thead>
							<tr>
								{/* 왼쪽 상단 코너 */}
								<th className={`${styles.header} ${getCornerClass()}`} />
								{columns.map((col, colIndex) => (
									<th
										key={`col-header-${colIndex}`}
										className={`${styles.header} ${getColHeaderClass(colIndex)}`}
										// 여기 onMouseDown으로 "열 선택 드래그" 시작
										onMouseDown={(e) => handleColMouseDown(colIndex, e)}
										onMouseEnter={() => handleColMouseEnter(colIndex)}
									>
										<div className={styles.headerContent}>
											<span>{col}</span>
											{/* 정렬 버튼 */}
											<div className={styles.iconContainer}>
												<button
													type="button"
													onMouseDown={(e) => e.stopPropagation()}
													onClick={(e) => handleSortClick(colIndex, e)}
													style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
												>
													{sortIndicator(colIndex)}
												</button>
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
												{/* 열 삭제 버튼 */}
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
									{/* 행 헤더 (왼쪽) */}
									<th
										className={`${styles.header} ${getRowHeaderClass(rowIndex)}`}
										// onMouseDown으로 "행 선택 드래그" 시작
										onMouseDown={(e) => handleRowMouseDown(rowIndex, e)}
										onMouseEnter={() => handleRowMouseEnter(rowIndex)}
									>
										<div className={styles.rowHeaderContent}>
											<span>{rowIndex + 1}</span>
											<div className={styles.iconContainer}>
												{/* 행 삭제 버튼 */}
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

									{/* 셀들 */}
									{row.map((cell, colIndex) => {
										const isEditing =
											editingCell.row === rowIndex && editingCell.col === colIndex;
										const cellClass = getCellClass(rowIndex, colIndex);

										return (
											<td
												key={`cell-${rowIndex}-${colIndex}`}
												className={`${styles.cell} ${cellClass}`}
												// onMouseDown으로 "셀 범위 드래그" 시작
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

			{/* 시각화 컴포넌트 */}
			<Visualization data={data} visInfo={visInfo} columns={columns} setVisInfo={setVisInfo} />
		</div>
	);
}

export default Table;
