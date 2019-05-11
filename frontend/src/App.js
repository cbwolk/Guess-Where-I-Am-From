import React, { Component } from 'react';
import './App.css';
import ResultsMap from './ResultsMap.js';






class Question extends Component {

    constructor(props) {
        super(props);

        // Default all answers to false
        let answers = [];
        for (let i = 0; i < this.props.options.length; i++) {
            answers.push(false);
        }

        // Set initial state
        this.state = {
            answers: answers
        }
    }


    render() {

        const options = this.props.options.map((option, index) =>
            <label
                key={index}
                className="CheckmarkLabel"
            > {option}
                <input
                    type={this.props.type}
                    name={this.props.id}
                    onChange={(e) => {
                        // Update answers state
                        let answers = [...this.state.answers];
                        answers[index] = e.target.checked;
                        this.setState({answers: answers}, () => {
                            this.props.onAnswerChange(this.props.id, this.state.answers);
                        });
                    }}
                ></input>
                <span className={"Checkmark type-" + this.props.type}></span>
            </label>
        );

        return (
            <div className="QuestionContainer">
                <h1>{(this.props.id + 1) + '. ' +this.props.question}</h1>
                <div className="CheckboxContainer">
                    {options}
                </div>
            </div>
        );
    }
}



class Questions extends Component {

    constructor(props) {
        super(props);

        this.state = {
            questions: [],
            answers: [],
        }

        this.handleAnswerChange = this.handleAnswerChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillMount() {
        fetch("/get-questions")
        .then(res => res.json())
        .then(
            (questions) => {
                let answers = [];
                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    let arr = [];
                    for (let i = 0; i < q.options.length; i++) {
                        arr.push(false);
                    }
                    answers.push(arr);
                }
                this.setState({
                    questions: questions,
                    answers: answers,
                });
                this.props.onAnswerChange(answers);
            }
        );
    }

    // Handle answer change by updating the state variable
    handleAnswerChange(id, answers) {
        let a = [...this.state.answers];
        a[id] = answers;
        this.setState({
            answers: a,
        });
        this.props.onAnswerChange(a);
    }

    // Handle submit of all answers
    handleSubmit() {
        // Send POST request to submit-answers route, which returns a guess
        fetch("/submit-answers",
        {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(this.state.answers)
        })
        .then(res => res.json())
        .then(
            (guess) => {
                this.props.updateGuess(guess);
            }
        );
    }

    render() {

        const questionEls = this.state.questions.map((question, index) =>
            <Question
                id={index}
                key={index}
                question={question.question}
                options={question.options}
                type={question.type}
                onAnswerChange={(id, answers) => {
                    this.handleAnswerChange(id, answers);
                }}
            />
        );

        return (
            <div className="ContentWrapper">
                <div className="ContentContainer">
                    {questionEls}
                    <button
                        onClick={() => {
                            this.handleSubmit();
                        }}
                        className="SubmitButton">
                        Submit
                    </button>
                </div>
            </div>
        );
    }
}


class Popup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showing: true,
        }
        this.select = React.createRef();
    }

    render() {

        const states = ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"];

        let options = []
        for (let i = 0; i < states.length; i++) {
            let state = states[i];
            options.push(
                <option key={state} value={state}>{state}</option>
            )
        }

        let bestState = 'AK';
        let bestWeight = 0;
        Object.keys(this.props.guess).forEach(function(key){
            if (this.props.guess[key] > bestWeight) {
                bestState = key;
                bestWeight = this.props.guess[key];
            }
        }.bind(this));


        return (
            <div
                style={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    pointerEvents: (this.state.showing ? 'auto' : 'none'),
                    opacity: (this.state.showing ? 1 : 0),
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    transition: 'opacity 250ms',
                }}
            >
                <div
                    style={{
                        backgroundColor: 'rgba(255,255,255,1.0)',
                        borderRadius: '10px',
                        padding: '20px 40px',
                        position: 'fixed',
                        top: '40%',
                        left: '50%',
                        width: '60%',
                        maxWidth: '520px',
                        transform: 'translate(-50%,-50%)',
                        textAlign: 'center',
                    }}
                >
                    <h1>Are you from {bestState}?</h1>
                    <br />
                    <button
                        onClick={() => {

                            // Send POST request to update weights
                            fetch("/correct-weights",
                            {
                                headers: {
                                  'Accept': 'application/json',
                                  'Content-Type': 'application/json'
                                },
                                method: "POST",
                                body: JSON.stringify({
                                    answers: this.props.answers,
                                    correctState: bestState
                                })
                            })
                            .then((res) => {
                                this.setState({showing: false});
                            });

                        }}
                    >You got it!</button>
                    <div className="Rule"></div>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();

                            // Send POST request to update weights
                            fetch("/correct-weights",
                            {
                                headers: {
                                  'Accept': 'application/json',
                                  'Content-Type': 'application/json'
                                },
                                method: "POST",
                                body: JSON.stringify({
                                    answers: this.props.answers,
                                    correctState: this.select.current.value
                                })
                            })
                            .then((res) => {
                                this.setState({showing: false});
                            });

                        }}
                    >
                        <span>Nope, I'm from </span>
                        <select
                            ref={this.select}
                        >
                            {options}
                        </select>
                        <button type="submit">Submit</button>
                        <p
                            style={{
                                fontSize: '14px',
                                color: 'gray',
                                marginTop: '20px',
                            }}
                        >
                            Our guesses get better with each response! By telling us your home state when we're wrong, there's a better chance we'll get it right next time ;)
                        </p>
                    </form>
                </div>
            </div>
        );
    }
}

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            guess: undefined,
            answers: undefined,
        }
        this.map = React.createRef();
    }

    render() {
        return (
            <div>
                {
                    typeof this.state.guess === 'undefined' &&
                    <Questions
                        updateGuess={(guess) => {
                            this.setState({guess: guess});
                        }}
                        onAnswerChange={(answers) => {
                            this.setState({answers: answers})
                        }}
                    />
                }
                {
                    typeof this.state.guess !== 'undefined' &&
                    <ResultsMap
                        ref={this.map}
                        guess={this.state.guess}
                    />
                }
                {
                    typeof this.state.guess !== 'undefined' &&
                    <Popup
                        answers={this.state.answers}
                        guess={this.state.guess}
                    />
                }
            </div>
        );
    }
}


export default App;
