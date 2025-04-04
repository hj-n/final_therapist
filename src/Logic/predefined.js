export const predefined_T3 = [
	{
		"Theme": "Motivation",
		"Number": 3,
		"list": [
			{
				"Question": "For what purpose was the dataset created?"
			},
			{
				"Question": "Who created the dataset (e.g., which team, research group) and on behalf of which entity (e.g., company, institution, organization)?"
			},
			{
				"Question": "Who funded the creation of the dataset? If there is an associated grant, provide the name of the grantor and the grant name and number."
			}
		]
	},
    {
		"Theme": "Composition",
		"Number": 13,
		"list": [
			{
				"Question": "Who created the dataset (e.g., which team, research group) and on behalf of which entity (e.g., company, institution, organization)?"
			},
			{
				"Question": "Who funded the creation of the dataset? If there is an associated grant, provide the name of the grantor and the grant name and number."
			},
			{
				"Question": "Does the dataset contain all possible instances or is it a sample (not necessarily random) of instances from a larger set?"
			},
			{
				"Question": "What data does each instance consist of? \"Raw\" data (e.g., unprocessed text or images) or features?"
			},
			{
				"Question": "Are relationships between individual instances made explicit (for example, users' movie ratings, social network links)?"
			},
			{
				"Question": "Are there recommended data splits (e.g., training, development/validation, testing)?"
			},
			{
				"Question": "Are there any errors, sources of noise, or redundancies in the dataset?"
			},
			{
				"Question": "Is the dataset self-contained, or does it link to or otherwise rely on external resources (e.g., websites, tweets, other datasets)?"
			},
			{
				"Question": "Does the dataset contain data that might be considered confidential (e.g., data that is protected by legal, privacy, or confidentiality issues)?"
			},
			{
				"Question": "Does the dataset contain data that, if viewed directly, might be offensive, insulting, threatening, or might otherwise cause anxiety?"
			},
			{
				"Question": "Does the dataset identify any subpopulations (for example, by age, gender?)"
			},
			{
				"Question": "Is it possible to identify individuals (that is, one or more natural persons), either directly or indirectly (that is, in combination with other data) from the dataset?"
			},
			{
				"Question": "Does the dataset contain data that might be considered sensitive in any way (for example, data that reveals race or ethnic origins, sexual orientations, religious beliefs, political opinions or union memberships, or locations; financial or health data; biometric or genetic data; forms of government identification, such as social security numbers; criminal history)?"
			}
		]
	},
    {
		"Theme": "Collection_process",
		"Number": 11,
		"list": [
			{
				"Question": "How was the data associated with each instance acquired? Was the data directly observable (for example, raw text, movie ratings), by subjects (for example, survey responses), or indirectly inferred/derived from other data (for example, part-of-speech tags, model-based guesses for age or language)? "
			},
			{
				"Question": "What mechanisms or procedures were used to collect the data (for example, hardware apparatuses or sensors, manual human curation, software programs, software APIs)?"
			},
			{
				"Question": "If the dataset was a sample from a larger set, what was the sampling strategy (for example, deterministic, probabilistic with specific sampling probabilities)? "
			},
			{
				"Question": "Who was involved in the data collection process (for example, students, crowdworkers, contractors) and how were they compensated (for example, how much were crowdworkers paid)?"
			},
			{
				"Question": "Over what timeframe was the data collected?"
			},
			{
				"Question": "Were any ethical review processes conducted (e.g., by an institutional review board)?"
			},
			{
				"Question": "Did you collect the data from the individuals in question directly, or obtain it from third parties or other sources (e.g., websites)?"
			},
			{
				"Question": "Were the individuals in questions notified about the data collection?"
			},
			{
				"Question": "Did the individuals in question consent to the collection of their data?"
			},
			{
				"Question": "If consent was obtained, were the individuals provided with a mechanism to revoke their consent in the future or for certain uses?"
			},
			{
				"Question": "Has an analysis of the potential impact of the dataset and its use on data subjects (e.g., a data protection impact analysis) been conducted?"
			}
		]
	},
    {
		"Theme": "Preprocessing",
		"Number": 3,
		"list": [
			{
				"Question": "Was any preprocessing/cleaning/labeling of the data done? (for example, discretization or bucketing, tokenization, part-of-speech tagging, SIFT feature extraction, removal of instances, processing of missing values)?"
			},
			{
				"Question": "Was the \"raw\" data saved in addition to the preprocessed/cleaned/labeled data? (e.g., to support unanticipated future uses)?"
			},
			{
				"Question": "Is the software used to preprocess/clean/label the instances available?"
			}
		]
	},
    {
		"Theme": "Uses",
		"Number": 5,
		"list": [
			{
				"Question": "Has the dataset been used for any tasks already? "
			},
			{
				"Question": "Is there a repository that links to any or all papers or systems that use the dataset?"
			},
			{
				"Question": "What (other) tasks could the dataset be used for?"
			},
			{
				"Question": "Is there anything about the composition of the dataset or the way it was collected and preprocessed/cleaned/labeled that might impact future uses?"
			},
			{
				"Question": "Are there tasks for which the dataset should not be used?"
			}
		]
	},
    {
		"Theme": "Distribution",
		"Number": 6,
		"list": [
			{
				"Question": "Will the dataset be distributed to third parties outside of the entity (e.g., company, institution, organization) on behalf of which the dataset was created?"
			},
			{
				"Question": "How will the dataset be distributed (e.g., tarball on a website, API, GitHub)?"
			},
			{
				"Question": "When will the dataset be distributed?"
			},
			{
				"Question": "Will the dataset be distributed under a copyright or other intellectual property (IP) license, and/or under applicable terms of use (ToU)?"
			},
			{
				"Question": "Have any third parties imposed IP-based or other restrictions on the data associated with the instances?"
			},
			{
				"Question": "Do any export controls or other regulatory restrictions apply to the dataset or to individual instances?"
			}
		]
	},
    {
		"Theme": "Maintenance",
		"Number": 6,
		"list": [
			{
				"Question": "Who will be supporting/hosting/maintaining the dataset?"
			},
			{
				"Question": "How can the owner/curator/manager of the dataset be contacted (e.g., email address)?"
			},
			{
				"Question": "Will the dataset be updated? (for example, to correct labeling errors, add new instances, delete instances)?"
			},
			{
				"Question": "If the dataset related to people, are there applicable limits on the retention of the data associated with the instances (for example, were the individuals in question told that their data would be retained for a fixed period of time and then deleted)?"
			},
			{
				"Question": "Will older versions of the dataset continue to be supported/hosted/maintained?"
			},
			{
				"Question": "If others want to extend/augment/build on the dataset, is there a mechanism for them to do so?"
			}
		]
	}
]