import React, { useEffect, useState } from "react";

import styles from "./Questions.module.scss";

import { provideNewQuestions } from "../Logic/provideNewQuestions";

import * as d3 from "d3";

const Questions = () => {



	const [questions, setQuestions] = useState([]);
	const [answer, setAnswer] = useState(Array(10).fill(null));

	const [fadingIndices, setFadingIndices] = useState([]);

	useEffect(() => {
		setQuestions(provideNewQuestions(10));
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
		// function 1: submit and store the answer

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

	


	return (
		<div className={styles.questionWrapper}>
			<h3>{"Ask Data Therapist"}</h3>
			<div id="questionList">
				{questions.map((q, i) => {
					const isFading = fadingIndices.includes(i);
					return (
						<div 
							key={i} 
							className={`${styles.question} ${isFading ? styles.fadeOut : ""}`}
							onClick={(e) => {toggleTextInput(e, i)}}>
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