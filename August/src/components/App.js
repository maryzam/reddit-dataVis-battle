import React, { Fragment } from 'react';
import Story from './Story';

const Header = () => (
		<header> 
			<h1>They lost my luggage! They broke my arm!</h1>
			<h2>What could happen if you decide to travel by air?</h2>
		</header>
	);

const Footer = () => (
		<footer>
		  	<p>Created | <a href="http://twitter.com/maryzamcode" targer="_blank">Mary Zam</a></p>
	  		<p>Data | <a href="https://www.dhs.gov/tsa-claims-data" targer="_blank">TSA Claims Data</a></p>
		</footer>
	);

const App = () => (
		<Fragment>
			<Header />
			<Story />
			<Footer />
		</Fragment>
	);

export default App;