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
  const savedEducation = education.filter(
    (item) => item.school || item.degree || item.startDate || item.endDate,
  );
  const savedExperience = experience.filter(
    (item) =>
      item.company ||
      item.position ||
      item.location ||
      item.startDate ||
      item.endDate ||
      item.responsibilities,
  );
  const hasContact = Boolean(
    profile.email || profile.phone || profile.location || profile.website,
  );

  return (
    <aside className="cv-preview-panel" aria-label="Résumé preview">
      <div className="cv-preview-toolbar">
        <div>
          <span className="cv-eyebrow">CV preview</span>
          <p>Saved sections appear here.</p>
        </div>
      </div>

      <article className="resume-sheet">
        <header className="resume-header">
          <div className="resume-heading">
            <p className="resume-kicker">Curriculum vitae</p>
            <h1>{profile.fullName || "Your name"}</h1>
            <p className="resume-role">{profile.role || "Your professional title"}</p>
          </div>

          {hasContact ? (
            <dl className="resume-contact-list">
              {profile.email && (
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${profile.email}`}>{profile.email}</a>
                  </dd>
                </div>
              )}
              {profile.phone && (
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${profile.phone.replace(/[^+\d]/g, "")}`}>
                      {profile.phone}
                    </a>
                  </dd>
                </div>
              )}
              {profile.location && (
                <div>
                  <dt>Location</dt>
                  <dd>{profile.location}</dd>
                </div>
              )}
              {profile.website && (
                <div>
                  <dt>Portfolio</dt>
                  <dd>
                    <a
                      href={
                        /^https?:\/\//i.test(profile.website)
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
          ) : (
            <p className="resume-empty resume-contact-empty">
              Your contact details will appear here.
            </p>
          )}
        </header>

        <div className="resume-content">
          <section className="resume-profile">
            <h2>Profile</h2>
            <p>
              {profile.summary || "Your professional summary will appear here."}
            </p>
          </section>

          <section className="resume-experience">
            <h2>Experience</h2>
            {savedExperience.length ? (
              <div className="resume-job-list">
                {savedExperience.map((item) => (
                  <article className="resume-job" key={item.id}>
                    <div className="resume-job-heading">
                      <div>
                        <h3>{item.position}</h3>
                        <p>
                          {item.company}
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
            ) : (
              <p className="resume-empty">Saved experience will appear here.</p>
            )}
          </section>

          <section className="resume-education">
            <h2>Education</h2>
            {savedEducation.length ? (
              <div className="resume-education-list">
                {savedEducation.map((item) => (
                  <article className="resume-education-item" key={item.id}>
                    <div>
                      <h3>{item.degree}</h3>
                      <p>{item.school}</p>
                    </div>
                    <small>
                      <DateRange start={item.startDate} end={item.endDate} />
                    </small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="resume-empty">Saved education will appear here.</p>
            )}
          </section>
        </div>
      </article>
    </aside>
  );
}
