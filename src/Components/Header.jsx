import React from "react";
import styles from "./Header.module.scss";

const Header = () => {
	return (
		<div className={styles.header}>
			<h1>Data Therapist</h1>
			<div className={styles.exportButtons}>
				<button type="button">export as csv</button>
				<button type="button">export as json</button>
			</div>
		</div>
	);
};

export default Header;