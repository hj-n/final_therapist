import React, { useEffect, useState } from "react";

import styles from "./Questions.module.scss";

// import { provideNewQuestions } from "../Logic/provideNewQuestions";

import { returnTopRankedQuestions } from "../Logic/_extractQuestions";
import LoadingOverlay from "../SubComponents/LoadingOverlay";
import { set } from "zod";
import { addQuestionAnswer } from "../Logic/_createQuestions";
import { postRemovedQuestion } from "../Logic/_toserver";

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

		const  question = questions[i];
		const ans = answer[i];

		setLoading(true);
		addQuestionAnswer(question, ans).then((response) => {
			setLoading(false);

			console.log(response);
			if (response !== true) {
				questions[i].feedback = response;
				return; 
			}

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

		}).catch((err) => {
			console.log(err);
		});


	}

	const removeQuestion = (e, i) => {

		e.stopPropagation();

		// function 1: remove the question from the list, inform the DB

		// function 2: remove the question from the list
		setFadingIndices((prev) => [...prev, i]);

		const question = questions[i];
		postRemovedQuestion(question)

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
			{loading && <LoadingOverlay />}
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
								<div className={styles.boldText}>
								{
									(q.relatedCol !== undefined && q.relatedCol.length > 0) ?
									(
										<p>{"Related columns: "}<b>{q.relatedCol.reduce(
											(acc, cur) => acc + ", " + cur
												)}</b></p>
									) : <></>
								
								}
								{
									q.relatedRow !== undefined && q.relatedRow.length > 0 ?
									(
												<p>{`Ranges from data item`} <b>{`${q.relatedRow[0]} to ${q.relatedRow[1]}`}</b></p>
									) : <></>
								}
								</div>
								<div className={styles.pText}>
									<p>{q.Question}</p>
									{((q.createdBy === "T1") || (q.createdBy === "T2")) && <img src="./imgs/therapist_mark.png"></img>}
								</div>
								{q.feedback && <p className={styles.feedback}>{q.feedback}</p>}
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