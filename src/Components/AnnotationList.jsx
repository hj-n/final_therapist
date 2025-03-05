import React, { useState } from 'react';
import styles from './AnnotationList.module.scss';

function AnnotationList() {

	const [status, setStatus] = useState("annotation");

	const annotationItems = [
		{
			"title": "Publication Source",
			"content": "It is included in the base R installation, meaning no additional packages are required to access it. Historically, the data stems from a study on car performance, which has since been adopted widely for educational purposes."
		},
		{
			"title": "Observations",
			"content": "The cars dataset contains 50 observations, each representing a separate instance of recorded speed and stopping distance. These observations enable analysts to explore variability in braking performance across different speeds."
		},
		{
			"title": "Measurement Units and Confusion",
			"content": "Speed is measured in miles per hour (mph), a standard measure in the United States, while distance is measured in feet (ft). These imperial units may require conversion or particular consideration when comparing with data in metric systems."
		},
		{
			"title": "Correlation between minTemp and maxTemp",
			"content": "A strong positive correlation of approximately 0.8 is observed, indicating that as speed increases, the stopping distance also tends to increase. This correlation can be analyzed further to understand the potential linear or non-linear relationships."
		},
		{
			"title": "Typical Regression Model",
			"content": "A frequently cited linear model is dist = -17.58 + 3.93 × speed, implying that each additional mph in speed increases the stopping distance by about 3.93 feet. However, analysts should validate any model’s assumptions and consider potential outliers."
		},
		{
			"title": "Data Collection period",
			"content": "The data were originally gathered in the 1920s, reflecting the vehicle technology and road conditions of that era. Consequently, modern cars with advanced braking systems may exhibit different relationships between speed and stopping distance."
		},
		{
			"title": "Correlation between minTemp and maxTemp",
			"content": "A strong positive correlation of approximately 0.8 is observed, indicating that as speed increases, the stopping distance also tends to increase. This correlation can be analyzed further to understand the potential linear or non-linear relationships."
		},
		{
			"title": "Typical Regression Model",
			"content": "A frequently cited linear model is dist = -17.58 + 3.93 × speed, implying that each additional mph in speed increases the stopping distance by about 3.93 feet. However, analysts should validate any model’s assumptions and consider potential outliers."
		},
		{
			"title": "Data Collection period",
			"content": "The data were originally gathered in the 1920s, reflecting the vehicle technology and road conditions of that era. Consequently, modern cars with advanced braking systems may exhibit different relationships between speed and stopping distance."
		}
	]

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

	const items = status === "annotation" ? annotationItems : metadataItems;


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
			<div className={styles.grid}>
				{items.map((item, index) => (
					<div className={styles.card} key={index}>
						<h3 className={styles.title}>{item.title}</h3>
						<p className={styles.content}>{item.content}</p>
					</div>
				))}
			</div>
		</div>
		</>
	);
}

export default AnnotationList;