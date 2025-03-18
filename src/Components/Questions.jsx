import React, { useEffect, useState } from "react";

import styles from "./Questions.module.scss";

// import { provideNewQuestions } from "../Logic/provideNewQuestions";

import { returnTopRankedQuestions } from "../Logic/_extractQuestions";

const Questions = () => {



	const [questions, setQuestions] = useState([]);
	const [answer, setAnswer] = useState(Array(10).fill(null));

	const [fadingIndices, setFadingIndices] = useState([]);

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setQuestions(returnTopRankedQuestions(10));
	}, []);


	const updateAnswer = (e, i ) => {
		const newAnswer = [...answer];
		newAnswer[i] = e.target.value;
		setAnswer(newAnswer);
	}


	const toggleTextInput = (e, i) => {
		const newAnswer = [...answer];
		if (newAnswer[i] === null) {
			newAnswer[i] = "";
		}
		else if (newAnswer[i] === "") {
			newAnswer[i] = null;
		}
		setAnswer(newAnswer);
	}

	const submitAnswer = (i) => {
		// function 1: submit and store the answer, inform the DB

		// function 2: remove the question from the list
		setFadingIndices((prev) => [...prev, i]);
		
		setTimeout(() => {

			setFadingIndices((prev) => prev.filter((index) => index !== i));
			const newQuestions = [...questions];
			newQuestions.splice(i, 1);
			const newAnswer = [...answer];
			newAnswer.splice(i, 1);

			setQuestions(newQuestions);
			setAnswer(newAnswer);
		}, 500);
	}

	const removeQuestion = (e, i) => {

		e.stopPropagation();

		// function 1: remove the question from the list, inform the DB

		// function 2: remove the question from the list
		setFadingIndices((prev) => [...prev, i]);

		setTimeout(() => {
			setFadingIndices((prev) => prev.filter((index) => index !== i));
			const newQuestions = [...questions];
			newQuestions.splice(i, 1);
			const newAnswer = [...answer];
			newAnswer.splice(i, 1);

			setQuestions(newQuestions);
			setAnswer(newAnswer);
		}, 500);
	}

	const addNewQuestions = (e) => {
		// count the current number of questions
		const currentNumQuestions = questions.length;

		// add new questions
		const newQuestions = returnTopRankedQuestions(10 - currentNumQuestions);

		// add new questions to the list
		setQuestions([...questions, ...newQuestions]);
		setAnswer([...answer, ...Array(newQuestions.length).fill(null)]);

		const newQuestionIndices = Array(newQuestions.length).fill(0).map((_, i) => currentNumQuestions + i);

		
	}

	


	return (
		<div className={styles.questionWrapper}>
			<div className={styles.titleWrapper}>
				<h3>{"Ask Data Therapist"}</h3>
				<button
					onClick={(e) => {addNewQuestions(e)}}
					disabled={questions.length >= 5}
				>{"Request New Questions"}</button>
			</div>

			<div id="questionList">
				{questions.map((q, i) => {
					const isFading = fadingIndices.includes(i);
					return (
						<div 
							key={i} 
							className={`${styles.question} ${isFading ? styles.fadeOut : ""}`}
							onClick={(e) => {toggleTextInput(e, i)}}
						>
							<div 
								className={styles.questionX}
								onClick={(e) => {removeQuestion(e, i)}}
							>
								<img 
									src="./svgs/xmark.svg" 
									width="20px"
									alt="xmark"
								/>
							</div>
							<div className={styles.questionText}>
								<p>{q}</p>
								<textarea
									className={styles.answerInput}
									value={answer[i] || ""}
									onClick={(e) => {
										e.stopPropagation();
									}}
									onChange={(e) => {
										updateAnswer(e, i);
										e.target.style.height = "auto"; // 높이 초기화
										e.target.style.height = `${e.target.scrollHeight}px`; // 내용에 맞게 높이 조절
									}}
									placeholder="Type your answer and press Enter"
									autoFocus
									disabled={answer[i] === null}
									style={{
										display: answer[i] === null ? "none" : "block",
										overflow: "hidden",
										resize: "none",
										minHeight: "40px", // 기본 높이
									}}
								/>
								<div
									style={{ display: answer[i] === null ? "none" : "flex" }}
									className={styles.buttonWrapper}
								>
									<button
										onClick={() => {submitAnswer(i)}}
									>Submit</button>
								</div>

							</div>
						</div>
					);
				})}
			</div>
		</div>
	)
}

export default Questions;