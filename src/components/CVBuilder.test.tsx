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
  it("renders every required CV section and accessible contact fields", () => {
    render(<CVBuilder />);

    const editor = within(screen.getByLabelText("CV editor"));
    expect(
      editor.getByRole("heading", { name: "General information" }),
    ).toBeVisible();
    expect(editor.getByRole("heading", { name: "Education" })).toBeVisible();
    expect(
      editor.getByRole("heading", { name: "Practical experience" }),
    ).toBeVisible();
    expect(screen.getByLabelText(/^Full name/)).toHaveAttribute(
      "autocomplete",
      "name",
    );
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/^Phone/)).toHaveAttribute("type", "tel");
    expect(screen.getByRole("navigation", { name: "CV sections" })).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "CV completion" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("keeps a profile draft out of the preview until submit, then restores it for editing", async () => {
    const user = userEvent.setup();
    render(<CVBuilder />);

    const preview = within(screen.getByLabelText("Résumé preview"));
    await user.type(screen.getByLabelText(/^Full name/), "Alex Rivera");
    await user.type(screen.getByLabelText(/^Email/), "alex@example.com");
    await user.type(screen.getByLabelText(/^Phone/), "+57 300 123 4567");

    expect(preview.getByRole("heading", { name: "Your name" })).toBeVisible();
    expect(
      preview.queryByRole("heading", { name: "Alex Rivera" }),
    ).not.toBeInTheDocument();

    await user.click(
      sectionById("profile").getByRole("button", {
        name: /save general information/i,
      }),
    );
    expect(preview.getByRole("heading", { name: "Alex Rivera" })).toBeVisible();
    expect(preview.getByRole("link", { name: "alex@example.com" })).toHaveAttribute(
      "href",
      "mailto:alex@example.com",
    );
    expect(screen.getByRole("progressbar", { name: "CV completion" })).toHaveAttribute(
      "aria-valuenow",
      "1",
    );

    await user.click(sectionById("profile").getByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText(/^Full name/)).toHaveValue("Alex Rivera");
    expect(screen.getByLabelText(/^Email/)).toHaveValue("alex@example.com");
  });

  it("associates invalid education dates with the end-date field", async () => {
    const user = userEvent.setup();
    render(<CVBuilder />);

    await user.click(sectionById("education").getByRole("button", { name: "Edit" }));
    const education = sectionById("education");
    await user.type(education.getByLabelText(/^School name/), "Central College");
    await user.type(education.getByLabelText(/^Title of study/), "Web Development");
    await user.type(education.getByLabelText(/^Start date/), "2012-09");
    const endDate = education.getByLabelText(/^End date/);
    await user.type(endDate, "2011-01");
    await user.click(education.getByRole("button", { name: /save education/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "An education end date can’t be earlier than its start date.",
    );
    expect(endDate).toHaveAttribute("aria-invalid", "true");
    await waitFor(() => expect(endDate).toHaveFocus());
  });

  it("saves education as HTML and keeps the saved values when editing again", async () => {
    const user = userEvent.setup();
    render(<CVBuilder />);

    await user.click(sectionById("education").getByRole("button", { name: "Edit" }));
    const education = sectionById("education");
    await user.type(education.getByLabelText(/^School name/), "Central College");
    await user.type(education.getByLabelText(/^Title of study/), "Web Development");
    await user.type(education.getByLabelText(/^Start date/), "2021-01");
    await user.type(education.getByLabelText(/^End date/), "2022-06");
    await user.click(education.getByRole("button", { name: /save education/i }));

    const preview = within(screen.getByLabelText("Résumé preview"));
    expect(
      preview.getByRole("heading", { name: "Web Development" }),
    ).toBeVisible();
    expect(preview.getByText("Central College")).toBeVisible();

    await user.click(sectionById("education").getByRole("button", { name: "Edit" }));
    expect(sectionById("education").getByLabelText(/^School name/)).toHaveValue(
      "Central College",
    );
    expect(sectionById("education").getByLabelText(/^End date/)).toHaveValue(
      "2022-06",
    );
  });

  it("saves experience responsibilities and treats a blank end date as Present", async () => {
    const user = userEvent.setup();
    render(<CVBuilder />);

    await user.click(sectionById("experience").getByRole("button", { name: "Edit" }));
    const experience = sectionById("experience");
    await user.type(experience.getByLabelText(/^Company name/), "Neighborhood Bakery");
    await user.type(experience.getByLabelText(/^Position title/), "Front-end Developer");
    await user.type(experience.getByLabelText(/^From/), "2023-01");
    await user.type(
      experience.getByLabelText(/^Main responsibilities/),
      "Built the online menu\nImproved keyboard navigation",
    );
    await user.click(experience.getByRole("button", { name: /save experience/i }));

    const preview = within(screen.getByLabelText("Résumé preview"));
    expect(
      preview.getByRole("heading", { name: "Front-end Developer" }),
    ).toBeVisible();
    expect(preview.getByText(/Jan 2023/)).toBeVisible();
    expect(preview.getByText(/Present/)).toBeVisible();
    const responsibilities = within(preview.getByRole("list"));
    expect(responsibilities.getByText("Built the online menu")).toBeVisible();
    expect(
      responsibilities.getByText("Improved keyboard navigation"),
    ).toBeVisible();

    await user.click(sectionById("experience").getByRole("button", { name: "Edit" }));
    expect(experience.getByLabelText(/^Company name/)).toHaveValue(
      "Neighborhood Bakery",
    );
    expect(experience.getByLabelText(/^Until/)).toHaveValue("");
  });

  it("lets users undo an entry removed from a draft", async () => {
    const user = userEvent.setup();
    render(<CVBuilder />);

    await user.click(sectionById("experience").getByRole("button", { name: "Edit" }));
    const experience = sectionById("experience");
    await user.click(experience.getByRole("button", { name: /add experience/i }));

    const secondRole = within(experience.getByRole("group", { name: "Role 2" }));
    await user.type(secondRole.getByLabelText(/^Company name/), "Local Workshop");
    await user.click(experience.getByRole("button", { name: "Remove role 2" }));
    expect(experience.queryByDisplayValue("Local Workshop")).not.toBeInTheDocument();

    await user.click(experience.getByRole("button", { name: "Undo" }));
    expect(experience.getByDisplayValue("Local Workshop")).toBeVisible();
  });
});
