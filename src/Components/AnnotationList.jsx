import React from 'react';
import styles from './AnnotationList.module.scss';

function AnnotationList() {

	const items = [
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


	return (
		<>
		<h3 className={styles.titleAnnotation}>Annotation List</h3>
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