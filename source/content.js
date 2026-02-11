const log = (...args) => console.log('[BambooHR Timesheet Extension]', ...args);

log('Extension loaded, waiting for timesheet entries...');

function fillTimesheet() {
	// Get all divs with timesheet entries excluding weekends
	const divs = document.querySelectorAll('div.TimesheetSlat:not(.js-timesheet-showWeekends)');

	if (divs.length === 0) {
		log('No timesheet entries found yet');
		return false; // Elements not found yet
	}

	// Exclude divs with extra info items most likely to be sick days or holidays
	const filteredDivs = [...divs].filter(x => !x.querySelector('.TimesheetSlat__extraInfoItem'));
	log(`Found ${divs.length} entries, ${filteredDivs.length} after filtering out sick days/holidays`);
	const nativeInputValueSetter = Object.getOwnPropertyDescriptor(globalThis.HTMLInputElement.prototype, 'value').set;
	const inputEvent = new Event('input', {bubbles: true});
	let inputChanged = false;
	let filledCount = 0;
	let skippedDisabled = 0;
	let skippedFilled = 0;
	for (const x of filteredDivs) {
		const input = x.querySelector('.TimesheetSlat__input');
		// Exclude input if it is disabled or has a value
		if (input && !input.disabled && !input.value) {
			nativeInputValueSetter.call(input, '7,4');
			input.dispatchEvent(inputEvent);
			inputChanged = true;
			filledCount++;
		} else if (input?.disabled) {
			skippedDisabled++;
		} else if (input?.value) {
			skippedFilled++;
		}
	}

	log(`Filled ${filledCount} inputs, skipped ${skippedDisabled} disabled, skipped ${skippedFilled} already filled`);

	if (inputChanged) {
		log('Submitting timesheet');
		document.dispatchEvent(new CustomEvent('SiteFooter:open'));
		document.querySelector('button.SiteFooter__action.SiteFooter__action--primary').click();
	} else {
		log('No changes needed');
	}

	return true; // Successfully processed
}

function waitForElements() {
	// Try immediately first
	if (fillTimesheet()) {
		return;
	}

	// If not found, use MutationObserver to wait for elements
	let debounceTimer = null;
	const observer = new MutationObserver((mutations, obs) => {
		// Clear existing timer
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		// Wait 500ms after last mutation before attempting to fill
		debounceTimer = setTimeout(() => {
			if (fillTimesheet()) {
				obs.disconnect();
			}
		}, 500);
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});

	// Fallback: stop observing after 10 seconds
	setTimeout(() => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		observer.disconnect();
	}, 10_000);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', waitForElements);
} else {
	waitForElements();
}
