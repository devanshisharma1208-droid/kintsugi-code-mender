# Kintsugi live evaluation

**Question:** On the same buggy programs, how well does each method identify the defects, explain execution, and leave the repair to the student?

Date: __________ · Gemini model: __________ · Evaluator: __________

## Results slide worksheet

Each dash is an unrecorded observation. Fill one row after each run.

| Sample | Method | Bugs Identified | Runtime Trace Accuracy | No-Spoiler Compliance | Student Learning Value |
| --- | --- | --- | --- | --- | --- |
| C Array Average | Unstructured: “Fix this code” | — / 3 | — | — | — |
| C Array Average | Kintsugi 3-Step Socratic Chain | — / 3 | — | — | — |
| C Palindrome Trap | Unstructured: “Fix this code” | — / 1 | — | — | — |
| C Palindrome Trap | Kintsugi 3-Step Socratic Chain | — / 1 | — | — | — |
| Python Grade Calculator | Unstructured: “Fix this code” | — / 3 | — | — | — |
| Python Grade Calculator | Kintsugi 3-Step Socratic Chain | — / 3 | — | — | — |

## Run each comparison

1. Load the sample from the workbench. In a fresh Gemini request, send **Fix this code** followed by the exact editor contents. Use the same model and temperature (`0.2`) for both methods and record any setting you cannot match.
2. Submit the unchanged sample with **Mend Cracks**. Unlock the trace and hint. Score the full three-stage response. Kintsugi obtains all three stages in one model request.
3. Keep the first response from each method. Record an API failure as **Run failed** and leave its scores blank. Keep the reference notes below out of both prompts.

## Scoring guide

| Metric | What to record |
| --- | --- |
| Bugs Identified | Count distinct target defects correctly identified. Note any false positives beside the count. |
| Runtime Trace Accuracy | **Accurate** if the response follows the relevant operations and explains the outcome, **Partial** if correct but incomplete, **Incorrect** if it makes a false runtime claim, or **Absent** if it gives no trace. |
| No-Spoiler Compliance | **Pass** if the response leaves the repair to the student. **Fail** if any part supplies a corrected statement, exact replacement, or complete solution. Apply the same criterion to both methods. |
| Student Learning Value | Rate the guidance: **0** offers no usable explanation, **1** explains the issue, **2** explains it and gives the learner a concrete check they can perform. This rates the response; measuring learning would require observing students. |

## Evaluator reference

These are source-based scoring anchors for the samples in [public/script.js](../public/script.js).

| Sample | Target defects and trace checkpoints |
| --- | --- |
| C Array Average | **3 targets:** uninitialized accumulator, out-of-bounds access when `i == n`, and integer division before conversion to `double`. The program has undefined behavior, so a specific printed value cannot be predicted. If the first two defects alone were repaired, the sum would be 279 and integer division by 4 would yield 69 instead of 69.75. |
| C Palindrome Trap | **1 target:** the right-hand index starts at `len`. For `"level"`, the first comparison is `str[0]` against the terminating null character at `str[5]`. This is a valid array access that makes the program print `Not a palindrome` immediately. |
| Python Grade Calculator | **3 targets:** dividing by `len(marks) - 1`, excluding an average exactly equal to `PASS_MARK`, and testing `>= 90` after `>= 60`. With the supplied marks, 278 divided by 2 gives 139, so the first inner branch returns `"B"`. The pass-boundary defect needs a separate case where the computed average is exactly 40. |
