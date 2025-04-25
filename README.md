# Drama LLM - Project Ollama

## Overview

Drama LLM - Project Ollama is a TypeScript and React-based application designed to interact with machine learning models for generating text-based responses. It provides a user-friendly interface for selecting different models and customizing parameters such as temperature, top-p, and top-k to fine-tune the generation process. Additionally, it allows users to define roles and input content for the models to process.

## Features

- **Model Selection**: Users can choose from a variety of pre-defined models to generate text.
- **Customizable Parameters**: Fine-tune the model's behavior by adjusting settings like temperature, top-p, and top-k.
- **Role-Based Interaction**: Define the role (system, user, assistant) for different types of interactions.
- **Responsive Design**: A user-friendly interface that adapts to various screen sizes.

## Installation

To set up the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/rohit1901/drama-llm.git
   ```
2. Navigate to the project directory:
   ```bash
   cd drama-llm
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

To configure the application, create a `.env` file in the root directory of the project with the following variables:

- `DRAMA_LLM_SECURITY`: Set this to `disable` to bypass security checks during development. **Note:** This should only be used in a development environment. Default is `disable`.
- `DRAMA_LLM_ETH_LOGIN`: Set this to `disable` to enable Ethereum login and SIWE (Sign-In with Ethereum) checks. The application will crash if no wallet is found. Default is `disable`.

Example `.env` file:
```env
DRAMA_LLM_SECURITY=disable
DRAMA_LLM_ETH_LOGIN=disable
```

## Usage

After starting the application, navigate to `http://localhost:5173/` in your web browser. Select a model from the dropdown menu, adjust the desired parameters, and input your content. Press the "Generate" button to see the model's output.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs, features, or improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
