import React, { useState, useRef } from "react";

import styles from "./Annotation.module.scss";

const Annotation = () => {
	
	const [annotation, setAnnotation] = useState("");

	const textAreaRef = useRef();

	const submitAnnotation = () => {
		console.log(annotation);
		// TODO


		setAnnotation("");
	}

	return (
		<div className={styles.annotation}>
			<h2>Add Annotation</h2>
			<textarea ref={textAreaRef} value={annotation} onChange={(e) => setAnnotation(e.target.value)}></textarea>
			<button onClick={submitAnnotation}>Submit</button>
		</div>
	)
}

export default Annotation;