function fillTimesheet() {
	// Get all divs with timesheet entries excluding weekends
	const divs = document.querySelectorAll('div.TimesheetSlat:not(.js-timesheet-showWeekends)');

	if (divs.length === 0) {
		return false; // Elements not found yet
	}

	// Exclude divs with extra info items most likely to be sick days or holidays
	const filteredDivs = Array.from(divs).filter(x => !x.querySelector('.TimesheetSlat__extraInfoItem'));
	const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
	const inputEvent = new Event('input', {bubbles: true});
	let inputChanged = false;
	for (const x of filteredDivs) {
		const input = x.querySelector('.TimesheetSlat__input');
		// Exclude input if it is disabled or has a value
		if (input && !input.disabled && !input.value) {
			nativeInputValueSetter.call(input, '7,4');
			input.dispatchEvent(inputEvent);
			inputChanged = true;
		}
	}

	if (inputChanged) {
		document.dispatchEvent(new CustomEvent('SiteFooter:open'));
		document.querySelector('button.SiteFooter__action.SiteFooter__action--primary').click();
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
		subtree: true
	});

	// Fallback: stop observing after 10 seconds
	setTimeout(() => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		observer.disconnect();
	}, 10000);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', waitForElements);
} else {
	waitForElements();
}
