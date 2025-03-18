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

export const openai = new OpenAI({
	apiKey: apiKey[0],
	dangerouslyAllowBrowser: true
})

export const model = "gpt-4o-mini-2024-07-18";

export async function initiateQuestions(data) {
	const dataStr = dataToStr(data);
	const dataset_T1 = await getT1Questions(dataStr);
	const dataset_T1_importance = await measureImportanceT1(dataset_T1);
	questions["T1"] = dataset_T1_importance;


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