import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test, vi } from "vite-plus/test";
import { JSDOM, VirtualConsole } from "jsdom";

const source = readFileSync(new URL("../source/content.js", import.meta.url), "utf8");
const row = '<div class="TimesheetSlat"><input class="TimesheetSlat__input"></div>';
const footer =
	'<button class="SiteFooter__action SiteFooter__action--primary">Save Changes</button>';

async function fixture(t, html = "", readyState = "complete") {
	vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
	t.onTestFinished(() => vi.useRealTimers());
	const dom = new JSDOM(html, {
		url: "https://example.bamboohr.com/employees/timesheet/?id=1",
		runScripts: "outside-only",
		virtualConsole: new VirtualConsole(),
	});
	t.onTestFinished(() => dom.window.close());
	const { window } = dom;
	Object.defineProperty(window.document, "readyState", {
		value: readyState,
		configurable: true,
	});
	window.setTimeout = (...args) => setTimeout(...args);
	window.clearTimeout = (timer) => clearTimeout(timer);
	let clicks = 0;
	let inputs = 0;
	window.document.addEventListener("click", (event) => {
		if (event.target.matches("button.SiteFooter__action--primary")) {
			clicks++;
		}
	});
	window.document.addEventListener("input", () => inputs++);
	window.eval(source);
	const flush = async (ms = 500) => {
		await Promise.resolve();
		vi.advanceTimersByTime(ms);
		await Promise.resolve();
	};

	await flush();
	return {
		window,
		document: window.document,
		flush,
		clicks: () => clicks,
		inputs: () => inputs,
	};
}

test("fills an already loaded timesheet and saves once", async (t) => {
	const f = await fixture(t, row + footer);
	assert.strictEqual(f.document.querySelector("input").value, "7,4");
	assert.strictEqual(f.inputs(), 1);
	assert.strictEqual(f.clicks(), 1);
});

test("waits for rows rendered after ten seconds", async (t) => {
	const f = await fixture(t, footer);
	await f.flush(15_000);
	f.document.body.insertAdjacentHTML("afterbegin", row);
	await f.flush();
	assert.strictEqual(f.document.querySelector("input").value, "7,4");
	assert.strictEqual(f.clicks(), 1);
});

test("waits for inputs inside existing slats", async (t) => {
	const f = await fixture(t, `<div class="TimesheetSlat"></div>${footer}`);
	f.document.querySelector(".TimesheetSlat").innerHTML = '<input class="TimesheetSlat__input">';
	await f.flush();
	assert.strictEqual(f.document.querySelector("input").value, "7,4");
	assert.strictEqual(f.clicks(), 1);
});

test("waits for initially disabled inputs to become editable", async (t) => {
	const f = await fixture(t, row.replace("<input ", "<input disabled ") + footer);
	f.document.querySelector("input").disabled = false;
	await f.flush();
	assert.strictEqual(f.document.querySelector("input").value, "7,4");
	assert.strictEqual(f.clicks(), 1);
});

test("waits for the save control without losing pending changes", async (t) => {
	const f = await fixture(t, row);
	f.document.body.insertAdjacentHTML("beforeend", footer.replace("<button ", "<button disabled "));
	await f.flush();
	assert.strictEqual(f.clicks(), 0);
	f.document.querySelector("button").disabled = false;
	await f.flush();
	assert.strictEqual(f.clicks(), 1);
	assert.strictEqual(f.inputs(), 1);
});

test("handles later batches without refilling an input cleared by the user", async (t) => {
	const f = await fixture(t, row + footer);
	f.document.querySelector("input").value = "";
	f.document.body.insertAdjacentHTML("afterbegin", row);
	await f.flush();
	assert.deepStrictEqual(
		[...f.document.querySelectorAll("input")].map((x) => x.value),
		["7,4", ""],
	);
	assert.strictEqual(f.clicks(), 2);
	f.document.body.append(f.document.createElement("span"));
	await f.flush();
	assert.strictEqual(f.clicks(), 2);
});

test("preserves weekends, leave, disabled, readonly and filled entries", async (t) => {
	const html =
		row.replace('TimesheetSlat"', 'TimesheetSlat js-timesheet-showWeekends"') +
		row.replace("</div>", '<span class="TimesheetSlat__extraInfoItem"></span></div>') +
		row.replace("<input ", "<input disabled ") +
		row.replace("<input ", "<input readonly ") +
		row.replace("<input ", '<input value="8" ');
	const f = await fixture(t, html + footer);
	assert.deepStrictEqual(
		[...f.document.querySelectorAll("input")].map((x) => x.value),
		["", "", "", "", "8"],
	);
	assert.strictEqual(f.clicks(), 0);
});

test("starts when DOMContentLoaded fires", async (t) => {
	const f = await fixture(t, row + footer, "loading");
	f.document.dispatchEvent(new f.window.Event("DOMContentLoaded"));
	await f.flush();
	assert.strictEqual(f.document.querySelector("input").value, "7,4");
	assert.strictEqual(f.clicks(), 1);
});

test("continuous unrelated mutations do not postpone filling indefinitely", async (t) => {
	const f = await fixture(t, footer);
	f.document.body.insertAdjacentHTML("afterbegin", row);
	for (let i = 0; i < 6; i++) {
		f.document.body.append(f.document.createElement("span"));
		// Each mutation must arrive before the previous scan deadline.
		await f.flush(100);
	}

	assert.strictEqual(f.document.querySelector("input").value, "7,4");
	assert.strictEqual(f.clicks(), 1);
});

test("does not save stale changes after rows are removed", async (t) => {
	const f = await fixture(t, row);
	f.document.querySelector(".TimesheetSlat").remove();
	f.document.body.insertAdjacentHTML("beforeend", footer);
	await f.flush();
	assert.strictEqual(f.clicks(), 0);
});

test("does not refill an existing value that the user clears", async (t) => {
	const f = await fixture(t, row.replace("<input ", '<input value="8" ') + footer);
	const input = f.document.querySelector("input");
	input.value = "";
	input.dispatchEvent(new f.window.Event("input", { bubbles: true }));
	input.closest(".TimesheetSlat").classList.add("dirty");
	await f.flush();
	assert.strictEqual(input.value, "");
	assert.strictEqual(f.clicks(), 0);
});

test("preserves edits to a newly rendered input before the scheduled scan", async (t) => {
	const f = await fixture(t, footer);
	f.document.body.insertAdjacentHTML("afterbegin", row);
	const input = f.document.querySelector("input");
	input.value = "8";
	input.dispatchEvent(new f.window.Event("input", { bubbles: true }));
	input.value = "";
	input.dispatchEvent(new f.window.Event("input", { bubbles: true }));
	await f.flush();
	assert.strictEqual(input.value, "");
	assert.strictEqual(f.clicks(), 0);
});

test("does not save a pending input after the user edits it", async (t) => {
	const f = await fixture(t, row);
	const input = f.document.querySelector("input");
	input.value = "8";
	input.dispatchEvent(new f.window.Event("input", { bubbles: true }));
	f.document.body.insertAdjacentHTML("beforeend", footer);
	await f.flush();
	assert.strictEqual(input.value, "8");
	assert.strictEqual(f.clicks(), 0);
});

test("waits for readonly inputs to become editable", async (t) => {
	const f = await fixture(t, row.replace("<input ", "<input readonly ") + footer);
	f.document.querySelector("input").readOnly = false;
	await f.flush();
	assert.strictEqual(f.document.querySelector("input").value, "7,4");
	assert.strictEqual(f.clicks(), 1);
});
