# System Architecture

## Design Patterns
- **Clean Architecture**: Applied within features to decouple business logic from infrastructure.
- **Feature-Based Modularity**: Organizes code by business domain (e.g., `chatsession`, `bots`).
- **Provider Pattern**: Centralizes global state and configurations.
- **Atomic Components**: Utilizing building blocks in `src/components/ui`.

## Layers (Per Feature)
1. **Domain**: Interfaces and pure entities.
2. **Application**: Use cases and service orchestration.
3. **Infra**: API implementations and data access.
4. **Presentation**: React components and hooks.

## Key Interactions
- **Routing**: Handled by TanStack Router in `src/app/router.tsx`.
- **Data Fetching**: Features use Axios implementation in `infra` layer, consumed via React Query hooks in `presentation`.
- **Global State**: Managed by Zustand stores where server state (Query) isn't sufficient.
