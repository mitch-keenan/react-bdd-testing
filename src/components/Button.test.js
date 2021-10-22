import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";
import { temporarilySet } from "../testUtils";

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
		temporarilySet(props, "disabled", true);

		test("to not call the onclick when disabled", () => {
			userEvent.click(button);
			expect(props.onClick).not.toHaveBeenCalled();
		});
	});
});
