# Kintsugi — The Gentle Code & Bug Mender

*Mending cracked logic with golden patience.*

Bring a C or Python snippet to Kintsu, a tiny teacup spirit who helps B.Tech students understand what their code is doing. **Mend Cracks** points out likely bugs, walks through the execution, and offers a hint so you can write the fix yourself. **Golden Polish** returns a readability refactor with notes on what changed.

Choose a cracked sample or paste your own code into the line-numbered editor. Open **Peek Under the Hood** to see the prompt architecture, current request, and latest API response.

## Syllabus and prompt engineering

| Sample | Programming concepts |
| --- | --- |
| C Array Average Trap | Variable initialization, array bounds, and integer division |
| C Palindrome Off-by-One | Zero-based indexing and matching characters from opposite ends of a string |
| Python Grade Threshold Bug | List length, division, inclusive thresholds, and unreachable branches |

- **Role prompting.** `server.js` gives Gemini a named teaching role, a task, the student's code and language as context, constraints, and an output format.
- **Three-step sequential chaining.** The browser reveals cracks, then a trace, then a Socratic hint. Each submission makes one Gemini request. The sequencing happens in the UI.
- **Anti-hallucination variable tracing.** The prompt asks Gemini to check initialization, loop conditions, bounds, and branches before reporting bugs. Kintsugi does not execute submissions. Review model output against the source, especially around boundary cases.
- **Temperature `0.2`.** The server sets a low sampling temperature to reduce variation between responses. Results can still vary.
- **Structured JSON output.** Mend and Polish have separate response schemas. The server requests JSON, removes an outer Markdown fence if present, and validates the parsed fields before returning them to the browser.

## Repository structure

```text
.
├── .gitignore          # Keeps local .env and node_modules out of Git
├── LICENSE             # MIT license
├── README.md           # Project guide
├── package.json        # Dependencies and npm start command
├── package-lock.json   # Exact dependency versions resolved by npm
├── docs/
│   └── evaluation_results.md  # Live comparison worksheet
├── server.js           # CommonJS Express app and POST /api/mend
├── vercel.json         # Config schema; native Express routing applies
└── public/
    ├── index.html      # Workbench, Kintsu mascot, and inspector
    ├── style.css       # Responsive studio styling
    └── script.js       # Samples, line numbers, API calls, and result rendering
```

The browser uses vanilla HTML, CSS, and JavaScript. The server dependencies are `express`, `@google/genai`, `dotenv`, and `cors`.

## Run locally

1. Install Node.js 22 or later. From the repository root, install the dependencies.

   ```sh
   npm install
   ```

2. Create a file named `.env` next to `server.js`. Replace the placeholder with your Gemini API key. `GEMINI_MODEL` and `PORT` are optional. The values shown are the defaults.

   ```dotenv
   GEMINI_API_KEY=replace_with_your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   PORT=3000
   ```

   Keep `.env` local. Never paste the key into the editor or put it in `public/`.

   If your Gemini project cannot access `gemini-2.5-flash`, set `GEMINI_MODEL` to a model available to that project that supports structured output. [Gemini model documentation](https://ai.google.dev/gemini-api/docs/models)

3. Start the app.

   ```sh
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000). If you changed `PORT`, use that port instead. Load a sample and select **Mend Cracks**. The server sends the submitted snippet to Gemini for analysis.

## Deploy to Vercel

1. Import the GitHub repository into Vercel. Use the repository root as the project root, with native Express detection and the default build settings.
2. In the Vercel project settings, add `GEMINI_API_KEY` to the environments you plan to deploy, such as Preview and Production. Set `GEMINI_MODEL` only if you want to override the default. `PORT` is only needed to override the local listener port.
3. Deploy, then open the deployment URL. Confirm that the workbench loads and run one sample through **Mend Cracks** to check the API and environment setup.

`vercel.json` declares the configuration schema and uses Vercel’s default Express routing. Vercel detects the app exported by `server.js` and serves the static files under `public/`. [Express on Vercel](https://vercel.com/docs/frameworks/backend/express)

## Presentation evaluation

Use the [live evaluation log](docs/evaluation_results.md) to compare “Fix this code” with Kintsugi on the same three samples.

## README Fact-Check Audit Table

| Claim | Actual Repository | Status |
| --- | --- | --- |
| The server uses the four documented dependencies. | `package.json` declares `express`, `@google/genai`, `dotenv`, and `cors`, and `server.js` imports them. | Confirmed in source |
| The workbench loads three traps and reveals Mend results in order. | `public/script.js` defines the three samples and enables the trace and hint buttons in sequence. | Confirmed in source |
| Gemini uses role prompting, tracing instructions, temperature `0.2`, and structured JSON. | `server.js` defines the Kintsu prompt, passes the sampling temperature and mode schema, and checks the parsed response. | Confirmed in source |
| `npm start` starts the local server and reads `.env`. | `package.json` runs `node server.js`. The server loads `.env` and defaults to port `3000`. `.gitignore` excludes `.env`. | Confirmed in source |
| The repository is set up for native Vercel Express detection. | `vercel.json` uses native routing, root `server.js` exports the Express app, and the frontend is in `public/`. | Source confirmed; deployment unverified |

## License

Kintsugi is available under the [MIT License](LICENSE).
