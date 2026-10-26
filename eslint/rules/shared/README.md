# Shared architecture configuration

The [layer-dependencies](../layer-dependencies/README.md),
[http-client-access](../http-client-access/README.md), and
[client-construction](../client-construction/README.md) rules share path matching,
TypeScript resolution, and boundary helpers. Enable and configure each rule independently.

## Rule Details

The rules report domain imports from data, presentation, the composition root, DHIS2 clients,
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

The skeleton layout and `getWebappCompositionRoot` factory are the defaults.
Pass `paths` to each enabled rule; pass `clientFactories` only to `client-construction`:

```js
"eyeseetea/client-construction": ["warn", {
    paths: {
        domain: ["src/domain/**"],
        data: ["src/data/**"],
        presentation: ["src/presentation/**"],
        repositories: ["src/data/**/*Repository.ts"],
        compositionRoots: [
            "src/presentation/AppCompositionRoot.ts",
            "src/presentation/TestCompositionRoot.ts"
        ],
        apiAdapters: ["src/data/common/utils/api-futures.ts"]
    },
    clientFactories: ["createApp", "createTest"]
}]
```

Paths are relative to ESLint's working directory. Use `/` separators. Patterns
support `*` (within one path segment), `**` (across segments), and `?` (one
non-separator character); `**/` also matches zero directories. Brace expansion,
negation, and extglobs are not supported. Omitted path groups retain their defaults;
provided arrays replace that group's defaults, and `[]` disables that group.

| Path group | Default |
| --- | --- |
| `domain` | `src/domain/**` |
| `data` | `src/data/**` |
| `presentation` | `src/webapp/**`, `src/scripts/**` |
| `repositories` | `src/data/repositories/**` |
| `compositionRoots` | `src/CompositionRoot.ts` |
| `apiAdapters` | `src/types/d2-api.ts`, `src/data/api-futures.ts` |

Roots and adapters take precedence over their containing domain/data/presentation
layer. This lets composition roots inside presentation import concrete repositories.
Repository patterns grant client-import permission, so keep them narrow. Adapters
may import clients, but are not permitted to construct them outside a configured root.
Imports of configured adapters are treated as infrastructure dependencies.

`clientFactories` replaces the allowed factory names. Function declarations and
arrow/function expressions bound to named variables are supported. Construction
requires both a configured composition-root file and an enclosing permitted factory.
An empty factory list permits no construction.

Diagnostics include the import specifier and resolved project-relative target.
Type-aware parser compiler options take precedence; without a parser program, the
rule reads the nearest `tsconfig.json` from ESLint's working directory. Missing local
modules cannot be classified by layer until TypeScript can resolve them.

## Limitations

Checks direct imports, re-exports, literal dynamic imports, and literal `require`
calls. TypeScript resolution honors the project configuration. Transitive dependencies,
nonliteral imports, namespace constructors, and indirect factories require review.

## Exceptions

Adapt paths for other layouts and use narrow, justified rule suppressions.
External API repositories may need an HTTP exception; see
[external API guidance](../http-client-access/README.md#when-not-to-use-it).
Disabling `http-client-access` leaves layer dependency and client-construction checks active.
