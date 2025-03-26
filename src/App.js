import styles from './App.module.scss';

import Header from './Components/Header';
import Questions from './Components/Questions';

import React, { useState } from "react";
import Upload from './Components/Upload';
import Table from './Components/Table';
import Annotation from './Components/Annotation';
import AnnotationList from './Components/AnnotationList';

import Papa from 'papaparse';
import { useEffect } from 'react';

import LoadingOverlay from "./SubComponents/LoadingOverlay";


import { useParams } from 'react-router-dom';

import { initiateQuestions, setApiKey } from "./Logic/_createQuestions";

import { setPid } from './Logic/_toserver';

function App() {

	const [data, setData] = useState(null);
	const [fileName, setFileName] = useState("");
	const [loading, setLoading] = useState(false);

	const { dataid, pid, apiKey } = useParams();

	let columns = null;
	let dataLength = null;
	if (data !== null)
		columns = Object.keys(data[0]);
	if (data !== null)
		dataLength = data.length;

	useEffect(() => {

		setPid(pid);
		setApiKey(apiKey);
		if (dataid !== undefined && data === null) {
			fetch(`data/${dataid}.csv`)
				.then(response => response.text())
				.then(csvText => {
					const data = Papa.parse(csvText, {
						header: true,
						skipEmptyLines: true,
					});
					return data;
				}).then((response) => {
					setLoading(true);
					initiateQuestions(response.data).then(() => {
						setLoading(false);
						setData(response.data);
						setFileName(dataid);
						
					}).catch((err) => {
						console.log(err);
					});
				})
				.catch(error => console.error('Error fetching CSV:', error));
		}
	}, []);

	
  return (
    <div className="App">
			{loading && <LoadingOverlay />}
			<Header />
			{data === null ?
				<Upload setData={setData} setFileName={setFileName}/> 
				: 
				<div>
					<div className={styles.upper}>
						<Questions 
							columns={columns}
							data={data}
							dataLength={dataLength}
						/>
						<div className={styles.right}>
							<Table data={data} dataid={dataid}/>
							<Annotation />
						</div>
					</div>
					<div>
						<AnnotationList 
							columns={columns}
							data={data}
							dataLength={dataLength}
						/>
					</div>
				</div>
			}


    </div>
  );
}

export default App;
