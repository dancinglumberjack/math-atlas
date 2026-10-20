# Help improve Math Atlas

Math Atlas improves when students can tell us where they get stuck and educators can help make an explanation more accurate. You do not need to write code to contribute.

## Share useful feedback

Choose a template in [New issue](https://github.com/dancinglumberjack/math-atlas/issues/new/choose):

- **Something is broken:** a control, page, calculator expression, or display does not behave as expected.
- **Math or teaching feedback:** a statement, model, answer, hint, or sequence may be confusing or incorrect.
- **An idea to make it better:** a lesson, learning aid, or accessibility improvement would help.

For a reproducible report, include the lesson title or link, the exact control values, your steps, the expected result, and what happened. For calculator feedback, include the expression and DEG/RAD setting. Browser, device, and reading settings help explain display problems.

**Public issues are public.** Use a made-up example. Do not post student names, ages tied to identities, school/class details, diagnoses, grades, account information, or other identifying information. Remove these from screenshots too.

## Make a change

1. Fork the repository and create a branch for one clear improvement.
2. Make app changes in `src/`. Keep the existing framework-free, browser-local approach unless a broader change has been discussed.
3. Run `npm run build` and `npm test`. No package installation is needed for these default commands; Node.js 22 or later is required.
4. Run `npm run serve` and try the affected flow in a browser, including a narrow screen and keyboard navigation.
5. Commit the source, regenerated `index.html`, relevant checks, and documentation. Open a pull request describing the problem, the resulting behavior, and how you checked it.

Keep generated output reproducible. Do not make your only change in `index.html`, because rebuilding replaces it. Preserve third-party license notices and update `THIRD_PARTY_NOTICES.md` if you add or alter an included library.

## Teaching and mathematical quality

- State the learning goal and prerequisite knowledge. Use familiar language before formal notation.
- Make the picture correspond to the calculation. Label units, axes, scales, illustrative dimensions, and approximations.
- Exercise the full range of controls. Check zero, negative values, small values, and relevant domain restrictions.
- Explain the reason for an operation. A hint should help a student think, rather than simply repeat the answer.
- Keep the question and accepted answer aligned. State rounding expectations and justify any tolerance.
- Distinguish one practice check from mastery. Do not add unverified claims about grade placement, curriculum completeness, or standards alignment.

For a math correction, include an independently worked example or reference that makes the correction easy to review. A longer explanation is useful when conventions vary, such as quartile calculations.

## Reading, accessibility, and browser behavior

- Keep labels, focus indicators, keyboard controls, and useful diagram descriptions.
- Review changed screens with the reading presets, larger text, high contrast, and reduced motion. Do not make color the only way to distinguish quantities.
- Keep worked text available alongside diagrams. Preserve a useful flat view when depth would obscure a mathematical relationship.
- Do not claim that a preset treats dyslexia or ADHD. Settings support individual preferences; they are not clinical interventions.
- Keep optional speech optional. Browser speech availability and pronunciation vary.
- Prefer changes that remain useful when browser storage or speech is unavailable.

## Privacy and security

Use sample data. Do not add collection of student information, analytics, advertising, remote scripts, API credentials, or account requirements as an incidental part of a lesson change. Propose any change to the browser-local design for explicit review first.

Keep student-entered text as text. The calculator deliberately parses a limited mathematical grammar; do not replace that with JavaScript execution. If you find a security problem that would expose personal information, avoid posting sensitive details publicly and use GitHub's private security reporting when available.

## Review checklist

- [ ] The explanation and diagram agree for representative values and control limits.
- [ ] The change is usable with keyboard controls and a narrow screen.
- [ ] Reading settings and reduced motion still work where affected.
- [ ] `npm run build` and `npm test` pass.
- [ ] Generated output and documentation match the source.
- [ ] No identifying student information or credentials are included.
- [ ] License notices are retained.

By contributing, you agree that your contribution can be distributed under the repository's MIT License.
