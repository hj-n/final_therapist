import React, { useState, useEffect } from 'react';
import styles from './AnnotationList.module.scss';

import { setAnnotationItemsFunc } from '../Logic/_createQuestions';

function AnnotationList() {

	const [status, setStatus] = useState("annotation");

	const [annotationItems, setAnnotationItems] = useState([]);

	useEffect(() => {
		setAnnotationItemsFunc(setAnnotationItems);
	}, []);
	


	const metadataItems = [
		{
			"title": "Motivation",
			"content": "Originally assembled to investigate the relationship between vehicle speed and braking distance, the cars dataset aimed to inform traffic safety research. By quantifying how stopping distance changes with speed, early researchers sought to highlight the importance of controlled driving speeds."
		},
		{
			"title": "Composition",
			"content": "This dataset comprises 50 observations with two primary variables: speed (mph) and stopping distance (ft). Each row captures a unique instance, ensuring that the range of speeds and corresponding distances reflects a broad yet concise sample of possible real-world scenarios."
		},
		{
			"title": "Collection process",
			"content": "Data were gathered through manual measurements in the 1920s, with drivers accelerating to known speeds and then applying brakes at a marked point. Observers documented the distance required for the car to come to a complete stop, using standard imperial units of the era."
		},
		{
			"title": "Preprocessing",
			"content": "Minimal preprocessing was applied to the raw measurements before their inclusion in the dataset. Speed and distance values are presented as-is, without transformations. Users may perform additional cleaning, outlier checks, or unit conversions to meet their specific analysis needs."
		},
		{
			"title": "Uses",
			"content": "Beyond its historical significance, the cars dataset is widely used in statistics and data science education. It serves as an introductory tool for teaching correlation, linear regression, and exploratory data analysis, providing straightforward insights that encourage hands-on learning."
		},
		{
			"title": "Distribution",
			"content": "The dataset is distributed as part of the base R installation and can be accessed directly without additional packages. Its broad availability and inclusion in numerous statistical software environments have made it a go-to example in courses, textbooks, and tutorials."
		},
		{
			"title": "Maintenance",
			"content": "Because of its historical nature, the dataset remains static and is no longer actively updated. Any revisions typically focus on correcting minor documentation issues rather than altering the underlying data, ensuring it remains a consistent resource for educators and researchers."
		}
	]

	// const items = status === "annotation" ? annotationItems : metadataItems;


	return (
		<>
		<div className={styles.tabWrapper}>
			{status === "annotation" ? 
				<h3 className={styles.titleAnnotation}>Annotation List</h3> : 
				<h3 className={styles.titleAnnotationUnselect}
					onClick={() => setStatus("annotation")}
				>Annotation List</h3>
			}
			{status === "annotation" ?
				<h3 className={styles.titleAnnotationUnselect} onClick={() => setStatus("metadata")}>Metadata</h3> :
				<h3 className={styles.titleAnnotation} onClick={() => setStatus("annotation")}>Metadata</h3>
			}
		</div>

		<div className={styles.wrapper}>
			<div>
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
								<div className={styles.card} key={index}>
									{
										(() => {
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
									<p className={styles.questionContent}>{"Question: "}<b>{item.question.Question}</b></p>
									<p className={styles.content}>{"Your answer: "}<b>{item.answer}</b></p>
									
								</div>
							)
						}

					})}
					</div>
					: <></>	
				}
			</div>
		</div>
		</>
	);
}

export default AnnotationList;