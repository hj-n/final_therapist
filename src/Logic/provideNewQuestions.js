// 예시: questionCandidates를 20~30개 이상 준비해서
// questionNum만큼 중복 허용 랜덤으로 뽑는다.

export function provideNewQuestions(questionNum) {
	const questionCandidates = [
		"Why is the dataset important?",
		"What is the dataset about?",
		"What is the dataset's source?",
		"What is the dataset's license?",
		"When was the dataset published?",
		"What is the dataset's format?",
		"How large is the dataset?",
		"What is the dataset's granularity?",
		"What are potential use cases?",
		"What are the dataset's limitations?",
		"What are the dataset's biases?",
		"What are the dataset's privacy concerns?",
		"What are the dataset's ethical considerations?",
		"What are the dataset's security concerns?",
		"What are the dataset's data cleaning needs?",
		"What are the dataset's data preprocessing needs?",
		"What transformations are needed?",
		"How can the dataset be augmented?",
		"How is the dataset labeled?",
		"How is the dataset annotated?",
		// 필요하다면 더 추가
	];

	// 중복 허용: 원하는 개수만큼 랜덤 추출
	const newQ = [];
	for (let i = 0; i < questionNum; i++) {
		newQ.push(
			questionCandidates[
			Math.floor(Math.random() * questionCandidates.length)
			]
		);
	}
	return newQ;
}
