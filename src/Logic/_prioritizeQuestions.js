
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


export async function measureImportanceT2(questionsT2) {
	const input = [{
		"role": "user", "content": prompts.EvaluateImportance + JSON.stringify(questionsT2)
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
									items: { type: "number" }
								},
								relatedCol: {
									type: "array",
									items: { type: "string" }
								},
								Importance: { type: "number" }
							},
							// Make sure to include this line:
							additionalProperties: false,
							required: ["Question", "createdBy", "relatedRow", "relatedCol", "Importance"]
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

const embeddingModel = "text-embedding-3-small"

export async function measureVectorEmbedding(questions) {
	const finalEmbeddings = await Promise.all(questions.map(async (question) => {
		const embedding = await openai.embeddings.create({
			model: embeddingModel,
			input: question.Question,
			encoding_format: "float"
		});
		return embedding.data[0]["embedding"];
	}));

	questions.forEach((question, i) => {
		question["embedding"] = finalEmbeddings[i];
	});

	return questions;

}

export async function measureVectorEmbeddingStr(query) {
	const embedding = await openai.embeddings.create({
		model: embeddingModel,
		input: query,
		encoding_format: "float"
	});
	return embedding.data[0]["embedding"];
}