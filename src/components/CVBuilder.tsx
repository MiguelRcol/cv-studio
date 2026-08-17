import { useState } from "react";
import { ResumePreview } from "./ResumePreview";
import type { Education, Experience, Profile, SectionKey } from "./types";

const initialProfile: Profile = {
  fullName: "Maya Chen",
  role: "Senior Product Designer",
  email: "maya.chen@example.com",
  phone: "+1 415 555 0148",
  location: "San Francisco, CA",
  website: "https://mayachen.design",
  summary:
    "Product designer with 7+ years of experience turning complex workflows into calm, intuitive products. I pair systems thinking with close collaboration to create experiences that work beautifully for people and businesses.",
};

const initialEducation: Education[] = [
  {
    id: "education-1",
    school: "Rhode Island School of Design",
    degree: "BFA, Graphic Design",
    startDate: "2012-09",
    endDate: "2016-05",
  },
];

const initialExperience: Experience[] = [
  {
    id: "experience-1",
    company: "Northstar Labs",
    position: "Senior Product Designer",
    location: "San Francisco",
    startDate: "2022-03",
    endDate: "",
    responsibilities:
      "Led the end-to-end redesign of the analytics workspace, improving task completion by 34%.\nBuilt a cross-platform design system used by six product squads.\nPartnered with research and engineering to ship accessible workflows for enterprise teams.",
  },
  {
    id: "experience-2",
    company: "Fieldnote",
    position: "Product Designer",
    location: "Remote",
    startDate: "2018-06",
    endDate: "2022-02",
    responsibilities:
      "Designed collaboration tools from first concept through launch.\nCreated research programs that brought customer feedback into quarterly planning.",
  },
];

const sectionLabels: Record<SectionKey, string> = {
  profile: "General information",
  education: "Education",
  experience: "Experience",
};

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  autoComplete,
  hint,
  invalid = false,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  invalid?: boolean;
  error?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <label className="cv-field" htmlFor={id}>
      <span>
        {label}
        {required && <em aria-hidden="true">*</em>}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        autoComplete={autoComplete}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      />
      {hint && <small id={hintId}>{hint}</small>}
      {error && (
        <small className="cv-field-error" id={errorId}>
          {error}
        </small>
      )}
    </label>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  hint,
  rows = 4,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rows?: number;
  maxLength?: number;
}) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <label className="cv-field cv-field-wide" htmlFor={id}>
      <span>{label}</span>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        maxLength={maxLength}
        aria-describedby={hintId}
      />
      {hint && <small id={hintId}>{hint}</small>}
    </label>
  );
}

function SectionHeading({
  number,
  title,
  description,
  editing,
  onEdit,
}: {
  number: string;
  title: string;
  description: string;
  editing: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="cv-section-heading">
      <span className="cv-section-number">{number}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {!editing && (
        <button className="cv-text-button" type="button" onClick={onEdit}>
          Edit
        </button>
      )}
    </div>
  );
}

export function CVBuilder() {
  const [profile, setProfile] = useState(initialProfile);
  const [education, setEducation] = useState(initialEducation);
  const [experience, setExperience] = useState(initialExperience);
  const [draftProfile, setDraftProfile] = useState(initialProfile);
  const [draftEducation, setDraftEducation] = useState(initialEducation);
  const [draftExperience, setDraftExperience] = useState(initialExperience);
  const [editing, setEditing] = useState<SectionKey | null>("profile");
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");
  const [announcement, setAnnouncement] = useState("");
  const [formError, setFormError] = useState("");
  const [invalidFieldId, setInvalidFieldId] = useState<string | null>(null);
  const [removedEducation, setRemovedEducation] = useState<{
    item: Education;
    index: number;
  } | null>(null);
  const [removedExperience, setRemovedExperience] = useState<{
    item: Experience;
    index: number;
  } | null>(null);

  const completedSections: Record<SectionKey, boolean> = {
    profile: Boolean(profile.fullName && profile.email && profile.phone),
    education: education.some(
      (item) => Boolean(item.school && item.degree && item.startDate && item.endDate),
    ),
    experience: experience.some(
      (item) => Boolean(item.company && item.position && item.startDate),
    ),
  };
  const completedCount = Object.values(completedSections).filter(Boolean).length;

  function beginEdit(section: SectionKey) {
    if (section === "profile") setDraftProfile(profile);
    if (section === "education") setDraftEducation(education);
    if (section === "experience") setDraftExperience(experience);
    setEditing(section);
    setActiveSection(section);
    setFormError("");
    setInvalidFieldId(null);
    setRemovedEducation(null);
    setRemovedExperience(null);
    setAnnouncement(`${sectionLabels[section]} is ready to edit.`);

    window.setTimeout(() => {
      const sectionElement = document.getElementById(section);
      sectionElement?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      sectionElement?.querySelector<HTMLElement>("input, textarea")?.focus();
    }, 0);
  }

  function saveSection(section: SectionKey) {
    const invalidEducation = draftEducation.find(
      (item) => item.startDate && item.endDate && item.endDate < item.startDate,
    );

    if (section === "education" && invalidEducation) {
      const fieldId = `education-end-${invalidEducation.id}`;
      setFormError("An education end date can’t be earlier than its start date.");
      setInvalidFieldId(fieldId);
      setAnnouncement("Please correct the education dates before saving.");
      window.setTimeout(() => document.getElementById(fieldId)?.focus(), 0);
      return;
    }

    const invalidExperience = draftExperience.find(
      (item) => item.startDate && item.endDate && item.endDate < item.startDate,
    );

    if (section === "experience" && invalidExperience) {
      const fieldId = `experience-end-${invalidExperience.id}`;
      setFormError("A role’s end date can’t be earlier than its start date.");
      setInvalidFieldId(fieldId);
      setAnnouncement("Please correct the experience dates before saving.");
      window.setTimeout(() => document.getElementById(fieldId)?.focus(), 0);
      return;
    }

    if (section === "profile") setProfile(draftProfile);
    if (section === "education") setEducation(draftEducation);
    if (section === "experience") setExperience(draftExperience);
    setEditing(null);
    setFormError("");
    setInvalidFieldId(null);
    setRemovedEducation(null);
    setRemovedExperience(null);
    setAnnouncement(`${sectionLabels[section]} saved. Your preview is updated.`);

    window.setTimeout(() => {
      document
        .querySelector<HTMLElement>(`#${section} .cv-text-button`)
        ?.focus();
    }, 0);
  }

  function cancelEdit(section: SectionKey) {
    if (section === "profile") setDraftProfile(profile);
    if (section === "education") setDraftEducation(education);
    if (section === "experience") setDraftExperience(experience);
    setEditing(null);
    setFormError("");
    setInvalidFieldId(null);
    setRemovedEducation(null);
    setRemovedExperience(null);
    setAnnouncement(`${sectionLabels[section]} changes discarded.`);

    window.setTimeout(() => {
      document
        .querySelector<HTMLElement>(`#${section} .cv-text-button`)
        ?.focus();
    }, 0);
  }

  function jumpTo(section: SectionKey) {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function updateEducation(id: string, patch: Partial<Education>) {
    if (invalidFieldId?.includes(id)) {
      setInvalidFieldId(null);
      setFormError("");
    }
    setDraftEducation((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function updateExperience(id: string, patch: Partial<Experience>) {
    if (invalidFieldId?.includes(id)) {
      setInvalidFieldId(null);
      setFormError("");
    }
    setDraftExperience((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  return (
    <main className="cv-app-shell">
      <header className="cv-app-header">
        <a className="cv-brand" href="#top" aria-label="CV Studio home">
          <span className="cv-brand-mark" aria-hidden="true">
            C
          </span>
          <span>CV Studio</span>
        </a>

        <div className="cv-header-actions">
          <span className={`cv-save-status ${editing ? "is-editing" : ""}`}>
            <span aria-hidden="true" /> {editing ? "Editing draft" : "All changes saved"}
          </span>
          <button
            className={`cv-print-button ${editing ? "is-secondary" : ""}`}
            type="button"
            onClick={() => window.print()}
          >
            Print / PDF
          </button>
        </div>
      </header>

      <div className="cv-workspace" id="top">
        <nav className="cv-section-nav" aria-label="CV sections">
          <div className="cv-nav-intro">
            <span className="cv-eyebrow">Your progress</span>
            <strong>{completedCount} of 3 sections</strong>
            <div
              className="cv-progress-track"
              role="progressbar"
              aria-label="CV completion"
              aria-valuemin={0}
              aria-valuemax={3}
              aria-valuenow={completedCount}
            >
              <span style={{ width: `${(completedCount / 3) * 100}%` }} />
            </div>
          </div>

          <ol>
            {(
              [
                ["profile", "01", "General"],
                ["education", "02", "Education"],
                ["experience", "03", "Experience"],
              ] as const
            ).map(([section, number, label]) => (
              <li key={section}>
                <button
                  className={activeSection === section ? "is-active" : ""}
                  type="button"
                  onClick={() => jumpTo(section)}
                  aria-current={activeSection === section ? "step" : undefined}
                >
                  <span>{number}</span>
                  {label}
                  {completedSections[section] && <b aria-label="Complete">✓</b>}
                </button>
              </li>
            ))}
          </ol>

          <div className="cv-tip-card">
            <span aria-hidden="true">✦</span>
            <p>
              <strong>A quick tip</strong>
              Start bullet points with an action and include the outcome when you can.
            </p>
          </div>
        </nav>

        <section className="cv-editor" aria-label="CV editor">
          <div className="cv-editor-intro">
            <span className="cv-eyebrow">Your story, clearly told</span>
            <h1>Build a résumé that feels like you.</h1>
            <p>
              Add the essentials, keep the language clear, and we’ll take care of the layout.
            </p>
          </div>

          <section className={`cv-form-section ${editing === "profile" ? "is-editing" : ""}`} id="profile">
            <SectionHeading
              number="01"
              title="General information"
              description="The essentials people use to know and reach you."
              editing={editing === "profile"}
              onEdit={() => beginEdit("profile")}
            />

            {editing === "profile" ? (
              <form
                className="cv-form-grid"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveSection("profile");
                }}
              >
                <Field
                  id="full-name"
                  label="Full name"
                  value={draftProfile.fullName}
                  onChange={(fullName) => setDraftProfile({ ...draftProfile, fullName })}
                  placeholder="e.g. Maya Chen"
                  required
                  autoComplete="name"
                />
                <Field
                  id="role"
                  label="Professional title"
                  value={draftProfile.role}
                  onChange={(role) => setDraftProfile({ ...draftProfile, role })}
                  placeholder="e.g. Product Designer"
                  required
                  autoComplete="organization-title"
                />
                <Field
                  id="email"
                  label="Email"
                  type="email"
                  value={draftProfile.email}
                  onChange={(email) => setDraftProfile({ ...draftProfile, email })}
                  required
                  autoComplete="email"
                />
                <Field
                  id="phone"
                  label="Phone"
                  type="tel"
                  value={draftProfile.phone}
                  onChange={(phone) => setDraftProfile({ ...draftProfile, phone })}
                  required
                  autoComplete="tel"
                />
                <Field
                  id="location"
                  label="Location"
                  value={draftProfile.location}
                  onChange={(location) => setDraftProfile({ ...draftProfile, location })}
                  autoComplete="address-level2"
                />
                <Field
                  id="website"
                  label="Portfolio or website"
                  type="url"
                  value={draftProfile.website}
                  onChange={(website) => setDraftProfile({ ...draftProfile, website })}
                  autoComplete="url"
                  placeholder="https://yourportfolio.com"
                />
                <TextAreaField
                  id="summary"
                  label="Professional summary"
                  value={draftProfile.summary}
                  onChange={(summary) => setDraftProfile({ ...draftProfile, summary })}
                  hint={`${draftProfile.summary.length}/320 characters · Aim for 2–3 concise sentences.`}
                  maxLength={320}
                />
                <div className="cv-form-actions cv-form-actions-split">
                  <button
                    className="cv-secondary-button"
                    type="button"
                    onClick={() => cancelEdit("profile")}
                  >
                    Cancel
                  </button>
                  <button className="cv-primary-button" type="submit">
                    Save &amp; continue <span aria-hidden="true">→</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="cv-saved-summary">
                <div>
                  <span>Name</span>
                  <strong>{profile.fullName}</strong>
                </div>
                <div>
                  <span>Contact</span>
                  <strong>{profile.email}</strong>
                </div>
              </div>
            )}
          </section>

          <section className={`cv-form-section ${editing === "education" ? "is-editing" : ""}`} id="education">
            <SectionHeading
              number="02"
              title="Education"
              description="Your studies, training, and qualifications."
              editing={editing === "education"}
              onEdit={() => beginEdit("education")}
            />

            {editing === "education" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  saveSection("education");
                }}
              >
                {formError && (
                  <p className="cv-form-error" role="alert">
                    {formError}
                  </p>
                )}
                <div className="cv-entry-stack">
                  {draftEducation.map((item, index) => (
                    <fieldset className="cv-entry-card" key={item.id}>
                      <legend>Education {index + 1}</legend>
                      {draftEducation.length > 1 && (
                        <button
                          className="cv-remove-button"
                          type="button"
                          onClick={() => {
                            setRemovedEducation({ item, index });
                            setDraftEducation((items) =>
                              items.filter((entry) => entry.id !== item.id),
                            );
                            setAnnouncement(
                              `Education ${index + 1} removed from the draft.`,
                            );
                          }}
                          aria-label={`Remove education ${index + 1}`}
                        >
                          Remove
                        </button>
                      )}
                      <div className="cv-form-grid">
                        <Field
                          id={`school-${item.id}`}
                          label="School name"
                          value={item.school}
                          onChange={(school) => updateEducation(item.id, { school })}
                          required
                        />
                        <Field
                          id={`degree-${item.id}`}
                          label="Title of study"
                          value={item.degree}
                          onChange={(degree) => updateEducation(item.id, { degree })}
                          required
                        />
                        <Field
                          id={`education-start-${item.id}`}
                          label="Start date"
                          type="month"
                          value={item.startDate}
                          onChange={(startDate) => updateEducation(item.id, { startDate })}
                          required
                        />
                        <Field
                          id={`education-end-${item.id}`}
                          label="End date"
                          type="month"
                          value={item.endDate}
                          onChange={(endDate) => updateEducation(item.id, { endDate })}
                          required
                          invalid={invalidFieldId === `education-end-${item.id}`}
                          error={
                            invalidFieldId === `education-end-${item.id}`
                              ? formError
                              : undefined
                          }
                        />
                      </div>
                    </fieldset>
                  ))}
                </div>
                {removedEducation && (
                  <div className="cv-undo-row" role="status">
                    <span>Education removed from this draft.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDraftEducation((items) => {
                          const nextItems = [...items];
                          nextItems.splice(
                            removedEducation.index,
                            0,
                            removedEducation.item,
                          );
                          return nextItems;
                        });
                        setRemovedEducation(null);
                        setAnnouncement("Education restored.");
                      }}
                    >
                      Undo
                    </button>
                  </div>
                )}
                <div className="cv-form-actions cv-form-actions-split">
                  <div className="cv-button-group">
                    <button
                      className="cv-secondary-button"
                      type="button"
                      onClick={() => cancelEdit("education")}
                    >
                      Cancel
                    </button>
                    <button
                      className="cv-secondary-button"
                      type="button"
                      onClick={() =>
                        setDraftEducation((items) => [
                          ...items,
                          {
                            id: `education-${Date.now()}`,
                            school: "",
                            degree: "",
                            startDate: "",
                            endDate: "",
                          },
                        ])
                      }
                    >
                      + Add education
                    </button>
                  </div>
                  <button className="cv-primary-button" type="submit">
                    Save education <span aria-hidden="true">→</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="cv-saved-list">
                {education.map((item) => (
                  <div key={item.id}>
                    <strong>{item.degree}</strong>
                    <span>{item.school}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={`cv-form-section ${editing === "experience" ? "is-editing" : ""}`} id="experience">
            <SectionHeading
              number="03"
              title="Practical experience"
              description="The work, responsibilities, and results that shaped you."
              editing={editing === "experience"}
              onEdit={() => beginEdit("experience")}
            />

            {editing === "experience" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  saveSection("experience");
                }}
              >
                {formError && (
                  <p className="cv-form-error" role="alert">
                    {formError}
                  </p>
                )}
                <div className="cv-entry-stack">
                  {draftExperience.map((item, index) => (
                    <fieldset className="cv-entry-card" key={item.id}>
                      <legend>Role {index + 1}</legend>
                      {draftExperience.length > 1 && (
                        <button
                          className="cv-remove-button"
                          type="button"
                          onClick={() => {
                            setRemovedExperience({ item, index });
                            setDraftExperience((items) =>
                              items.filter((entry) => entry.id !== item.id),
                            );
                            setAnnouncement(`Role ${index + 1} removed from the draft.`);
                          }}
                          aria-label={`Remove role ${index + 1}`}
                        >
                          Remove
                        </button>
                      )}
                      <div className="cv-form-grid">
                        <Field
                          id={`company-${item.id}`}
                          label="Company name"
                          value={item.company}
                          onChange={(company) => updateExperience(item.id, { company })}
                          required
                        />
                        <Field
                          id={`position-${item.id}`}
                          label="Position title"
                          value={item.position}
                          onChange={(position) => updateExperience(item.id, { position })}
                          required
                        />
                        <Field
                          id={`experience-location-${item.id}`}
                          label="Location"
                          value={item.location}
                          onChange={(location) => updateExperience(item.id, { location })}
                        />
                        <div aria-hidden="true" className="cv-field-spacer" />
                        <Field
                          id={`experience-start-${item.id}`}
                          label="From"
                          type="month"
                          value={item.startDate}
                          onChange={(startDate) => updateExperience(item.id, { startDate })}
                          required
                        />
                        <Field
                          id={`experience-end-${item.id}`}
                          label="Until (optional)"
                          type="month"
                          value={item.endDate}
                          onChange={(endDate) => updateExperience(item.id, { endDate })}
                          hint="Leave blank if this is your current role."
                          invalid={invalidFieldId === `experience-end-${item.id}`}
                          error={
                            invalidFieldId === `experience-end-${item.id}`
                              ? formError
                              : undefined
                          }
                        />
                        <TextAreaField
                          id={`responsibilities-${item.id}`}
                          label="Main responsibilities"
                          value={item.responsibilities}
                          onChange={(responsibilities) =>
                            updateExperience(item.id, { responsibilities })
                          }
                          hint="Put each achievement or responsibility on a new line."
                          rows={5}
                        />
                      </div>
                    </fieldset>
                  ))}
                </div>
                {removedExperience && (
                  <div className="cv-undo-row" role="status">
                    <span>Experience removed from this draft.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDraftExperience((items) => {
                          const nextItems = [...items];
                          nextItems.splice(
                            removedExperience.index,
                            0,
                            removedExperience.item,
                          );
                          return nextItems;
                        });
                        setRemovedExperience(null);
                        setAnnouncement("Experience restored.");
                      }}
                    >
                      Undo
                    </button>
                  </div>
                )}
                <div className="cv-form-actions cv-form-actions-split">
                  <div className="cv-button-group">
                    <button
                      className="cv-secondary-button"
                      type="button"
                      onClick={() => cancelEdit("experience")}
                    >
                      Cancel
                    </button>
                    <button
                      className="cv-secondary-button"
                      type="button"
                      onClick={() =>
                        setDraftExperience((items) => [
                          ...items,
                          {
                            id: `experience-${Date.now()}`,
                            company: "",
                            position: "",
                            location: "",
                            startDate: "",
                            endDate: "",
                            responsibilities: "",
                          },
                        ])
                      }
                    >
                      + Add experience
                    </button>
                  </div>
                  <button className="cv-primary-button" type="submit">
                    Save experience <span aria-hidden="true">→</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="cv-saved-list">
                {experience.map((item) => (
                  <div key={item.id}>
                    <strong>{item.position}</strong>
                    <span>{item.company}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <p className="cv-editor-footer">
            Your information stays in this browser session and is never uploaded.
          </p>
        </section>

        <ResumePreview
          profile={profile}
          education={education}
          experience={experience}
        />
      </div>

      <p className="cv-visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </main>
  );
}
