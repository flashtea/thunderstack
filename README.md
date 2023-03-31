# Thunderstack

A Stackoverflow clone built using Nostr, a decentralized event system.

This project was created to demonstrate how Nostr can be used to build a decentralized, stackoverflow like, application.
It allows users to create questions, tag them, answer questions, comment and reward answers using lightning payments.

## Features

- Creating and viewing questions
- Answering qestions
- Replying to other users answers (comments)
- "Zap" good answers using lightning to send rewards 
- Decentralized architecture using nostr
- Open-source code

## Technologies

- Angular
- TypeScript
- Nostr (using nostr-tools)
- HTML
- CSS

## Getting Started

To get started, clone this repository and run `npm install` to install the necessary dependencies.
Then, run `npm start` to start the development server. You can access the application at `http://localhost:4200`.

## Usage of NIPS

This application uses Nostr's event types to represent data and interactions between users. The event types used by the application are documented in Nostr Improvement Proposal 28 (NIP-28), which defines a standard set of event types for decentralized social networking.

The application uses the following event types:

- Kind 40: Question Creation. This event is used when a user creates a new question. The event's content includes the question's title, body, and any associated tags.
- Kind 42: Answer Creation. This event is used when a user creates a new answer to an existing question. The event's content includes the answer's body and metadata, such as the answer's author and the ID of the question being answered. Answers are associated with a particular question using the event's tags field.
- Kind 42: Reactions. This event is used when a user up or downvotes a answer.

The use of these event types enables decentralized storage of StackOverflow posts, questions, and answers. Users can create and interact with content, and search for content based on associated tags. This approach allows for greater control and ownership of the data by the users themselves, rather than relying on centralized platforms.

## License

This project is licensed under the MIT License.
