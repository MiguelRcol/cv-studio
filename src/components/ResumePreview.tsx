import type { Education, Experience, Profile } from "./types";

type ResumePreviewProps = {
  profile: Profile;
  education: Education[];
  experience: Experience[];
};

function formatMonth(value: string) {
  if (!value) return "Present";

  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function DateRange({ start, end }: { start: string; end: string }) {
  if (!start) return <span>Date not set</span>;

  return (
    <span>
      <time dateTime={start}>{formatMonth(start)}</time> —{" "}
      {end ? <time dateTime={end}>{formatMonth(end)}</time> : "Present"}
    </span>
  );
}

export function ResumePreview({
  profile,
  education,
  experience,
}: ResumePreviewProps) {
  const initials = profile.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="cv-preview-panel" aria-label="Résumé preview">
      <div className="cv-preview-toolbar">
        <div>
          <span className="cv-eyebrow">Saved preview</span>
          <p>Your résumé updates when you save a section.</p>
        </div>
        <span className="cv-page-count">A4 · 1 page</span>
      </div>

      <article className="resume-sheet">
        <header className="resume-header">
          <div className="resume-monogram" aria-hidden="true">
            {initials || "CV"}
          </div>
          <div className="resume-heading">
            <p className="resume-kicker">Curriculum vitae</p>
            <h1>{profile.fullName || "Your name"}</h1>
            <p className="resume-role">{profile.role || "Your professional title"}</p>
          </div>
        </header>

        <div className="resume-body">
          <aside className="resume-sidebar">
            <section>
              <h2>Contact</h2>
              <dl className="resume-contact-list">
                <div>
                  <dt>Email</dt>
                  <dd>
                    {profile.email ? (
                      <a href={`mailto:${profile.email}`}>{profile.email}</a>
                    ) : (
                      "you@example.com"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>
                    {profile.phone ? (
                      <a href={`tel:${profile.phone.replace(/[^+\d]/g, "")}`}>
                        {profile.phone}
                      </a>
                    ) : (
                      "+1 000 000 0000"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Based in</dt>
                  <dd>{profile.location || "Your location"}</dd>
                </div>
                {profile.website && (
                  <div>
                    <dt>Portfolio</dt>
                    <dd>
                      <a
                        href={
                          profile.website.startsWith("http")
                            ? profile.website
                            : `https://${profile.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        {profile.website}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            <section>
              <h2>Education</h2>
              <div className="resume-sidebar-stack">
                {education.map((item) => (
                  <div className="resume-education-item" key={item.id}>
                    <p>{item.degree || "Degree or field of study"}</p>
                    <span>{item.school || "School name"}</span>
                    <small>
                      <DateRange start={item.startDate} end={item.endDate} />
                    </small>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <div className="resume-main">
            <section className="resume-profile">
              <h2>Profile</h2>
              <p>
                {profile.summary ||
                  "Add a short professional summary to introduce your strengths and point of view."}
              </p>
            </section>

            <section className="resume-experience">
              <h2>Experience</h2>
              <div className="resume-timeline">
                {experience.map((item) => (
                  <article className="resume-job" key={item.id}>
                    <div className="resume-job-marker" aria-hidden="true" />
                    <div className="resume-job-heading">
                      <div>
                        <h3>{item.position || "Position title"}</h3>
                        <p>
                          {item.company || "Company"}
                          {item.location ? ` · ${item.location}` : ""}
                        </p>
                      </div>
                      <small>
                        <DateRange start={item.startDate} end={item.endDate} />
                      </small>
                    </div>
                    <ul>
                      {item.responsibilities
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </article>
    </aside>
  );
}
