import React from 'react';
import axios from 'axios';
import Joke from './Joke';
import './JokeList.css';

class JokeList extends React.Component {
	static defaultProps = { numJokesToGet: 10 };
	constructor(props) {
		super(props);
		this.state = { jokes: this.checkLocalStorage() };
		this.numJokesToGet = props.numJokesToGet;
		this.generateNewJokes = this.generateNewJokes.bind(this);
		this.vote = this.vote.bind(this);
		this.resetJokes = this.resetJokes.bind(this);
	}

	checkLocalStorage() {
		let jokes;
		try {
			jokes = JSON.parse(window.localStorage.getItem('jokes') || JSON.stringify([]));
		} catch (e) {
			console.log(e);
			jokes = [];
		}
		console.log(jokes);
		return jokes;
	}

	async getJokes() {
		let j = [ ...this.state.jokes ];
		let seenJokes = new Set();
		try {
			while (j.length < this.props.numJokesToGet) {
				let res = await axios.get('https://icanhazdadjoke.com', {
					headers : { Accept: 'application/json' }
				});
				let { status, ...jokeObj } = res.data;

				if (!seenJokes.has(jokeObj.id)) {
					seenJokes.add(jokeObj.id);
					j.push({ ...jokeObj, votes: 0 });
				}
				else {
					console.error('duplicate found!');
				}
			}
			this.setState({ jokes: j });
		} catch (e) {
			console.log(e);
		}
	}

	componentDidUpdate() {
		window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes));
	}

	generateNewJokes() {
		this.state.jokes = [];
		this.getJokes();
	}

	resetJokes() {
		let updatedJokes = [ ...this.state.jokes ];
		updatedJokes.forEach(j => {
			j.votes = 0;
		});
		this.setState({ jokes: updatedJokes });
	}

	vote(id, delta) {
		let updatedJokes = this.state.jokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j));
		this.setState({ jokes: updatedJokes });
	}

	render() {
		const { jokes } = this.state;
		if (jokes.length) {
			let sortedJokes = [ ...jokes ].sort((a, b) => b.votes - a.votes);

			return (
				<div className="JokeList">
					<button className="JokeList-getmore" onClick={this.generateNewJokes}>
						Get New Jokes
					</button>

					<button className="JokeList-reset" onClick={this.resetJokes}>
						Reset Joke Counts
					</button>

					{sortedJokes.map(j => <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={this.vote} />)}
				</div>
			);
		}
		else {
			return null;
		}
	}
}

export default JokeList;
