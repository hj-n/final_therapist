import OpenAI from "openai";


import predefined_T3 from "./predefined.json" ;
import apiKey from "./api.json";

import * as prompts from "./prompts";
import { measureImportanceT1 } from "./_prioritizeQuestions";
import { returnTopRankedQuestions } from "./_extractQuestions";

export const questions = {
	"T1": [],
	"T2": [],
	"T3": predefined_T3,
}

export let annotatedData = null; // 계속 global variable로 쓰임

export function setAnnotatedData (data)  {
	annotatedData = data;
}

export const annotations = [];
export const questionAnswers = [];


export const openai = new OpenAI({
	apiKey: apiKey[0],
	dangerouslyAllowBrowser: true
})


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
	questions["T1"] = dataset_T1_importance;
}


export async function addAnnotation(newAnnotation, newAnnotatedData) {
	let annoatedDataTransformed;
	if ("cols" in newAnnotatedData) {
		annoatedDataTransformed = annotatedDatafromTableAnnotation(newAnnotatedData);
	} else {
		annoatedDataTransformed = annotatedDatafromVisualAnnotation(newAnnotatedData);
	}
	const currAnnotation = { 
		"annotation": newAnnotation,
		"annotatedData": annoatedDataTransformed
	};
	annotations.push(currAnnotation);
	const t2NewQuestions = await generateQuestionsT2Annotations(currAnnotation);

	questions["T2"] = questions["T2"].concat(t2NewQuestions);

}

export async function addQuestionAnswer(newQuestion, newAnswer) {
	questionAnswers.push({
		"question": newQuestion,
		"answer": newAnswer
	});

	const t2NewQuestions = await generateQuestionsT2QuestionAnswer(newQuestion, newAnswer);

	questions["T2"] = questions["T2"].concat(t2NewQuestions);
	console.log(questions["T2"]);
}

function annotatedDatafromTableAnnotation(annotatedData) {
	const cols = annotatedData["cols"];
	console.log(columns);
	const colNames = cols.map(col => columns[col]);
	const rows = annotatedData["rows"];

	const annotatedDataArr = [];
	for (const rownum in rows) {
		const row = rows[rownum];
		const annotatedRow = {};
		for (const colName in colNames) {
			annotatedRow[colName] = row[colName];
		}
		annotatedRow["row number"] = rownum;
		annotatedDataArr.push(annotatedRow);
	}
	return annotatedDataArr;
}

function annotatedDatafromVisualAnnotation(annotatedData) {
	const brushedPointsList = [];
	const attributeInfo = [];
	const attributeList = [];
	[0, 1, 2, 3].forEach((i) => {
		if (annotatedData[i]["attribute"] !== null) {
			brushedPointsList.push(annotatedData[i]["brushedPoints"]);
			if (typeof annotatedData[i]["attribute"] === "string") {
				attributeInfo.push({
					"attribute": annotatedData[i]["attribute"],
					"brushed range": annotatedData[i]["domain"],
					"range of the entire dataset": annotatedData[i]["range"]
				});
				attributeList.push(annotatedData[i]["attribute"]);
			}
			else {
				attributeInfo.push({
					"attribute": annotatedData[i]["attribute"][0],
					"brushed range": annotatedData[i]["domain"][0],
					"range of the entire dataset": annotatedData[i]["range"][0]
				});
				attributeInfo.push({
					"attribute": annotatedData[i]["attribute"][1],
					"brushed range": annotatedData[i]["domain"][1],
					"range of the entire dataset": annotatedData[i]["range"][1]
				});
				attributeList.push(annotatedData[i]["attribute"][0]);
				attributeList.push(annotatedData[i]["attribute"][1]);
			}
		}
	});

	// brushedPointsList 내 List의 교집합
	const brushedPoints = brushedPointsList.reduce((a, b) => a.filter(c => b.includes(c)));
	const annoatedDataArr = [];
	for (const rownum in brushedPoints) {
		const row = dataObj[rownum];
		const annotatedRow = {};
		attributeList.forEach((colName) => {
			annotatedRow[colName] = row[colName];
		});
		annotatedRow["row number"] = rownum;
		annoatedDataArr.push(annotatedRow);
	}
	return {
		"data points": annoatedDataArr,
		"brushing information": attributeInfo
	}
}

async function generateQuestionsT2QuestionAnswer(newQuestion, newAnswer) {
	const input = [
		{
			"role": "user", "content": prompts.IntroDataTherapist + `
			Here is the dataset: 	` + dataStr + `
			And here is the annotations and questions made by annotators:
		` + JSON.stringify(annotations.map(annot => annot.annotation)) + JSON.stringify(questions["T2"]) + `
			Here is the most recently answered question and answer:
		` + JSON.stringify({ "question": newQuestion, "answer": newAnswer }) + `
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
	const input = [
		{ "role": "user", "content": prompts.IntroDataTherapist + `
			Here is the dataset: 	` + dataStr + `
			And here is the annotations and questions made by annotators: 
		` + JSON.stringify(annotations.map(annot => annot.annotation)) + JSON.stringify(questions["T2"]) + `
			Here is the most recently referenced data instance and annotation:
		` + JSON.stringify(currAnnotation) + `
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