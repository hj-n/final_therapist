import styles from './App.module.scss';

import Header from './Components/Header';
import Questions from './Components/Questions';

import React, { useState } from "react";
import Upload from './Components/Upload';
import Table from './Components/Table';
import Annotation from './Components/Annotation';
import AnnotationList from './Components/AnnotationList';


function App() {

	const [data, setData] = useState(null);
	const [fileName, setFileName] = useState("");

	console.log(data);
	
  return (
    <div className="App">
			<Header />
			{data === null ?
				<Upload setData={setData} setFileName={setFileName}/> 
				: 
				<div>
					<div className={styles.upper}>
						<Questions />
						<div className={styles.right}>
							<Table data={data}/>
							<Annotation />
						</div>
					</div>
					<div>
						<AnnotationList />
					</div>
				</div>
			}


    </div>
  );
}

export default App;
