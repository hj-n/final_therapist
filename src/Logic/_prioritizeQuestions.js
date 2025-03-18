
import * as prompts from "./prompts";

import { model, openai, questions } from "./_createQuestions";

export async function measureImportanceT1(questionsT1) {
	const input 	= [{
		"role": "user", "content": prompts.EvaluateImportance + JSON.stringify(questionsT1)
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
								Importance: { type: "number" }
							},
							// Make sure to include this line:
							additionalProperties: false,
							required: ["Question", "createdBy", "Importance"]
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

	const t1QuestionsImportance = JSON.parse(response.output_text);
	return t1QuestionsImportance["questions"];
}	