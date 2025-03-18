import React, { useState, useRef } from "react";

import styles from "./Annotation.module.scss";
import { addAnnotation } from "../Logic/_createQuestions";
import { annotatedData } from "../Logic/_createQuestions";

import LoadingOverlay from "../SubComponents/LoadingOverlay";

const Annotation = () => {
	
	const [annotation, setAnnotation] = useState("");
	const [loading, setLoading] = useState(false);

	const textAreaRef = useRef();

	const submitAnnotation = () => {
		console.log(annotation);
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
			<textarea ref={textAreaRef} value={annotation} onChange={(e) => setAnnotation(e.target.value)}></textarea>
			<button onClick={submitAnnotation}>Submit</button>
		</div>
	)
}

export default Annotation;