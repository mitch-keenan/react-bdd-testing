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

## Step 3: Clean-up

This is great, we're testing our button by modifying it's props and verifying that it works as we expect when we do.
However it feels a bit repetitive, we're writing the same set-up everytime. How could we refactor our tests to have less repetition? 

Let's start by extracting the most repetitive part, the rendering of the button. We'll leverage jest's [beforeEach]() function to do this

```jsx
let props = { label: "My Button", onClick: jest.fn() };
let button
beforeEach(() => {
	render(<Button {...props}/>);
	button = screen.getByRole("button");
});

// Passes
test("renders a button", () => {
	expect(button).toBeInTheDocument();
});

// Passes
test("renders a button with the passed label", () => {
	expect(button.textContent).toBe("My Button");
});

// ... Others fail
```

This has a few implications:

1. We need to wrap all of these tests in a [describe]() block so we don't leak this `beforeEach` call into the global scope:

	```jsx
	describe('Button', () => {
		let props = { label: "My Button", onClick: jest.fn() };
		let button
		beforeEach(() => {
			render(<Button {...props}/>);
			button = screen.getByRole("button");
		});

		// other tests
	});
	```

2. We can now reference the props object in our tests, instead of using variables or repeating the strings, for example

	```jsx
	test("renders a button with the passed label", () => {
		// Old: Fragile & repetitive
		expect(button.textContent).toBe('My Button');
		// New: Resilient & DRY
		expect(button.textContent).toBe(props.label);
	});
	```

3. We need a way to make the final test work, where the prop disabled must be changed to true. We can again apply describe blocks and the use of [beforeAll]() which will always happens prior to `beforeEach`

	```jsx
	describe('Button', () => {
		let props = { label: "My Button", onClick: jest.fn() };
		let button
		beforeEach(() => {
			render(<Button {...props}/>);
			button = screen.getByRole("button");
		});

		describe('when disabled', () => {
			beforeAll(() => {
				props.disabled = true
			})

			// Now passes
			test("to not call the onclick when disabled", () => {
				userEvent.click(button);
				expect(props.onClick).not.toHaveBeenCalled();
			});
		})
	});
	```

So that brings us to the final version of our test file for step 3

```jsx
describe("Button", () => {
	let props = { label: "My Button", onClick: jest.fn() };
	let button;
	beforeEach(() => {
		render(<Button {...props} />);
		button = screen.getByRole("button");
	});

	test("renders a button", () => {
		expect(button).toBeInTheDocument();
	});

	test("renders a button with the passed label", () => {
		expect(button.textContent).toBe(props.label);
	});

	test("calls the onclick function when clicked", () => {
		userEvent.click(button);
		expect(props.onClick).toHaveBeenCalledTimes(1);
	});

	describe("when disabled", () => {
		beforeAll(() => {
			props.disabled = true;
		});

		test("to not call the onclick when disabled", () => {
			userEvent.click(button);
			expect(props.onClick).not.toHaveBeenCalled();
		});
	});
});
```

## Step 4: A bug and a fix!

We've introduced a potential bug into our test file! If we swap the order of test 3 and 4, putting the `when disabled` describe block first, the 4th test will fail. This is because we modified our props object in the `beforeAll` and never undid that modification. So we need to add an `afterAll` to that describe block to reset it:

```jsx
describe("when disabled", () => {
	beforeAll(() => {
		props.disabled = true;
	});

	// We needed this!
	afterAll(() => {
		props.disabled = undefined;
	});

	test("to not call the onclick when disabled", () => {
		userEvent.click(button);
		expect(props.onClick).not.toHaveBeenCalled();
	});
});
```

Whew, dodged a bullet! Now our test file is in great shape! And you can see a pattern emerge for how we test changing a prop in our component in order to test the results:

```jsx
describe("when prop A is X", () => {
	beforeAll(() => {
		props.A = X;
	});

	afterAll(() => {
		props.A = 'whatever it was by default'
	});

	// test the functionality that differs when prop A is X
});
```

However I'm sure you could also see that this itself will get repetitive, how can we fix that? Let's try making a utility function:

```jsx
// In a newly created src/testUtils.js
const temporarilySet = (object, propertyName, temporaryValue) => {
	const originalValue = object[propertyName]
	beforeAll(() => {
		object[propertyName] = temporaryValue
	})

	afterAll(() => {
		object[propertyName] = originalValue
	})
}
```

which simplifies our test file to:

```jsx
import { setTemp } from "../testUtils";

describe("Button", () => {
	// ... Setup and other tests

	describe("when disabled", () => {
		temporarilySet(props, "disabled", true); // Nice and clean!!

		test("to not call the onclick when disabled", () => {
			userEvent.click(button);
			expect(props.onClick).not.toHaveBeenCalled();
		});
	});
});
```

Wow! that looks clean, now we could add lots more of describe blocks and not feel so bad!

## Step 5: Enter bdd-lazy-var

We've just re-implemented one of the core functions of bdd-lazy-var, the `def` function. Let's add bdd-lazy var and change our 









































