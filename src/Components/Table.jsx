import React, { useState, useEffect, useRef } from 'react';
import styles from './Table.module.scss';
import Visualization from './Visualization';

import { annotatedData, setAnnotatedData } from '../Logic/_createQuestions';

function Table({ data: propData, dataid }) {
	// ---------------------------------------------
	// 0) rowIds, selectedRowIds 추가
	// ---------------------------------------------
	const [data, setData] = useState([]);
	const [rowIds, setRowIds] = useState([]);
	const [selectedRowIds, setSelectedRowIds] = useState([]);

	const [originalData, setOriginalData] = useState([]);
	const [originalRowIds, setOriginalRowIds] = useState([]);

	const [columns, setColumns] = useState([]);
	const [sortStates, setSortStates] = useState([]);
	const [originalSort, setOriginalSort] = useState([]);
	const [selectedCols, setSelectedCols] = useState([]);

	const [triggerVis, setTriggerVis] = useState(false);

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
			cols: JSON.parse(JSON.stringify(selectedCols)),
			rows: JSON.parse(JSON.stringify(selectedRowIds))
		});
	}, [selectedCols, selectedRowIds]);

	// ---------------------------------------------
	// clearSelections 함수
	// ---------------------------------------------
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
	};

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

		const keys = Object.keys(propData[0]);
		setColumns(keys);

		const tableData = propData.map((obj) =>
			keys.map((key) => (obj[key] !== undefined ? obj[key] : ''))
		);
		setData(tableData);

		const initialRowIds = propData.map((_, i) => i);
		setRowIds(initialRowIds);

		setOriginalData(JSON.parse(JSON.stringify(tableData)));
		setOriginalRowIds([...initialRowIds]);

		const initialSort = Array(keys.length).fill(null);
		setSortStates(initialSort);
		setOriginalSort([...initialSort]);

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
		const thisId = rowIds[rowIndex];
		let baseSelected = [...selectedRowIds];
		if (!shiftDown) {
			baseSelected = [thisId];
		} else {
			if (!baseSelected.includes(thisId)) {
				baseSelected.push(thisId);
			}
		}

		setSelectedRowIds(baseSelected);
		setSelectedCols([]);
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

		const rangeIds = rowIds.slice(start, end + 1);

		if (!shiftKey) {
			setSelectedRowIds(rangeIds);
			setTriggerVis(!triggerVis);
		} else {
			const setUnion = new Set([...baseSelectedRows, ...rangeIds]);
			setSelectedRowIds(Array.from(setUnion));
			setTriggerVis(!triggerVis);
		}
	};

	// ---------------------------------------------
	// 3) 열 드래그 선택
	// ---------------------------------------------
	const handleColMouseDown = (colIndex, e) => {
		const shiftDown = e.shiftKey;
		let baseSelected = [...selectedCols];

		if (!shiftDown) {
			baseSelected = [colIndex];
			setSelectedCols(baseSelected);
			setSelectedRowIds([]);
			setTriggerVis(!triggerVis);
		} else {
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
	// 4) 셀 드래그 선택
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

		const rowRangeIds = rowIds.slice(minRow, maxRow + 1);
		const colRange = [];
		for (let c = minCol; c <= maxCol; c++) {
			colRange.push(c);
		}
		setSelectedRowIds(rowRangeIds);
		setSelectedCols(colRange);
		setTriggerVis(!triggerVis);
	};

	const handleCellClick = () => {
		if (!dragMovedRef.current) {
			setSelectedRowIds([]);
			setSelectedCols([]);
			setTriggerVis(!triggerVis);
		}
	};

	// ---------------------------------------------
	// 5) 셀 편집 로직
	// ---------------------------------------------
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
	// 6) 정렬 로직
	// ---------------------------------------------
	function parseValue(v) {
		if (v === '' || isNaN(Number(v))) return v;
		return Number(v);
	}

	const handleSortClick = (colIndex, e) => {
		e.stopPropagation();
		const current = sortStates[colIndex];
		let newDirection;
		if (current === 'asc') newDirection = 'desc';
		else if (current === 'desc') newDirection = 'asc';
		else newDirection = 'asc';

		const newSort = Array(colCount).fill(null);
		newSort[colIndex] = newDirection;
		setSortStates(newSort);

		const isAsc = newDirection === 'asc';

		const newData = [...data];
		const newRowIds = [...rowIds];

		const comparator = (i, j) => {
			const valA = parseValue(newData[i][colIndex]);
			const valB = parseValue(newData[j][colIndex]);
			if (valA < valB) return isAsc ? -1 : 1;
			if (valA > valB) return isAsc ? 1 : -1;
			return 0;
		};

		const zipped = newRowIds.map((id, idx) => ({ id, row: newData[idx] }));
		zipped.sort((a, b) => {
			const valA = parseValue(a.row[colIndex]);
			const valB = parseValue(b.row[colIndex]);
			if (valA < valB) return isAsc ? -1 : 1;
			if (valA > valB) return isAsc ? 1 : -1;
			return 0;
		});

		const sortedRowIds = zipped.map((z) => z.id);
		const sortedData = zipped.map((z) => z.row);

		setRowIds(sortedRowIds);
		setData(sortedData);

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
	// ---------------------------------------------
	const handleDeleteRow = (rowIndex, e) => {
		e.stopPropagation();
		const thisId = rowIds[rowIndex];
		const newData = [...data];
		newData.splice(rowIndex, 1);

		const newRowIds = [...rowIds];
		newRowIds.splice(rowIndex, 1);

		setData(newData);
		setRowIds(newRowIds);

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
	// 8) 연산 (sum, diff, avg)
	// ---------------------------------------------
	function canUseOperation() {
		if (selectedRowIds.length > 0 && selectedCols.length > 0) return false;
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

		setSelectedRowIds([]);
		setSelectedCols([]);
		setTriggerVis(!triggerVis);
	}

	// ---------------------------------------------
	// 9) 시각화 (Histogram, Scatter)
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
			curr.push({ type: 'scatter', x: colIndex, y: null });
		} else {
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
	// 10) CSS 클래스 (하이라이팅)
	// ---------------------------------------------
	function getRowHeaderClass(rowIndex) {
		const rowId = rowIds[rowIndex];
		return selectedRowIds.includes(rowId) ? styles.selectedHeader : '';
	}
	function getColHeaderClass(c) {
		return selectedCols.includes(c) ? styles.selectedHeader : '';
	}
	function getCornerClass() {
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

				<div className={dataid === "accounting" ? styles.accountTableContainer : styles.tableContainer}>
					<table className={styles.table}>
						<thead>
							<tr>
								{/* 왼쪽 상단 corner */}
								<th id="cell-corner" className={`${styles.header} ${getCornerClass()}`} />
								{columns.map((col, colIndex) => (
									<th
										id={`cell-colheader-${colIndex + 1}`}
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
										id={`cell-rowheader-${rowIndex + 1}`}
										className={`${dataid === "accounting" ? styles.accountHeader : styles.header} ${getRowHeaderClass(rowIndex)}`}
										onMouseDown={(e) => handleRowMouseDown(rowIndex, e)}
										onMouseEnter={() => handleRowMouseEnter(rowIndex)}
									>
										<div className={styles.rowHeaderContent}>
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
												id={`cell-${colIndex + 1}-${rowIndex + 1}`}
												key={`cell-${rowIndex}-${colIndex}`}
												className={`${dataid === "accounting" ? styles.accountCell : styles.cell} ${cellClass}`}
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
