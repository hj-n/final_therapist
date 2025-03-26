import React, { useState, useEffect } from 'react';
import styles from './AnnotationList.module.scss';

import { setAnnotationItemsFunc, updateMetadata, updateMetadataInner } from '../Logic/_createQuestions';

import LoadingOverlay from '../SubComponents/LoadingOverlay';

function AnnotationList(props) {

	const [status, setStatus] = useState("annotation");

	const [annotationItems, setAnnotationItems] = useState([]);
	const [loading, setLoading] = useState(false);	

	console.log(annotationItems);

	useEffect(() => {
		setAnnotationItemsFunc(setAnnotationItems);
	}, []);

	const [metadataItems, setMetadataItems] = useState([])
	
	function updateMetadata() {
		setLoading(true);
		updateMetadataInner(annotationItems, metadataItems).then((response) => {
			setLoading(false);
			setMetadataItems(response);
		}
		).catch((err) => {
			alert(err);
		});
	}



	return (
		<>
		{loading && <LoadingOverlay />}
		<div className={styles.tabWrapper}>
			{status === "annotation" ? 
				<h3 className={styles.titleAnnotation}>Annotation List</h3> : 
				<h3 className={styles.titleAnnotationUnselect}
					onClick={() => setStatus("annotation")}
				>Annotation List</h3>
			}
			{status === "annotation" ?
				<h3 className={styles.titleAnnotationUnselect} onClick={() => {
					setStatus("metadata")
					updateMetadata();
			}}>Generate Metadata</h3> :
				<h3 className={styles.titleAnnotation} onClick={() => setStatus("annotation")}>Metadata</h3>
			}
		</div>

		<div className={styles.wrapper}>
				{/* {items.map((item, index) => (
					<div className={styles.card} key={index}>
						<h3 className={styles.title}>{item.title}</h3>
						<p className={styles.content}>{item.content}</p>
					</div>
				))} */}
				{status === "annotation" ? 
				<div className={styles.grid}>
					{annotationItems.map((item, index) => {
						if ("annotation" in item) {
							return (
								<div className={styles.card} key={index}
									onMouseEnter={() => {
										if (Array.isArray(item.annotatedData)) {
											let keyList = Object.keys(item.annotatedData[0]);
											keyList = keyList.filter(key => key !== "row number");
											const rowNumbers = []
											for (let datum of item.annotatedData) {
												rowNumbers.push(datum["row number"]);
											}
											const colNumbers = []
											for (let keykey of keyList) {
												colNumbers.push(props.columns.indexOf(keykey));
											}

											console.log(rowNumbers);
											console.log(colNumbers);

											for (let rownumber of rowNumbers) {
												for (let colnumber of colNumbers) {
													document.getElementById(`cell-${colnumber + 1}-${rownumber + 1}`).style.border = "2px solid red";
												}
											}
										}
										else {
											console.log(item.annotatedData["brushing information"]);
											let keylist = item.annotatedData["brushing information"].map(brushingInfo => brushingInfo.attribute);
											let rangelist = item.annotatedData["brushing information"].map(brushingInfo => brushingInfo["brushed range"]);
											const colNumbers = []
											let rowNumbers = props.data.map((datum, idx) => idx);
											let rowFilter = props.data.map((datum, idx) => true);
											for (let keykey of keylist) {
												colNumbers.push(props.columns.indexOf(keykey));
												const currRange = rangelist[keylist.indexOf(keykey)];
												const currNowNumbers = props.data.map((datum, idx) => {
													const bigValue = currRange[1] > currRange[0] ? currRange[1] : currRange[0];
													const smallValue = currRange[1] > currRange[0] ? currRange[0] : currRange[1];
													console.log(bigValue, smallValue);
													if (datum[keykey] >= smallValue && datum[keykey] <= bigValue) {
														return true;
													}
													else {
														return false;
													}
												});
												rowFilter = rowFilter.map((datum, idx) => datum && currNowNumbers[idx]);
											}
											console.log(rowFilter)
											rowNumbers = rowNumbers.filter((datum, idx) => rowFilter[idx]);
											console.log(rowNumbers);
											console.log(colNumbers);

											for (let rownumber of rowNumbers) {
												for (let colnumber of colNumbers) {
													document.getElementById(`cell-${colnumber + 1}-${rownumber + 1}`).style.border = "2px solid red";
												}
											}
										}

									}}
									onMouseLeave={() => {
										const colLength = props.columns.length;
										const rowLength = props.dataLength;

										for (let i = 0; i < colLength; i++) {
											for (let j = 0; j < rowLength; j++) {
												
												document.getElementById(`cell-${i + 1}-${j + 1}`).style.border = "1px solid black";
											}
										}
									}}
								>
									{
										(() => {
											console.log(item.annotatedData);
											if (Array.isArray(item.annotatedData)) {
												let keyList = Object.keys(item.annotatedData[0]);
												keyList = keyList.filter(key => key !== "row number");
												return (
													<p className={styles.explanation}>{"Columns: "}<b>{keyList.reduce(
														(acc, cur) => acc + ", " + cur
													)}</b></p>
												)
											}
											else {
												// console.log(item);
												return (
													item.annotatedData["brushing information"].map((brushingInfo, iidx) => 
														(<p className={styles.explanation} key={iidx}>
														{"Brushed "}  <b>{brushingInfo.attribute}</b> {" from data point "} <b>{brushingInfo["brushed range"][0]}</b>  {" to "} <b>{brushingInfo["brushed range"][1]}</b>
														</p>)
													)
												)
											}
										})()
									}
									{
										(() => {
											if (Array.isArray(item.annotatedData)) {
												const rowNumbers = item.annotatedData.map(datum => datum["row number"]);
												const minRowNum = Math.min(...rowNumbers);
												const maxRowNum = Math.max(...rowNumbers);
												return (
													<p className={styles.explanation}>{`Ranges from data item`} <b>{`${minRowNum} to ${maxRowNum}`}</b></p>
												)
											}
											else {
												return (
													<></>
												)
											}
										})()
									}
									<p className={styles.content}>{"Your annotation: "}<b>{item.annotation}</b></p>
								</div>
							)
						}
						else {
							return (
								<div className={styles.card} key={index}>
									{(item.question.relatedCol !== undefined && item.question.relatedCol.length > 0) ?
										(
											<p className={styles.explanation}>{"Related columns: "}<b>{item.question.relatedCol.reduce(
												(acc, cur) => acc + ", " + cur
											)}</b></p>
										) : <></>
									}
									{
										item.question.relatedRow !== undefined && item.question.relatedRow.length > 0 ?
											(
												<p className={styles.explanation}>{`Ranges from data item`} <b>{`${item.question.relatedRow[0]} to ${item.question.relatedRow[1]}`}</b></p>
											) : <></>
									}
									<div className={styles.questionContentWrapper}>
										<div>
											<p className={styles.questionContent}>{"Question: "}<b>{item.question.Question}</b></p>
											<p className={styles.content}>{"Your answer: "}<b>{item.answer}</b></p>
										</div>
										{(() => {
											if (item.question.theme !== undefined) {
												return (
													<div>
														<img src={`./icons/${item.question.theme}.png`} />
														<p className={styles.smallText}>{item.question.theme}</p>
													</div>
													
												)
											}
										})()}
									</div>
								</div>
							)
						}

					})}
					</div>
					: <div className={styles.grid}>
						{metadataItems.map((item, index) => (
							<div className={styles.card} key={index}>
								<h3 className={styles.title}>{item.title}</h3>
								<p className={styles.content}>{item.content}</p>
							</div>
						))}
						</div>

				}
		</div>
		</>
	);
}

export default AnnotationList;