import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { CVBuilder } from "./CVBuilder";

afterEach(cleanup);

function sectionById(id: string) {
  const section = document.getElementById(id);
  if (!section) throw new Error(`Missing section: ${id}`);
  return within(section);
}

describe("CVBuilder", () => {
  it("renders every required résumé section and accessible contact fields", () => {
    render(<CVBuilder />);

    const editor = within(screen.getByLabelText("CV editor"));
    expect(editor.getByRole("heading", { name: "General information" })).toBeVisible();
    expect(editor.getByRole("heading", { name: "Education" })).toBeVisible();
    expect(editor.getByRole("heading", { name: "Practical experience" })).toBeVisible();
    expect(screen.getByLabelText(/^Full name/)).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/^Phone/)).toHaveAttribute("type", "tel");
  });

  it("keeps draft changes out of the saved preview until submit, then restores them for editing", async () => {
    const user = userEvent.setup();
    render(<CVBuilder />);

    const preview = within(screen.getByLabelText("Résumé preview"));
    const name = screen.getByLabelText(/^Full name/);
    await user.clear(name);
    await user.type(name, "Alex Rivera");

    expect(preview.getByRole("heading", { name: "Maya Chen" })).toBeVisible();
    expect(preview.queryByRole("heading", { name: "Alex Rivera" })).not.toBeInTheDocument();

    await user.click(sectionById("profile").getByRole("button", { name: /save & continue/i }));
    expect(preview.getByRole("heading", { name: "Alex Rivera" })).toBeVisible();

    await user.click(sectionById("profile").getByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText(/^Full name/)).toHaveValue("Alex Rivera");
  });

  it("associates invalid education dates with the end-date field", async () => {
    const user = userEvent.setup();
    render(<CVBuilder />);

    await user.click(sectionById("education").getByRole("button", { name: "Edit" }));
    const endDate = sectionById("education").getByLabelText(/^End date/);
    await user.clear(endDate);
    await user.type(endDate, "2011-01");
    await user.click(
      sectionById("education").getByRole("button", { name: /save education/i }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "An education end date can’t be earlier than its start date.",
    );
    expect(endDate).toHaveAttribute("aria-invalid", "true");
    await waitFor(() => expect(endDate).toHaveFocus());
  });

  it("lets users undo an entry removed from a draft", async () => {
    const user = userEvent.setup();
    render(<CVBuilder />);

    await user.click(sectionById("experience").getByRole("button", { name: "Edit" }));
    await user.click(
      sectionById("experience").getByRole("button", { name: "Remove role 2" }),
    );
    expect(sectionById("experience").queryByDisplayValue("Fieldnote")).not.toBeInTheDocument();

    await user.click(sectionById("experience").getByRole("button", { name: "Undo" }));
    expect(sectionById("experience").getByDisplayValue("Fieldnote")).toBeVisible();
  });
});
