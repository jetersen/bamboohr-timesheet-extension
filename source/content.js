const log = (...args) => console.log("[BambooHR Timesheet Extension]", ...args);
const filledInputs = new WeakSet();
const editedInputs = new WeakSet();
const extensionInputEvents = new WeakSet();
const pendingInputs = new Set();
let hasOpenedFooter = false;

log("Extension loaded, waiting for timesheet entries...");

// Capture edits before page handlers can rerender or stop propagation.
document.addEventListener(
	"input",
	(event) => {
		const input = event.target;
		if (
			!(input instanceof HTMLInputElement && input.matches(".TimesheetSlat__input")) ||
			extensionInputEvents.has(event)
		) {
			return;
		}

		editedInputs.add(input);
		pendingInputs.delete(input);
	},
	{ capture: true },
);

function fillTimesheet() {
	const divs = document.querySelectorAll("div.TimesheetSlat:not(.js-timesheet-showWeekends)");
	const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	).set;
	let filledCount = 0;

	for (const div of divs) {
		// Exclude sick days, holidays, and other leave entries.
		if (div.querySelector(".TimesheetSlat__extraInfoItem")) {
			continue;
		}

		const input = div.querySelector(".TimesheetSlat__input");
		if (
			!input ||
			input.disabled ||
			input.readOnly ||
			input.value ||
			filledInputs.has(input) ||
			editedInputs.has(input)
		) {
			continue;
		}

		// Remember each input so later mutations do not undo a user's edits.
		filledInputs.add(input);
		nativeInputValueSetter.call(input, "7,4");
		pendingInputs.add(input);
		const inputEvent = new Event("input", { bubbles: true });
		extensionInputEvents.add(inputEvent);
		input.dispatchEvent(inputEvent);
		filledCount++;
	}

	if (filledCount > 0) {
		log(`Filled ${filledCount} inputs`);
	}

	for (const input of pendingInputs) {
		if (!input.isConnected || !input.value) {
			pendingInputs.delete(input);
		}
	}

	if (pendingInputs.size === 0) {
		hasOpenedFooter = false;
		return;
	}

	if (!hasOpenedFooter) {
		hasOpenedFooter = true;
		document.dispatchEvent(new CustomEvent("SiteFooter:open"));
	}

	// The footer can mount or become enabled after the inputs render.
	const submit = document.querySelector("button.SiteFooter__action.SiteFooter__action--primary");
	if (!submit || submit.disabled) {
		return;
	}

	pendingInputs.clear();
	hasOpenedFooter = false;
	log("Saving timesheet");
	submit.click();
}

function waitForElements() {
	let scanTimer;
	const scheduleScan = () => {
		// Coalesce mutations without letting continuous page activity starve the scan.
		if (scanTimer !== undefined) {
			return;
		}

		scanTimer = setTimeout(() => {
			scanTimer = undefined;
			fillTimesheet();
		}, 500);
	};

	const observer = new MutationObserver(scheduleScan);
	observer.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["disabled", "readonly", "class"],
	});

	// Keep watching for asynchronous rendering and later batches of entries.
	fillTimesheet();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", waitForElements, {
		once: true,
	});
} else {
	waitForElements();
}
