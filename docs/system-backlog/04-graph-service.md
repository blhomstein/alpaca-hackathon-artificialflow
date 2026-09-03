# Component Backlog: Graph Service

## Purpose

Map an accepted event to candidate suppliers through a small immutable, human-verified, directed capital-flow graph.

## Contract

- **Input:** accepted event and frozen graph version.
- **Output:** zero or more candidate targets, each with an ordered one- or two-edge path and match explanation.
- **State:** versioned 12-15 edge seed graph with sources and verification dates.

## Backlog

- [ ] `GS-01 P0` Define graph storage matching `CapitalFlowEdge` and unique edge IDs.
- [ ] `GS-02 P0` Curate 12-15 real source-backed edges; replace any frontend fixture URL that is not verified evidence.
- [ ] `GS-03 P0` Add a human-only seed/import path; runtime identities receive read-only access.
- [ ] `GS-04 P0` Traverse edges in their declared direction and cap traversal at two hops.
- [ ] `GS-05 P0` Match event spending categories against edge categories using a frozen category vocabulary.
- [ ] `GS-06 P0` Never return the actor, benchmarks, or symbols outside the traded universe as targets.
- [ ] `GS-07 P0` Deduplicate multiple paths to one target while retaining all qualifying evidence paths for audit.
- [ ] `GS-08 P1` Version and checksum the entire graph; stamp the version into each dossier.
- [ ] `GS-09 P1` Expose graph/path queries needed by the existing graph and dossier screens.

## Failure behavior

No verified path means no candidate. Missing sources, expired verification policy, graph corruption, or traversal ambiguity rejects mapping rather than inventing an edge.

## Verification / done

- Reverse traversal and third-hop tests return no candidate.
- Every returned edge has source URL and `verifiedAt`.
- Runtime code cannot insert or update edges.
- A dossier preserves the exact graph version and ordered path used.
