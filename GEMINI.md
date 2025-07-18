# GEMINI Coding Assistant Guidelines

## 1\. Building and Running

Before submitting any changes, it is crucial to validate them by running the full preflight check. This command will build the repository, run all tests, and check for type errors.

To run the full suite of checks, execute the following command:

```bash
npm run preflight
```

This single command ensures that your changes meet all the quality gates of the project. While you can run the individual steps separately, it is highly recommended to use `npm run preflight` to ensure a comprehensive validation, and no tasks can be considered complete until npm run preflight runs without errors.

-----

## 2\. Writing Tests

This project uses **Vitest** as its primary testing framework, as outlined in the project's technical specifications. When writing tests, aim to follow existing patterns. Key conventions include:

### 2.1. Test Structure and Framework

  * **Framework**: All tests are written using Vitest (`describe`, `it`, `expect`, `vi`).
  * **File Location**: Test files (`*.test.ts` for logic, `*.test.tsx` for React components) are co-located with the source files they test within the `client/` and `server/` directories.
  * **Configuration**: The test environment is defined in `vite.config.ts`.
  * **Setup/Teardown**: Use `beforeEach` and `afterEach`. Commonly, `vi.resetAllMocks()` is called in `beforeEach` and `vi.restoreAllMocks()` in `afterEach`.

### 2.2. Mocking (`vi` from Vitest)

  * **ES Modules**: Mock with `vi.mock('module-name', async (importOriginal) => { ... })`. Use `importOriginal` for selective mocking.
      * *Example*: `vi.mock('drizzle-orm', async (importOriginal) => { const actual = await importOriginal(); return { ...actual, eq: vi.fn() }; });`
  * **Mocking Order**: For critical dependencies (e.g., `postgres`, `@clerk/clerk-sdk-node`) that affect module-level constants, place `vi.mock` at the *very top* of the test file, before other imports.
  * **Hoisting**: Use `const myMock = vi.hoisted(() => vi.fn());` if a mock function needs to be defined before its use in a `vi.mock` factory.
  * **Mock Functions**: Create with `vi.fn()`. Define behavior with `mockImplementation()`, `mockResolvedValue()`, or `mockRejectedValue()`.
  * **Spying**: Use `vi.spyOn(object, 'methodName')`. Restore spies with `mockRestore()` in `afterEach`.

### 2.3. Commonly Mocked Modules

  * **Node.js built-ins**: `fs`, `path`.
  * **External SDKs**: `@clerk/clerk-react`, `@clerk/clerk-sdk-node`, `stripe`, `drizzle-orm`, `postgres`.
  * **Internal Project Modules**: Dependencies from the `shared/` directory or other internal modules are often mocked.

### 2.4. React Component Testing (React Testing Library)

  * Use `render` and `screen` from `@testing-library/react`.
  * Assert component output using `screen.getByRole`, `screen.getByText`, etc.
  * Wrap components in necessary providers like `QueryClientProvider`, `ClerkProvider`, and `ThemeProvider`.
  * Mock custom React hooks (e.g., `useAuth`) and child components using `vi.mock()`.

### 2.5. Asynchronous Testing

  * Use `async/await`.
  * For timers, use `vi.useFakeTimers()`, `vi.advanceTimersByTimeAsync()`, `vi.runAllTimersAsync()`.
  * Test promise rejections with `await expect(promise).rejects.toThrow(...)`.

### 2.6. General Guidance

  * When adding tests, first examine existing tests (or the PRD's testing strategy) to understand and conform to established conventions.
  * Pay close attention to mocks in existing test files; they reveal critical dependencies and how they are managed in a test environment.

-----

## 3\. Git Repository

The main branch for this project is called "**main**".

-----

## 4\. JavaScript/TypeScript Standards

When contributing to this React, Node, and TypeScript codebase, please prioritize the use of plain JavaScript objects with accompanying TypeScript interface or type declarations over JavaScript class syntax. This approach offers significant advantages, especially concerning interoperability with React and overall code maintainability.

### 4.1. Prefer Plain Objects over Classes

JavaScript classes, by their nature, are designed to encapsulate internal state and behavior. While this can be useful in some object-oriented paradigms, it often introduces unnecessary complexity and friction when working with React's component-based architecture. Here's why plain objects are preferred:

  * **Seamless React Integration**: React components thrive on explicit props and state management. Classes' tendency to store internal state directly within instances can make prop and state propagation harder to reason about and maintain. Plain objects, on the other hand, are inherently immutable (when used thoughtfully) and can be easily passed as props, simplifying data flow and reducing unexpected side effects.

  * **Reduced Boilerplate and Increased Conciseness**: Classes often promote the use of constructors, `this` binding, getters, setters, and other boilerplate that can unnecessarily bloat code. TypeScript interface and type declarations provide powerful static type checking without the runtime overhead or verbosity of class definitions. This allows for more succinct and readable code, aligning with JavaScript's strengths in functional programming.

  * **Enhanced Readability and Predictability**: Plain objects, especially when their structure is clearly defined by TypeScript interfaces from `shared/schema.ts`, are often easier to read and understand. Their properties are directly accessible, and there's no hidden internal state or complex inheritance chains to navigate. This predictability leads to fewer bugs and a more maintainable codebase.

  * **Simplified Immutability**: While not strictly enforced, plain objects encourage an immutable approach to data. When you need to modify an object, you typically create a new one with the desired changes, rather than mutating the original. This pattern aligns perfectly with React's reconciliation process and helps prevent subtle bugs related to shared mutable state.

  * **Better Serialization and Deserialization**: Plain JavaScript objects are naturally easy to serialize to JSON and deserialize back, which is a common requirement in web development (e.g., for API communication or local storage). Classes, with their methods and prototypes, can complicate this process.

### 4.2. Embrace ES Module Syntax for Encapsulation

Rather than relying on Java-esque private or public class members, which can be verbose and sometimes limit flexibility, we strongly prefer leveraging ES module syntax (`import`/`export`) for encapsulating private and public APIs.

  * **Clearer Public API Definition**: With ES modules, anything that is exported is part of the public API of that module, while anything not exported is inherently private to that module. This provides a very clear and explicit way to define what parts of your code are meant to be consumed by other modules.

  * **Enhanced Testability (Without Exposing Internals)**: By default, unexported functions or variables are not accessible from outside the module. This encourages you to test the public API of your modules, rather than their internal implementation details. If you find yourself needing to spy on or stub an unexported function for testing purposes, it's often a "code smell" indicating that the function might be a good candidate for extraction into its own separate, testable module with a well-defined public API. This promotes a more robust and maintainable testing strategy.

  * **Reduced Coupling**: Explicitly defined module boundaries through import/export help reduce coupling between different parts of your codebase. This makes it easier to refactor, debug, and understand individual components in isolation.

### 4.3. Avoid `any` Types and Type Assertions; Prefer `unknown`

TypeScript's power lies in its ability to provide static type checking, catching potential errors before your code runs. To fully leverage this, it's crucial to avoid the `any` type and be judicious with type assertions.

  * **The Dangers of `any`**: Using `any` effectively opts out of TypeScript's type checking for that particular variable or expression. While it might seem convenient in the short term, it introduces significant risks.

  * **Preferring `unknown` over `any`**: When you absolutely cannot determine the type of a value at compile time, and you're tempted to reach for `any`, consider using `unknown` instead. `unknown` is a type-safe counterpart to `any`.

  * **Type Assertions (`as Type`) - Use with Caution**: Type assertions tell the TypeScript compiler to trust the developer's type definition. While there are legitimate use cases, they should be used sparingly and with extreme caution.

### 4.4. Embrace JavaScript's Array Operators

To further enhance code cleanliness and promote safe functional programming practices, leverage JavaScript's rich set of array operators as much as possible. Methods like `.map()`, `.filter()`, `.reduce()`, `.slice()`, `.sort()`, and others are incredibly powerful for transforming and manipulating data collections in an immutable and declarative way.

-----

## 5\. React Best Practices

### 5.1. Role

You are a React assistant that helps users write more efficient and optimizable React code. You specialize in identifying patterns that enable React Compiler to automatically apply optimizations, reducing unnecessary re-renders and improving application performance.

### 5.2. Core Guidelines

  * **Use functional components with Hooks**: Do not generate class components.
  * **Keep components pure**: Render logic should be a pure function of props and state.
  * **Respect one-way data flow**: Pass data down through props.
  * **Never mutate state directly**: Always use the state setter for updates.
  * **Use `useEffect` accurately and sparingly**: It is primarily for synchronization with external systems. Avoid placing logic in `useEffect` that should be in an event handler.
  * **Follow the Rules of Hooks**: Call Hooks unconditionally at the top level.
  * **Use refs only when necessary**: Avoid `useRef` for reactive application state.
  * **Prefer composition and small components**: Break down UI into small, reusable components.
  * **Optimize for concurrency**: Write code that remains correct even if the component function runs more than once.
  * **Optimize to reduce network waterfalls**: Use parallel data fetching wherever possible.
  * **Rely on React Compiler**: Avoid premature optimization with manual memoization (`useMemo`, `useCallback`).
  * **Design for a good user experience**: Provide clear, minimal, and non-blocking UI states.


### 5.3. Process

1.  **Analyze the user's code for optimization opportunities.**
2.  **Provide actionable guidance with clear reasoning and examples.**
3.  **Only suggest changes that meaningfully improve optimization potential.**

-----

## 6\. General Coding Style

### 6.1. Comments Policy

Only write high-value comments if absolutely necessary. Avoid writing comments that explain *what* the code is doing; the code should be self-explanatory. Focus on commenting on *why* a particular implementation was chosen if it's non-obvious.

### 6.2. Naming Conventions

Use hyphens instead of underscores in command-line flag names (e.g., `my-flag` instead of `my_flag`).

DO NOT MODIFY ESLINT.CONFIG.JS

Never use explicit or implicit any.