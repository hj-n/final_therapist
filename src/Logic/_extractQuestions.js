import { min } from "d3";
import { questions, annotations, questionAnswers } from "./_createQuestions";



export function returnTopRankedQuestions(qNum) {

	let [t1qnum, t2qnum, t3qnum] = [0, 0, 0];
	if (qNum == 6)
		[t1qnum, t2qnum, t3qnum] = [1, 3, 2];
	if (qNum == 7)
		[t1qnum, t2qnum, t3qnum] = [1, 3, 3];
	if (qNum == 8)
		[t1qnum, t2qnum, t3qnum] = [2, 3, 3];
	if (qNum == 9)
		[t1qnum, t2qnum, t3qnum] = [2, 4, 3];
	if (qNum == 10)
		[t1qnum, t2qnum, t3qnum] = [2, 4, 4];

	const t1Questions = rankT1Questions();
	const t2Questions = rankT2Questions();
	const t3Questions = rankT3Questions();

	while (true) {
		if (t1Questions.length >= t1qnum && t2Questions.length >= t2qnum && t3Questions.length >= t3qnum) {
			const lists =  [t1Questions.slice(0, t1qnum), t2Questions.slice(0, t2qnum), t3Questions.slice(0, t3qnum)];
			const finalList = lists.flat();
			finalList.forEach((question, index) => { removeQuestionByStr(question.Question); });
			return finalList;
		}
		if (t1Questions.length < t1qnum) {
			const diff = t1qnum - t1Questions.length;
			t1qnum = t1Questions.length;
			if (diff == 1) {
				t2qnum += 1;
			}
			if (diff == 2) {
				t2qnum += 1;
				t3qnum += 1;
			}
		}

		if (t2Questions.length < t2qnum) {
			const diff = t2qnum - t2Questions.length;
			t2qnum = t2Questions.length;
			if (diff == 1) {
				t3qnum += 1;
			}
			if (diff == 2) {
				t3qnum += 1;
				t1qnum += 1;
			}
			if (diff == 3) {
				t3qnum += 2;
				t1qnum += 1;
			}
			if (diff == 4) {
				t3qnum += 2;
				t1qnum += 2;
			}
		}

		if (t3Questions.length < t3qnum) {
			const diff = t3qnum - t3Questions.length;
			t3qnum = t3Questions.length;
			if (diff == 1) {
				t1qnum += 1;
			}
			if (diff == 2) {
				t1qnum += 1;
				t2qnum += 1;
			}
			if (diff == 3) {
				t1qnum += 1;
				t2qnum += 2;
			}
			if (diff == 4) {
				t1qnum += 2;
				t2qnum += 2;
			}
		}
	}

}


function rankT1Questions() {

	const questionsT1 = questions["T1"];
	// sort questionsT1 by importance (descending). High importance first.
	questionsT1.sort((a, b) => {
		return b.Importance - a.Importance;
	});

	questionsT1.forEach((question) => {question["createdBy"] = "T1";});

	// return the top 10 questions if > 10 else return all
	if (questionsT1.length <= 10) return questionsT1;
	else return questionsT1.slice(0, 10);
}

function rankT3Questions(k = 10) {
	// 1) 원본 수정 방지를 위해 필요한 정보만 복사

	const questionsT3 = questions["T3"];

	questionsT3.forEach(question => { question["createdBy"] = "T3"; });

	const clonedData = questionsT3.map(themeInfo => {
		const ratio = (themeInfo.Number === 0)
			? 0
			: themeInfo.list.length / themeInfo.Number;

		// 질문 텍스트만 추출해 별도로 보관
		const questionsArray = themeInfo.list.map(item => item);

		return {
			theme: themeInfo.Theme,
			ratio,           // (list.length / Number)
			questions: questionsArray
		};
	});

	// 2) 전체 질문 수 계산
	let totalQuestions = 0;
	clonedData.forEach(item => {
		totalQuestions += item.questions.length;
	});

	// 3) 전체 질문 수가 k보다 작으면 가능한 만큼만 뽑기
	if (k > totalQuestions) {
		k = totalQuestions;
	}

	const sampled = [];

	// 4) k번 반복하여 (테마 선택 -> 질문 선택 -> 중복 방지) 진행
	for (let i = 0; i < k; i++) {
		// (4-1) 질문이 남아있는 테마만 후보로 필터링
		const availableThemes = clonedData.filter(t => t.questions.length > 0);
		if (availableThemes.length === 0) {
			break; // 더 이상 뽑을 질문이 없음
		}

		// (4-2) 가중치(ratio) 합
		const ratioSum = availableThemes.reduce((acc, cur) => acc + cur.ratio, 0);
		const pick = Math.random() * ratioSum;

		// (4-3) 누적 가중치에 따라 Theme를 선택
		let chosenTheme = null;
		let cumulative = 0;
		for (const theme of availableThemes) {
			cumulative += theme.ratio;
			if (pick <= cumulative) {
				chosenTheme = theme;
				break;
			}
		}

		// (4-4) 해당 Theme 내에서 질문 하나를 랜덤으로 뽑고, 중복 방지 위해 제거
		const randomIndex = Math.floor(Math.random() * chosenTheme.questions.length);
		const selectedQuestion = chosenTheme.questions[randomIndex];
		chosenTheme.questions.splice(randomIndex, 1);

		selectedQuestion["theme"] = chosenTheme.theme;
		console.log(selectedQuestion);
		// 결과에 저장
		sampled.push(selectedQuestion);
	}

	return sampled;
}

function rankT2Questions() {

	const questionsT2 = questions["T2"];

	questionsT2.forEach(question => { question["createdBy"] = "T2"; });

	// criteria 1: Importance
	const importanceScores = questionsT2.map(question => question.Importance);

	// criteria 2: Recency
	const recencyScores = questionsT2.map(question => question.Recency);

	// criteria 3: Originality

	const previousAnnotationEmbeddings = annotations.map(annotation => annotation.embedding);
	const previousAnswerEmbeddings = questionAnswers.map(qa => qa.answer_embedding);
	const previousQuestionEmbeddings = questionAnswers.map(qa => qa.question.embedding);

	const prevEmbeddings = previousAnnotationEmbeddings.concat(previousAnswerEmbeddings).concat(previousQuestionEmbeddings);

	function cosineSimilarity(a, b) {
		const dotProduct = a.reduce((acc, val, i) => acc + val * b[i], 0);
		const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
		const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
		return dotProduct / (normA * normB);
	}

	const originalityScores = questionsT2.map(question => {
		const currentQuestionEmbedding = question.embedding;
		const similarities = prevEmbeddings.map(prevEmbedding => {
			return cosineSimilarity(currentQuestionEmbedding, prevEmbedding);
		});
		const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
		return 1 - avgSimilarity;
	})

	// criteria 4: Locality

	const previousAnnotationCols = annotations.map(annotation => {
		if (Array.isArray(annotation.annotatedData)) {
			return Object.keys(annotation.annotatedData[0]);
		} else {
			return Object.keys(annotation.annotatedData["data points"][0]);
		}
	});
	const previousAnnotationRows = annotations.map(annotation => {
		if (Array.isArray(annotation.annotatedData)) {
			return annotation.annotatedData.map(datum => datum["row number"])
		} else {
			return annotation.annotatedData["data points"].map(datum => datum["row number"]);
		}
	});
	const previousQACols = questionAnswers.map(qa => {
		return qa.question.relatedCol;
	});

	const previousQARows = questionAnswers.map(qa => {
		return qa.question.relatedRow;
	});

	let previousCols = previousAnnotationCols.concat(previousQACols);
	let previousRows = previousAnnotationRows.concat(previousQARows);

	// fiter undefined
	previousCols = previousCols.filter(col => col !== undefined);
	previousRows = previousRows.filter(row => row !== undefined);

	const localityScores = questionsT2.map(question => {
		const currentCols = question.relatedCol;
		const currentRows = question.relatedRow;

		const colSimilarities = previousCols.map(prevCol => {
			const intersection = currentCols.filter(col => prevCol.includes(col));
			return intersection.length / (currentCols.length + prevCol.length - intersection.length);
		});

		const rowSimilarities = previousRows.map(prevRow => {
			const intersection = currentRows.filter(row => prevRow.includes(row));
			return intersection.length / (currentRows.length + prevRow.length - intersection.length);
		});

		const avgColSimilarity = 1 - colSimilarities.reduce((a, b) => a + b, 0) / colSimilarities.length;
		const avgRowSimilarity = 1 - rowSimilarities.reduce((a, b) => a + b, 0) / rowSimilarities.length;

		return (avgColSimilarity + avgRowSimilarity) / 2;
	});

	// normalize scores
	const normalizedImportance = normalize(importanceScores);
	const normalizedRecency = normalize(recencyScores);
	const normalizedOriginality = normalize(originalityScores);
	const normalizedLocality = normalize(localityScores);

	// combine scores
	const combinedScores = normalizedImportance.map((val, index) => {
		return val + normalizedRecency[index] + normalizedOriginality[index] + normalizedLocality[index];
	});

	// sort questionsT2 by combinedScores (descending). High score first.
	questionsT2.sort((a, b) => {
		return combinedScores[questionsT2.indexOf(b)] - combinedScores[questionsT2.indexOf(a)];
	});

	// return the top 10 questions if > 10 else return all
	if (questionsT2.length <= 10) return questionsT2;
	else return questionsT2.slice(0, 10);
}

function normalize(arr) {
	const minVal = Math.min(...arr);
	const maxVal = Math.max(...arr);
	return arr.map(val => (val - minVal) / (maxVal - minVal));
}

function removeQuestionByStr(questionStr) {
	const questionsT1 = questions["T1"];
	const questionsT2 = questions["T2"];
	const questionsT3 = questions["T3"];
	// remov

	// TODO
	questionsT3.forEach((dictionary, index) => {
		const questionList = dictionary["list"];
		questionList.forEach((question, index) => {
			if (question["Question"] === questionStr) {
				questionList.splice(index, 1);
			}
		});
	});

	questionsT2.forEach(question => {
		if (question["Question"] === questionStr) {
			questionsT2.splice(questionsT2.indexOf(question), 1);
		}
	});

	questionsT1.forEach((question) => {
		if (question["Question"] === questionStr) {
			questionsT1.splice(questionsT1.indexOf(question),
				1);
		}	
	})


}