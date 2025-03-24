import React, { useState, useRef, useEffect } from "react";

import styles from "./Annotation.module.scss";
import { addAnnotation, annotatedDatafromTableAnnotation, annotatedDatafromVisualAnnotation } from "../Logic/_createQuestions";
import { annotatedData } from "../Logic/_createQuestions";

import LoadingOverlay from "../SubComponents/LoadingOverlay";


const Annotation = () => {
	
	const [annotation, setAnnotation] = useState("");
	const [loading, setLoading] = useState(false);

	const [status, setStatus] = useState(false);




	let annotatedDataTransformed = null;
	if (annotatedData !== null){
		if ('cols' in annotatedData) {
			annotatedDataTransformed = annotatedDatafromTableAnnotation(annotatedData);
		}
		else {
			annotatedDataTransformed = annotatedDatafromVisualAnnotation(annotatedData);
		}
	}

	const textAreaRef = useRef();

	const submitAnnotation = () => {
		// TODO

		setLoading(true);

		addAnnotation(annotation, annotatedData).then(() => {
			setLoading(false);
		}).catch((err) => {
			console.log(err);
		});

		setAnnotation("");
	}

	return (
		<div className={styles.annotation}>
			{loading && <LoadingOverlay />}
			<h2>Add Annotation</h2>
			{(() => {
				if (annotatedDataTransformed === null) {
					return (<></>)
				}
				if (Array.isArray(annotatedDataTransformed)) {
					let keyList = Object.keys(annotatedDataTransformed[0]);
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
						annotatedDataTransformed["brushing information"].map((brushingInfo, iidx) =>
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
					if (Array.isArray(annotatedDataTransformed)) {
						const rowNumbers = annotatedDataTransformed.map(datum => datum["row number"]);
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
			<textarea ref={textAreaRef} value={annotation} onChange={(e) => setAnnotation(e.target.value)} onClick={() => { setStatus(!status)}}></textarea>
			<button onClick={submitAnnotation}>Submit</button>
		</div>
	)
}

export default Annotation;