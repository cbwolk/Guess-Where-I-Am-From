# Guess Where I'm From
#### COMP20 Group Project by Aidan Bauer, Sam Testa, Sam Chung, and Colton Wolk

## General information

### Purpose
Our purpose is to create a web app that will guess where the user's from based on answers to questions.

### How we'll do it
Our web app will ask the user to answer a number of questions, such as which fast food restaurants they've eaten at, what childhood toys they played with, and what foreign dishes they've tried. Based on their answers to each of these questions, the app will try to guess––using regional differences in previous responses and machine learning—–where they're from. After the user completes the survey and receives the guess, they will be asked to enter their true home state, which we will use to improve our algorithm. The sensibility of the questions we ask may impact the success of the algorithm, so we will choose the questions carefully; we need the questions to correlate (at least a little) to different locations across the country. For example, asking someone about fast food restaurants is likely much more effective than asking about favorite colors, as some restaurants are more highly concentrated in certain parts of the country, whereas favorite colors may not have as much of a concrete correlation. 

We will be guessing the user's home state.

The application will store all past responses, including:
- The user's answers to each of the questions
- The application's guess for the user's home state
- The user's actual home state (if voluntarily provided by the user after we guess where they're from)

## Technologies

We'll probably use **React** for the frontend design. The server code will probably be written with **Node.js**. Historical responses will be stored in a **MongoDB** database. We'll write JavaScript code for our algorithm.


## Algorithm

Our algorithm for guessing where the user is from is going to be as follows:
    - Have objects corresponding to each question, each of which will have a list of booleans. If the user checks a box, the corresponding object will have a boolean true in its list. Otherwise, that boolean will remain false.
    - Server will send the answers from the user back, and we will use those answers to guess where the user is from.
    - Each question-option (for example, 'Bojangles') will have a list of 50 key-value pairs, corresponding to the 50 states and our running weight of whether that answer likely corresponds to the respective state
    - Each weight for each key value pair will begin with .02. Thus, the first guess we make will be completely random.
    - After that, we will ask the user to tell us their actual location, and based on that response, we'll rework the weights to include that response.

## APIs

We will probably use the Google Maps API or another map api to show the guessed location.
We also want to implement some sort of heat map where we can say: "This is where we think you're from, here are some of our other guesses too."

## Mockups

### Asking the user questions
![Mockup 1](https://raw.githubusercontent.com/tuftsdev/comp20-s2019-team18/master/mockups/mockup1.png?token=AEJfk5aP9qbELfTZEoRIjqoSRKlKTtxTks5ch9ZKwA%3D%3D)

### Guessing where the user is from
![Mockup 2](https://raw.githubusercontent.com/tuftsdev/comp20-s2019-team18/master/mockups/mockup2.png?token=AEJfk3Lcbqxn9ZzGk0XTFQnSEgSFvXVcks5ch9Z-wA%3D%3D)

### Requesting the user share their location if our guess was incorrect
![Mockup 3](https://raw.githubusercontent.com/tuftsdev/comp20-s2019-team18/master/mockups/mockup3.png?token=AEJfkw17zc7jjxPa3SWoPHDMaRMX9aI8ks5ch9aQwA%3D%3D)

### Thanking the user after they tell us whether our guess was correct
![Mockup 4](https://raw.githubusercontent.com/tuftsdev/comp20-s2019-team18/master/mockups/mockup4.png?token=AEJfk5WB_VIcOLUbFLz0vm_IrHqiLuv9ks5ch9ajwA%3D%3D)

### Color scheme and fonts
![Scheme](https://raw.githubusercontent.com/tuftsdev/comp20-s2019-team18/master/mockups/scheme.png?token=AEJfk3sYF_OsxUHWeBBGWJd2NjAy7uQ8ks5ch9bEwA%3D%3D)

## Comments by Ming
* Hey this is fun! I say stay with Home State and Country
* " they will be asked (optionally) to enter their true home state, " => Why bother
