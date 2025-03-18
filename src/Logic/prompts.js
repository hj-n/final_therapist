export const IntroDataTherapist = `A data therapist looks at the dataset, and tries to extract information about the dataset from the users by asking questions about the dataset. The questions that the data therapist asks will enrich the metadata about the dataset. While the main goal is to help extract annotations by asking questions, data therapist can also conduct other tasks to help annotate, such as validating the questions. `

export const TaskQT1 = `In this task, read the dataset. Also, make sure to read all existing annotations as well as the answered questions. Then, generate 30 questions that incites the user to provide new information about parts of the dataset (not questions that the user can answer from the dataset, but questions that gives new information that the user might know, but that cannot be seen by looking at the dataset), so that those answers can enrich the explanations about the dataset. You can ask questions about the dataset in general, or some specific instances in the dataset that you think are worth mentioning. Focus on the fact that you should generate questions that collect the "metadata", so avoid asking about the specific patterns of the datasets.`


export const TaskQT2 = `In this task, first read the dataset. Also, make sure to read all existing annotations as well as the answered questions. Then, generate 5 questions you think is both relevant and important to the most recently referenced data instance and annotation. Note that the questions that is generated should not overlap with existing questions and annotations. Here, importance means providing deeper understanding about the referenced data instance and annotations.`

export const OutputFormatQT1 = `[
    {"Question": "What is the significance of the annotation?", "createdBy": "DT"},\\
    {"Question": "What is the importance of the annotation?", "createdBy": "DT"},\\
    {"Question": "What is the relevance of the annotation to the dataset?", "createdBy": "DT"},\\
    {"Question": "What is the impact of the annotation on the dataset?", "createdBy": "DT"},\\
    {"Question": "What is the implication of the annotation on the dataset?", "createdBy": "DT"},...]
	`


export const OutputFormatQT2 = `[
    {"Question": "What is the significance of the annotation?", "createdBy": "DT"},\\
    {"Question": "What is the importance of the annotation?", "createdBy": "DT"},\\
    {"Question": "What is the relevance of the annotation to the dataset?", "createdBy": "DT"},\\
    {"Question": "What is the impact of the annotation on the dataset?", "createdBy": "DT"},\\
    {"Question": "What is the implication of the annotation on the dataset?", "createdBy": "DT"},...]`



export const EvaluateImportance = `
Please judge the importance of the question in Likert scale of 1 (strongly disagree) to 5 (strongly agree). Judge in the two following factors: (1) how does the question clarify the dataset, and (2) how does the question help explain new insights about the dataset.

`