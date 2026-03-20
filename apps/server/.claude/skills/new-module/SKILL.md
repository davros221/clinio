---
name: new-module
description: Scaffold a new NestJS feature module with entity, service, controller, DTOs, mapper, tests, and registration
argument-hint: <module-name>
---

Create a new NestJS feature module named `$ARGUMENTS` following the existing project conventions. Use the reference files in this skill directory as templates.

## Steps

1. Create the module directory: `src/modules/$ARGUMENTS/`
2. Create all files listed below, adapting names and fields based on the module purpose
3. Register the module in `src/app/app.module.ts` (add to imports)
4. Add barrel export to `src/modules/index.ts`
5. Run `pnpm nx test server` to verify tests pass

## Files to create

All files go under `src/modules/$ARGUMENTS/`:

| File                                      | Purpose                                                         |
| ----------------------------------------- | --------------------------------------------------------------- |
| `$ARGUMENTS.entity.ts`                    | TypeORM entity — see `reference-entity.md`                      |
| `$ARGUMENTS.service.ts`                   | Injectable service with repository — see `reference-service.md` |
| `$ARGUMENTS.controller.ts`                | REST controller with Swagger — see `reference-controller.md`    |
| `$ARGUMENTS.module.ts`                    | NestJS module registration — see `reference-module.md`          |
| `dto/create-$ARGUMENTS.dto.ts`            | Request DTO extending createZodDto — see `reference-dto.md`     |
| `dto/$ARGUMENTS.dto.ts`                   | Response DTO with @ApiProperty — see `reference-dto.md`         |
| `mapper/${PascalName}Mapper.ts`           | Entity-to-DTO mapper — see `reference-mapper.md`                |
| `__tests__/$ARGUMENTS.service.spec.ts`    | Service unit tests — see `reference-tests.md`                   |
| `__tests__/$ARGUMENTS.controller.spec.ts` | Controller unit tests — see `reference-tests.md`                |
| `__tests__/${PascalName}Mapper.spec.ts`   | Mapper unit tests — see `reference-tests.md`                    |

Where `${PascalName}` is the module name in PascalCase (e.g. `office` → `Office`).

## Key conventions

- Entity class: `<Name>Entity`, table name: lowercase plural (`@Entity("offices")`)
- Primary key: `@PrimaryGeneratedColumn("uuid")`
- Errors: use helpers from `src/common/error-messages.ts` — add new ones if needed
- ErrorCode: if a new code is needed, add it to the enum in `@clinio/shared`
- Zod schema: define in `@clinio/shared` if it will be reused by frontend, otherwise local
- Controller resource: lowercase plural (`@Controller("offices")`)
- Every endpoint needs `@ApiOperation({ operationId: "..." })` for codegen
- Never return entities directly — always map through Mapper
- Response DTOs must NOT contain sensitive fields

## Ask before generating

Before creating files, ask the user:

1. What fields/columns should the entity have?
2. Should any endpoints be public (`@Public()`)?
3. Does it need a Zod schema in `@clinio/shared` (for frontend reuse) or local-only?
4. Any relations to other entities?
