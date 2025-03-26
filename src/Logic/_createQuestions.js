import OpenAI from "openai";


import { predefined_T3 } from "./predefined";
// import apiKey from "./api.json";

import * as prompts from "./prompts";
import { measureImportanceT1, measureImportanceT2, measureVectorEmbedding, measureVectorEmbeddingStr } from "./_prioritizeQuestions";
import { returnTopRankedQuestions } from "./_extractQuestions";

import { postAnnotation, postInitialQuestions, postQuestionAnswer } from "./_toserver";


let apiKey = null;

export let openai = null;

export function setApiKey(newApiKey) {
		apiKey = newApiKey;
		openai = new OpenAI({
		apiKey: apiKey,
		dangerouslyAllowBrowser: true
	})	
}

export const questions = {
	"T1": [],
	"T2": [],
	"T3": [],
}

export let annotatedData = null; // 계속 global variable로 쓰임

export function setAnnotatedData (data)  {
	annotatedData = data;
}

let setAnnotationItems = null;

export function setAnnotationItemsFunc(func) {
	setAnnotationItems = func;
}


export const annotations = [];
export const questionAnswers = [];

export let combined = [];





// data variables
export let dataStr = "";
export let dataObj = null;
export let columns = null;

export const model = "gpt-4o-mini-2024-07-18";

export async function initiateQuestions(data) {
	dataStr = dataToStr(data);
	dataObj = JSON.parse(JSON.stringify(data));
	columns = Object.keys(data[0]);
	const dataset_T1 = await getT1Questions(dataStr);
	const dataset_T1_importance = await measureImportanceT1(dataset_T1);
	const dataset_T1_importanceEmbedding = await measureVectorEmbedding(dataset_T1_importance);
	await initiateT3Embeddings(predefined_T3);
	questions["T1"] = dataset_T1_importanceEmbedding;
	console.log(questions);
	console.log(questions["T3"]);

	postInitialQuestions(questions);
}

async function initiateT3Embeddings(predefined_t3) {
	// console.log(questions["T3"][0]);
	// console.log(questions["T3"][0]["list"]);
	questions["T3"] = questions["T3"].concat(JSON.parse(JSON.stringify(predefined_t3)));
	questions["T3"][0]["list"] = await measureVectorEmbedding(questions["T3"][0]["list"]);
	questions["T3"][1]["list"] = await measureVectorEmbedding(questions["T3"][1]["list"]);
	questions["T3"][2]["list"] = await measureVectorEmbedding(questions["T3"][2]["list"]);
	questions["T3"][3]["list"] = await measureVectorEmbedding(questions["T3"][3]["list"]);
	questions["T3"][4]["list"] = await measureVectorEmbedding(questions["T3"][4]["list"]);
	questions["T3"][5]["list"] = await measureVectorEmbedding(questions["T3"][5]["list"]);
	questions["T3"][6]["list"] = await measureVectorEmbedding(questions["T3"][6]["list"]);

}

export async function addAnnotation(newAnnotation, newAnnotatedData) {
	let annoatedDataTransformed;
	let annotationType = null;
	if ("cols" in newAnnotatedData) {
		annoatedDataTransformed = annotatedDatafromTableAnnotation(newAnnotatedData);
		annotationType = "table";
	} else {
		annoatedDataTransformed = annotatedDatafromVisualAnnotation(newAnnotatedData);
		annotationType = "visual";
	}

	let currAnnotation;
	let currAnnotationforServer;
	
	if (annotationType === "table") {
		// random sampling 
		const annotatedDataTransformedCopy = JSON.parse(JSON.stringify(annoatedDataTransformed));
		const sampledData = [];
		for (let i = 0; i < 300; i++) {
			const randomIndex = Math.floor(Math.random() * annoatedDataTransformed.length);
			sampledData.push(annoatedDataTransformed[randomIndex]);
		}
		currAnnotation = {
			"annotation": newAnnotation,
			"annotatedData": annoatedDataTransformed,
			"recency": 6
		}
		currAnnotationforServer = {
			"annotation": newAnnotation,
			"annotatedData": sampledData,
			"recency": 6
		}
	}
	else {
		currAnnotation = { 
			"annotation": newAnnotation,
			"annotatedData": annoatedDataTransformed,
			"recency": 6
		};
		currAnnotationforServer = {
			"annotation": newAnnotation,
			"annotatedData": annoatedDataTransformed,
			"recency": 6
		};
	}
	currAnnotation["embedding"] = await measureVectorEmbeddingStr(newAnnotation);
	annotations.push(currAnnotation);
	combined = [currAnnotation].concat(combined);
	const t2NewQuestions = await generateQuestionsT2Annotations(currAnnotationforServer);
	const t2NewQuestionsImportance = await measureImportanceT2(t2NewQuestions);
	const t2NewQuestionsImportanceEmbedding = await measureVectorEmbedding(t2NewQuestionsImportance);

	updateRecencyOfAnnotations();

	questions["T2"] = questions["T2"].concat(t2NewQuestionsImportanceEmbedding);
	setAnnotationItems(combined);

	postAnnotation(currAnnotationforServer, t2NewQuestionsImportanceEmbedding, annotationType);

}

export async function addQuestionAnswer(newQuestion, newAnswer) {

	// check whether the answer is valid 

	const feedbackInfo = await checkAnswerValidity(newAnswer, newQuestion);
	console.log(feedbackInfo);
	if (feedbackInfo["alert"] === 1) {
		return feedbackInfo["feedback"];
	}


	const newQA = {
		"question": newQuestion,
		"answer": newAnswer,
		"answer_embedding": await measureVectorEmbeddingStr(newAnswer),
		"recency": 6
	}

	questionAnswers.push(newQA);
	combined = [newQA].concat(combined);
	const t2NewQuestions = await generateQuestionsT2QuestionAnswer(newQuestion, newAnswer);
	const t2NewQuestionsImportance = await measureImportanceT2(t2NewQuestions);
	const t2NewQuestionsImportanceEmbedding = await measureVectorEmbedding(t2NewQuestionsImportance);

	updateRecencyOfQuestionAnswers();

	questions["T2"] = questions["T2"].concat(t2NewQuestionsImportanceEmbedding);
	console.log(annotations, questionAnswers);

	setAnnotationItems(combined);

	postQuestionAnswer(newQuestion, newAnswer, t2NewQuestionsImportanceEmbedding);

	return true;
}

async function checkAnswerValidity(answer, question) {
	console.log(answer, question);
	const input = [
		{
			"role": "user",
			"content": prompts.IntroDataTherapist + `
				Here is the answer about the question: ` + answer + `
				and here is the question:` + question.Question + `
				Here is the task:
				` + prompts.TaskV1 + `
				Output in the following manner:` + 
			 + prompts.OutputFormatV1 + `
			 If you find no issue, then answer 0 for "alert", and an empty string for "feedback".
			 If there exists an issue, then answer 1 for "alert", and provide feedback for "feedback". 
			 `
		}
	]

	const text = {
		format: {
			type: "json_schema",
			name: "t1questions",
			schema: {
				type: "object",
				properties: {
					alert: { type: "number" },
					feedback: { type: "string" }
				},
				required: ["alert", "feedback"],
				additionalProperties: false
			}
		}
	}

	const response = await openai.responses.create({
		model: model,
		input: input,
		text: text
	});

	const feedbackInfo = JSON.parse(response.output_text);
	return feedbackInfo;
}

function updateRecencyOfAnnotations() {
	annotations.forEach((annotation) => {
		annotation["recency"] -= 1;
	});
}

function updateRecencyOfQuestionAnswers() {
	questionAnswers.forEach((questionAnswer) => {
		questionAnswer["recency"] -= 1;
	});
}

export function annotatedDatafromTableAnnotation(annotatedData) {
	const cols = annotatedData["cols"];
	let colNames = cols.map(col => columns[col]);
	let rows = annotatedData["rows"];

	if (rows.length === 0) {
		rows = dataObj.map((_, i) => i);
	}

	if (cols.length === 0) {
		colNames = JSON.parse(JSON.stringify(columns));
	}

	const annotatedDataArr = [];

	rows.forEach((rownum) => {
		const row = dataObj[rownum];
		const annotatedRow = {};
		colNames.forEach((colName) => {
			annotatedRow[colName] = row[colName];
		});
		annotatedRow["row number"] = rownum;
		annotatedDataArr.push(annotatedRow);
	});

	return annotatedDataArr;
}

export function annotatedDatafromVisualAnnotation(annotatedData) {
	const brushedPointsList = [];
	const attributeInfo = [];
	const attributeList = [];
	[0, 1, 2, 3].forEach((i) => {
		if (annotatedData[i]["attribute"] !== null) {
			brushedPointsList.push(annotatedData[i]["brushedPoints"]);
			if (typeof annotatedData[i]["attribute"] === "string") {
				attributeInfo.push({
					"attribute": annotatedData[i]["attribute"],
					"brushed range": annotatedData[i]["range"],
					"range of the entire dataset": annotatedData[i]["domian"]
				});
				attributeList.push(annotatedData[i]["attribute"]);
			}
			else {
				attributeInfo.push({
					"attribute": annotatedData[i]["attribute"][0],
					"brushed range": annotatedData[i]["range"][0],
					"range of the entire dataset": annotatedData[i]["domain"][0]
				});
				attributeInfo.push({
					"attribute": annotatedData[i]["attribute"][1],
					"brushed range": annotatedData[i]["range"][1],
					"range of the entire dataset": annotatedData[i]["domain"][1]
				});
				attributeList.push(annotatedData[i]["attribute"][0]);
				attributeList.push(annotatedData[i]["attribute"][1]);
			}
		}
	});

	// brushedPointsList 내 List의 교집합
	const brushedPoints = brushedPointsList.reduce((a, b) => a.filter(c => b.includes(c)));
	const annoatedDataArr = [];

	brushedPoints.forEach((rownum) => {
		const row = dataObj[rownum];
		const annotatedRow = {};
		attributeList.forEach((colName) => {
			annotatedRow[colName] = row[colName];
		});
		annotatedRow["row number"] = rownum;
		annoatedDataArr.push(annotatedRow);
	});
	return {
		"data points": annoatedDataArr,
		"brushing information": attributeInfo
	}
}

async function generateQuestionsT2QuestionAnswer(newQuestion, newAnswer) {
	// console.log(newQuestion, newAnswer);
	const input = [
		{
			"role": "user", "content": prompts.IntroDataTherapist + `
			Here is the dataset: 	` + dataStr + `
			And here is the annotations and questions made by annotators:
		` + JSON.stringify(annotations.map(annot => annot.annotation)) + JSON.stringify(questions["T2"].map(q => q.Question)) + `
			Here is the most recently answered question and answer:
		` + JSON.stringify({ "question": newQuestion.Question, "answer": newAnswer }) + `
			Here is the task:
			` + prompts.TaskQT2 + `
			Create the output in the following manner:
			` + prompts.OutputFormatQT2
		}
	];


	const text = {
		format: {
			type: "json_schema",
			name: "t1questions",
			schema: {
				type: "object",
				properties: {
					questions: {
						type: "array",
						items: {
							type: "object",
							properties: {
								Question: { type: "string" },
								createdBy: { type: "string" },
								relatedRow: {
									type: "array",
									items: { type: "number" }
								},
								relatedCol: {
									type: "array",
									items: { type: "string" }
								}
							},
							// Make sure to include this line:
							additionalProperties: false,
							required: ["Question", "createdBy", "relatedRow", "relatedCol"]
						}
					}
				},
				required: ["questions"],
				additionalProperties: false
			}
		}
	};

	const response = await openai.responses.create({
		model: model,
		input: input,
		text: text
	});

	const t2NewQuestions = JSON.parse(response.output_text)["questions"];
	return t2NewQuestions;

}

async function generateQuestionsT2Annotations(currAnnotation) {
	// T2: derived from the annotations
	const annotInput = {
		"annotation": currAnnotation.annotation,
		"annotatedData": currAnnotation.annotatedData
	}
	const input = [
		{ "role": "user", "content": prompts.IntroDataTherapist + `
			Here is the dataset: 	` + dataStr + `
			And here is the annotations and questions made by annotators: 
		` + JSON.stringify(annotations.map(annot => annot.annotation)) + 
		JSON.stringify(questions["T2"].map(q => q.Question)) +
		`
			Here is the most recently referenced data instance and annotation:
		` + JSON.stringify(annotInput) + `
			Here is the task:
			` + prompts.TaskQT2 + `
			Create the output in the following manner:
			` + prompts.OutputFormatQT2
	}];

	const text = {
		format: {
			type: "json_schema",
			name: "t1questions",
			schema: {
				type: "object",
				properties: {
					questions: {
						type: "array",
						items: {
							type: "object",
							properties: {
								Question: { type: "string" },
								createdBy: { type: "string" },
								relatedRow: {
									type: "array",
									items: { type: "number"}
								},
								relatedCol: {
									type: "array",
									items: { type: "string"}
								}
							},
							// Make sure to include this line:
							additionalProperties: false,
							required: ["Question", "createdBy", "relatedRow", "relatedCol"]
						}
					}
				},
				required: ["questions"],
				additionalProperties: false
			}
		}
	};

	const response = await openai.responses.create({
		model: model,
		input: input,
		text: text
	});

	const t2NewQuestions = JSON.parse(response.output_text)["questions"];
	return t2NewQuestions;
}


function dataToStr(data) {
  //현재 형태: [{"att1": "val1", "att2": "val2"}, {"att1": "val3", "att2": "val4"}, ...]
	// table 형태로 변경

	if (data.length > 3000) {
		// random sampling
		const sampledData = [];

		for (let i = 0; i < 1000; i++) {
			const randomIndex = Math.floor(Math.random() * data.length);
			sampledData.push(data[randomIndex]);
		}
		data = sampledData;
	}

	let dataStr = ""
	for (let i = 0; i < data.length; i++) {
		const row = data[i];
		if (i == 0) {
			dataStr += "|";
			for (const key in row) {
				dataStr += key + " | ";
			}
			dataStr += "\n";
		}
		dataStr += "|";
		for (const key in row) {
			dataStr += row[key] + " | ";
		}
		dataStr += "\n";
	}

	return dataStr;
}

async function getT1Questions(dataStr) {
	// T1: derived from the dataset
  const input = [
		{ "role": "user", "content": prompts.IntroDataTherapist + `
			 Here is the dataset: 	` + dataStr + `
			 Here is the task:
			` + prompts.TaskQT1 + `
			 Create the output in the following manner:
			` + prompts.OutputFormatQT1
		} 
	]

	const text = {
		format: {
			type: "json_schema",
			name: "t1questions",
			schema: {
				type: "object",
				properties: {
					questions: {
						type: "array",
						items: {
							type: "object",
							properties: {
								Question: { type: "string" },
								createdBy: { type: "string" }
							},
							// Make sure to include this line:
							additionalProperties: false,
							required: ["Question", "createdBy"]
						}
					}
				},
				required: ["questions"],
				additionalProperties: false
			}
		}
	};


	const response = await openai.responses.create({
		model: model, 
		input: input,
		text: text
	})
	const t1Questions = JSON.parse(response.output_text);
	return t1Questions;
}

let prevAnnotationItems = "";

export async function updateMetadataInner(annotationItems, oldMetadata) {

	const currAnnotationItems = JSON.stringify(annotationItems);
	if (prevAnnotationItems === currAnnotationItems) {
		return oldMetadata;
	}
	if (annotationItems.length === 0) {
		throw new Error("Annotation items should not be empty");
	}
	prevAnnotationItems = JSON.stringify(annotationItems);

	const input = [
		{ "role": "user", "content": prompts.IntroDataTherapist + `
			Here is the dataset: 	` + dataStr + `
			And here is the annotations and questions made by annotators:
			` + JSON.stringify(annotationItems.map(item => {
				return {
					"annotation": item.annotation,
					"annotatedData": item.annotatedData
				}
			})) + `
			Here is the old metadata. Be sure that you should "update", and not should completely rewrite the metadata:
			`
			+ JSON.stringify(oldMetadata) +
			`
			Here is the task:
			` + prompts.GenerateMetadata + `
			Create the output in the following manner:
			` + prompts.GenerateMetadataOutputFormat
		}
	]

	const text = {
		format: {
			type: "json_schema",
			name: "metadata",
			schema: {
				type: "object",
				properties: {
					items: {
						type: "array",
						items: {
							type: "object",
							properties: {
								title: { type: "string" },
								content: { type: "string" }
							},
							required: ["title", "content"],
							additionalProperties: false
						}
					}
				},
				required: ["items"],
				additionalProperties: false
			}
		}
	};

	const response = await openai.responses.create({
		model: model,
		input: input,
		text: text
	});

	const metadata = JSON.parse(response.output_text)["items"];

	return metadata;
} 