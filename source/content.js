async function init() {
	// get all divs with timesheet entries excluding weekends
	let divs = document.querySelectorAll('div.TimesheetSlat:not(.js-timesheet-showWeekends)');
	// exclude divs with extra info items most likely to be sick days or holidays
	let filteredDivs = Array.from(divs).filter(x => !x.querySelector('.TimesheetSlat__extraInfoItem'));
	let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
	let inputEvent = new Event('input', { bubbles: true });
	let inputChanged = false;
	filteredDivs.forEach(x => {
		let input = x.querySelector('.TimesheetSlat__input');
		// exclude input if it is disabled or has a value
		if (input && !input.disabled) {
			nativeInputValueSetter.call(input, '7,4');
			input.dispatchEvent(inputEvent);
			inputChanged = true;
		}
	});

	if (inputChanged) {
		document.dispatchEvent(new CustomEvent('SiteFooter:open'));
		document.querySelector('button.SiteFooter__action.SiteFooter__action--primary').click();
	}
}

init();
