import { min } from "d3";
import { questions } from "./_createQuestions";



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

	// return the top 10 questions if > 10 else return all
	if (questionsT1.length <= 10) return questionsT1;
	else return questionsT1.slice(0, 10);
}

function rankT3Questions(k = 10) {
	// 1) 원본 수정 방지를 위해 필요한 정보만 복사

	const questionsT3 = questions["T3"];
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

		// 결과에 저장
		sampled.push(selectedQuestion);
	}

	return sampled;
}

function rankT2Questions() {
	return [];
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