import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";

test("renders a button", () => {
	render(<Button />);
	const button = screen.getByRole("button");
	expect(button).toBeInTheDocument();
});

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
