# Intro to BDD testing in React with bdd-lazy-var

This will be an example readme/blog-post stepping through how I arrived at my heavily BDD based testing approach for React and how you can use the fantastic `bdd-lazy-var` package to make testing a breeze!

We'll start at a bare [create-react-app](https://github.com/stalniy/bdd-lazy-var) repo and step through the process to first show the type of tests we end up writing with BDD and then how to apply the `bdd-lazy-var` package to make things easier.
I show code examples for each step of this as well as a link to a diff for the given changes from the last example. Feel free to dive into the repo at anytime as each step is tagged in the repo.

## Step 1: Our Component

We'll start by adding a new component to test. I have added the below component which wraps an html button.

```jsx
// ./src/components/Button.js
const Button = ({ label, onClick = () => {}, disabled = false }) => {
	return (
		<button onClick={onClick} disabled={disabled}>
			{label}
		</button>
	);
};

export default Button;
```

and the matching test file with the most basic test:

```jsx
// ./src/components/Button.test.js
import { render, screen } from "@testing-library/react";
import Button from "./Button";
 
 test("renders a button", () => {
	render(<Button />);
	const button = screen.getByRole('button');
	expect(button).toBeInTheDocument();
});
```

## Step 2: More Tests

Now I'll add some more tests to validate some of the functionality of our button.

```jsx
// ./src/components/Button.test.js
// ...
// New tests
test("renders a button with the passed label", () => {
	render(<Button label="My Button" />);
	const button = screen.getByRole("button");
	expect(button.textContent).toBe("My Button");
});

test("calls the onclick function when clicked", () => {
	const mockFn = jest.fn();
	render(<Button onClick={mockFn} />);
	const button = screen.getByRole("button");
	userEvent.click(button);
	expect(mockFn).toHaveBeenCalledTimes(1);
});

test("to not call the onclick when disabled", () => {
	const mockFn = jest.fn();
	render(<Button onClick={mockFn} disabled />);
	const button = screen.getByRole("button");
	userEvent.click(button);
	expect(mockFn).not.toHaveBeenCalled();
});
```