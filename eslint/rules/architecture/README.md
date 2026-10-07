# eyeseetea/architecture

Enforce Clean Architecture dependency directions and DHIS2 client boundaries.
Enabled as a warning for `src/**/*.{ts,tsx}` by the EyeSeeTea config.

## Rule Details

Reports domain imports from data, presentation, the composition root, DHIS2 clients,
or platform infrastructure, and domain access to platform globals. Data must not
import presentation or the composition root. Presentation must not import concrete
data implementations. Repositories and presentation must not access HTTP directly.

DHIS2 client imports belong in repositories, the composition root, or the named
infrastructure adapters (`src/types/d2-api.ts` and `src/data/api-futures.ts`).
Instantiate the imported `D2Api` only inside `getWebappCompositionRoot()` in
`src/CompositionRoot.ts`.

Examples of **incorrect** code:

```ts
// src/domain/usecases/GetUsersUseCase.ts
import { UserD2Repository } from "$/data/repositories/UserD2Repository";

// src/data/repositories/UserD2Repository.ts
fetch("/api/users");
```

Examples of **correct** code:

```ts
// src/domain/usecases/GetUsersUseCase.ts
import type { User } from "$/domain/entities/User";

// src/data/repositories/UserD2Repository.ts
import { D2Api } from "$/types/d2-api";
```

## Options

This rule has no options.

## Limitations

Checks direct imports, re-exports, literal dynamic imports, and literal `require`
calls. TypeScript resolution honors the project configuration. Transitive dependencies,
nonliteral imports, namespace constructors, and indirect factories require review.

## When Not To Use It

Disable this rule in projects with a different architecture or directory structure.
For a justified exception, use a narrow suppression with an explanation.
