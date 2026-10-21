# Self-reference

This repository is the `dhis2-react` reference ([`../../reference/README.md`](../../reference/README.md)): projects of that profile clone it into their `.est_ai/reference/`. Here, nothing is cloned there.

- **The reference is this repository's own `src/`.** When implementing, replicate the existing artifact of the same kind (use case, repository, component, test) in `src/`; when reviewing, compare against it.
- **An empty `.est_ai/reference/` does not mean "no references available".** This is an exception to [`../../reference/README.md`](../../reference/README.md) → *How the agent uses it*: the agent and the reviews do not report a missing reference.
- **Changes here change the reference for every `dhis2-react` project.** New patterns must be canonical: they follow the rules in full, without project exceptions.
