import axios from 'axios';

import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3 });

const server_url = "http://gpu3.hcil.snu.ac.kr:5002";

let pid = null;

export function setPid (newPid) {
	pid = newPid;
}


export function postInitialQuestions(initialQuestions) {
	axios.post(server_url + "/initialQuestions", {
		pid: pid,
		initialQuestions: initialQuestions
	}).then((response) => {

	}).catch((error) => {
		alert("Error: " + error, "Please check the server");
	});
}

export function postAnnotation(annotation, newQuestions, annotationType) {
	axios.post(server_url + "/annotation", {
		pid: pid,
		annotation: annotation,
		newQuestions: newQuestions,
		annotationType: annotationType
	}).then((response) => {

	}).catch((error) => {
		alert("Error: " + error, "Please check the server");
	})
}

export function postQuestionAnswer(question, answer, newQuestions) {
	axios.post(server_url + "/questionAnswer", {
		pid: pid,
		question: question,
		answer: answer,
		newQuestions: newQuestions
	}).then((response) => {

	}).catch((error) => {
		alert("Error: " + error, "Please check the server");
	})
}

export function postRemovedQuestion(question) {
	axios.post(server_url + "/removeQuestion", {
		pid: pid,
		question: question
	}).then((response) => {

	}).catch((error) => {
		alert("Error: " + error, "Please check the server");
	})
}