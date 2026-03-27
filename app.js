document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const form = document.getElementById("snapshot-form");
  const result = document.getElementById("snapshot-result");

  if (form && result) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const focus = document.getElementById("program-focus").value;
      const work = document.getElementById("work-history").value;
      const duration = document.getElementById("condition-duration").value;
      const status = document.getElementById("support-status").value;
      const rep = document.getElementById("representation").value;

      if (!focus || !work || !duration || !status || !rep) {
        alert("Please answer all questions to see your snapshot.");
        return;
      }

      const points = {};
      const add = (k, n) => points[k] = (points[k] || 0) + n;

      if (focus.includes("SSDI")) add("SSDI", 2);
      if (focus.includes("SSI")) add("SSI", 2);
      if (focus.includes("VA")) add("VA", 2);
      if (focus.includes("State")) add("STATE", 2);
      if (focus.includes("Unsure")) add("SSDI", 1), add("SSI", 1);

      if (work.includes("full-time")) add("SSDI", 2);
      if (work.includes("Very limited") || work.includes("Mostly out")) add("SSI", 2);

      if (duration.startsWith("Less")) add("SHORT", 2);
      if (duration.includes("24+")) add("LONG", 2);

      if (status.includes("denied")) add("APPEAL", 2);
      if (status.includes("appealing")) add("APPEAL", 3);

      if (rep.startsWith("No")) add("NEED_REP", 2);

      const topPrograms = [];
      if ((points.SSDI || 0) > 0) topPrograms.push("Social Security Disability Insurance (SSDI)");
      if ((points.SSI || 0) > 0) topPrograms.push("Supplemental Security Income (SSI)");
      if ((points.VA || 0) > 0) topPrograms.push("VA disability benefits");
      if ((points.STATE || 0) > 0) topPrograms.push("state disability programs");

      const lines = [];

      lines.push("<strong>This is an informal snapshot, not a decision.</strong>");
      if (topPrograms.length) {
        lines.push("People in similar situations often explore:");
        lines.push("<ul><li>" + topPrograms.join("</li><li>") + "</li></ul>");
      }

      if ((points.LONG || 0) > 0) {
        lines.push("Because your condition has limited work for a year or more, many agencies focus on how consistently you have been unable to work, not just a single date.");
      } else if ((points.SHORT || 0) > 0) {
        lines.push("Because your condition has limited work for less than a year, some programs may wait to see if it becomes long-term. Ask directly about duration rules.");
      }

      if ((points.APPEAL || 0) > 0) {
        lines.push("People who are denied often have strict deadlines to appeal. Ask the agency or a representative about your exact appeal timeline.");
      }

      if ((points.NEED_REP || 0) > 0) {
        lines.push("Many people choose to talk with a disability advocate or attorney who can review their file, help collect medical evidence, and explain appeal options.");
      }

      lines.push("Bring this summary, along with your work history and medical records, when you talk with Social Security, the VA, a state agency, or a licensed professional.");

      result.innerHTML = lines.map(l => `<p>${l}</p>`).join("");
      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
});
