import React, { useState, useRef } from "react";

import styles from "./Upload.module.scss";

import Papa from 'papaparse';

const Upload = (props) => {

	const [uploadedData, setUploadedData] = useState(null);
	const [fileName, setFileName] = useState(null);

	const setDataApp = props.setData;
	const setFileNameApp = props.setFileName;


	const fileInputRef = useRef();

	const initializeTherapist = () => {
		setDataApp(uploadedData);
		setFileNameApp(fileName);
	}

	const saveCSV = (e) => {
		const file = e.target.files[0];

		if (!checkFileType(file)) return;

		const reader = new FileReader();

		reader.onload = (e) => {
			const data = e.target.result;

			// CSV 데이터를 파싱하여 JSON 형식으로 변환
			const parsedData = Papa.parse(data, { header: true }).data;
			const fileName = file.name;

			// 변환된 데이터 저장
			setUploadedData(parsedData);
			setFileName(fileName);
		};

		reader.readAsText(file);
	};

	const checkFileType = (file) => {
		if (file.type !== "text/csv") {
			alert("Please select a CSV file");
			return false;
		}
		return true;
	}

	const dragEnterHandler = (e) => {
		e.preventDefault();
		e.stopPropagation();

		fileInputRef.current.style.setProperty("border", "2.5px solid #c5e1fc");
		fileInputRef.current.style.setProperty("color", "black");

	}

	const dragLeaveHandler = (e) => {
		e.preventDefault();
		e.stopPropagation();

		fileInputRef.current.style.setProperty("border", "2.5px dashed #dae9f7");
		fileInputRef.current.style.setProperty("color", "#919191");

	}

	const dragOverHandler = (e) => {
		e.preventDefault();
		e.stopPropagation();

	}

	const dropHandler = (e) => {
		e.preventDefault();
		e.stopPropagation();

		const file = e.dataTransfer.files[0];

		if (!checkFileType(file)) return;

		saveCSV({ target: { files: [file] } });
	}

	return (
		<div className={styles.fileInputWrapper}>
			<h3>Upload your data:</h3>
			{uploadedData === null ?
				<label htmlFor="csv">
					<input
						className={styles.fileInput}
						type="file" id="csv" name="csv"
						accept=".csv"
						onChange={(e) => { saveCSV(e) }}
					/>
					<div
						ref={fileInputRef}
						className={styles.inputBox}
						onDragEnter={dragEnterHandler}
						onDragLeave={dragLeaveHandler}
						onDragOver={dragOverHandler}
						onDrop={dropHandler}
					>
						{("Drag & drop your CSV file, or click to select a file")}
					</div>
				</label> : 
				<div>
					<div className={styles.inputBoxUploaded} >
						{fileName}
					</div>
					<div className={styles.buttonWrapper}>
						<button
							onClick={initializeTherapist}
						>{"Initiate Therapist!!"}</button>
					</div>
				</div>
		}
		</div>
	)
}

export default Upload;