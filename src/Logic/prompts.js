export const IntroDataTherapist = `Data Therapist generates questions to extract answers from domain experts so that the annotations explain the situation, environment, and background surrounding the dataset. While the data is there, the dataset by itself does not explain the background, the issues, and so on. The role of data therapist is to elicit this knowledge about the dataset from the users by asking appropriate questions that by answering, could help understand knowledge about the data. Ideally, the annotations should be made so that even someone who does not know the dataset could understand the dataset by looking at the annotations.  While the main goal is to help extract annotations by asking questions, data therapist can also conduct other tasks to help annotate, such as validating the questions. `

export const TaskQT1 = `In this task, read the dataset. Also, make sure to read all existing annotations as well as the answered questions. Assume that you have the data, but do not know any background, or information about the dataset. Generate 30 questions you would ask domain experts to motivate answers from the experts.`


export const TaskQT2 = `In this task, first read the dataset. Also, make sure to read all existing annotations as well as the answered questions. Assume what you know about the information are from the annotations. Generate 5 questions you would ask to motivate answers from the experts. Note that the questions that is generated should not overlap with existing questions and annotations.

Moreover, check if the answer from the most recently answered question or the most recent annotation contradicts past annotations or answers from past answered questions. If you notice any contradiction, then provide the question that can resolve the contradction and  make clarification. This question should be incorporated in the 5 questions that you generate. 

`

export const TaskV1 = `Now, look at the answer and check if the answer  addresses the question. If the answer completely does not answer the question, then  provide feedback to guide users to answer the question. Note that you must provide the feedback only when the answer is **completely incorrect**. `

export const OutputFormatQT1 = `[
    {"Question": "What is the significance of the annotation?", "createdBy": "DT"},\\
    {"Question": "What is the importance of the annotation?", "createdBy": "DT"},\\
    {"Question": "What is the relevance of the annotation to the dataset?", "createdBy": "DT"},\\
    {"Question": "What is the impact of the annotation on the dataset?", "createdBy": "DT"},\\
    {"Question": "What is the implication of the annotation on the dataset?", "createdBy": "DT"},...]
	`


export const OutputFormatQT2 = `[
    {"Question": "What is the significance of the annotation?", "createdBy": "DT", "relatedRow"; [4, 10], "relatedCol": ["attr1, "attr2", ..]},\\
    {"Question": "What is the importance of the annotation?", "createdBy": "DT", "relatedRow"; [5, 11], "relatedCol": ["attr1]},\\
    {"Question": "What is the relevance of the annotation to the dataset?", "createdBy": "DT", "relatedRow"; [123, 150], "relatedCol": []},\\
    {"Question": "What is the impact of the annotation on the dataset?", "createdBy": "DT", "relatedRow"; [], "relatedCol": ["attr3"]},\\
    {"Question": "What is the implication of the annotation on the dataset?", "createdBy": "DT", , "relatedRow"; [], "relatedCol": []},...]`

export const OutputFormatV1 = `{
    "alert" : 1 or 0,
    "feedback" : "n/a" %or "What is the significance of the annotation"
}`


export const EvaluateImportance = `
Please judge the importance of the question in Likert scale of 1 to 5. Judge in the two following factors: (1) how does the question clarify the dataset, and (2) how does the question help explain new insights about the dataset.

`

export const GenerateMetadata = `
Please organize the all the annotatedItems into a "metadata". The metadata should include the following topics: 
 - Motivation
 - Composition
 - Collection process
 - Preprocessing
 - Uses
 - Distribution
 - Maintenance
Be sure to include all the contexts of annotations and questions that you have generated in the metadata.  Summarize in 2 or 3 sentences.
`

export const GenerateMetadataOutputFormat = `[
 { "title": "Motivation", "content": "The motivation of the dataset is to predict the price of the house based on the features of the house...."},\\
{ "title": "Composition", "content": "The dataset is composed of 1000 rows and 10 columns..."},\\
{ "title": "Collection process", "content": "The data was collected by scraping the data
from the website..."},\\
{ "title": "Preprocessing", "content": "The data was preprocessed by removing the missing values..."},\\
{ "title": "Uses", "content": "The dataset was used to predict the price of the house..."},\\
{ "title": "Distribution", "content": "The dataset is distributed in the Kaggle..."},\\
{ "title": "Maintenance", "content": "The dataset is maintained by the Kaggle..."}]
]`