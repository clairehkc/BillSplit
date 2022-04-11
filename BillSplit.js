let subtotal = total = 0;

function loadGroupSample() {
	const input = document.getElementById("billInput").value = `
david (You)
1	Super Burrito
$11.52
 	Choice of Meat
 	Pastor (Marinated Pork) ($0.00)
 	Choice of Beans
 	Black Beans ($0.00)
 	Tortilla Option
 	Flour (Recommended) ($0.00)
Claire
1	Super Quesadilla Suiza
$13.70
 	Choice of Meat
 	Asada (Steak) ($2.00)
 	Tortilla Option
 	Flour (Recommended) ($0.00)
Vince
1	Super Burrito
$11.52
 	Choice of Meat
 	Pastor (Marinated Pork) ($0.00)
 	Choice of Beans
 	Pinto Beans ($0.00)
 	Tortilla Option
 	Tomato ($0.00)
 
Subtotal	$36.74
Tax	$3.12
Service Fee 	$5.51
Delivery Fee 	$1.99
Delivery person tip	$7.10
`
}

function loadRegularSample() {
	const input = document.getElementById("billInput").value = `
1	Super Burrito
$11.52
 	Choice of Meat
 	Pastor (Marinated Pork) ($0.00)
 	Choice of Beans
 	Black Beans ($0.00)
 	Tortilla Option
 	Flour (Recommended) ($0.00)
1	Super Quesadilla Suiza
$13.70
 	Choice of Meat
 	Asada (Steak) ($2.00)
 	Tortilla Option
 	Flour (Recommended) ($0.00)
1	Super Burrito
$11.52
 	Choice of Meat
 	Pastor (Marinated Pork) ($0.00)
 	Choice of Beans
 	Pinto Beans ($0.00)
 	Tortilla Option
 	Tomato ($0.00)
 
Subtotal	$36.74
Tax	$3.12
Service Fee 	$5.51
Delivery Fee 	$1.99
Delivery person tip	$7.10
`
}

function reset() {
	subtotal = total = 0;
}

function priceToFloat(price) {
	const priceInFloat = parseFloat(price.replace("$", ""));
	if (isNaN(priceInFloat)) {
		console.error("invalid input");
		displayErrorMessage();
		return;	
	}
	return priceInFloat;
}

function distributeFees(details, value, isPercentage = false) {
	const numUsers = Object.keys(details).length;
	
	Object.values(details).forEach(userDetail => {
		const amountToAdd = isPercentage ? userDetail.total * value / subtotal : value / numUsers;
		;
		userDetail.fees += amountToAdd;
	});
}

function getEOLPrice(line) {
	return line.split(/(\s+)/).pop();
}

function createUserItemsContainer(details, user, shouldShowInputs = false) {
	const userItemsContainer = document.createElement("div");
	userItemsContainer.className = "userItemsContainer";
	Object.keys(details[user].items).forEach(item => {
		const itemContainer = document.createElement("div");
		itemContainer.className = shouldShowInputs ? "itemContainer assignmentMode" : "itemContainer";
		const quantity = details[user].items[item].quantity;
		const quantityLabel = (quantity > 1) ? " x" + quantity : "";
		const userItem = document.createTextNode(item + quantityLabel);
		itemContainer.appendChild(userItem);
		userItemsContainer.appendChild(itemContainer);
		if (shouldShowInputs) {
			const nameInput = document.createElement("input");
			nameInput.className = "nameInput";
			itemContainer.appendChild(nameInput);
			nameInput.setAttribute("data-itemname", item);
		}
	});
	return userItemsContainer;
}

function createFormattedResults(details) {
	const allUserResultsContainer = document.createElement("div");
	allUserResultsContainer.id = "allUserResultsContainer";

	Object.keys(details).forEach(user => {
		const userResultContainer = document.createElement("div");
		userResultContainer.className = "userResultContainer";

		const userNameContainer = document.createElement("div");
		userNameContainer.className = "userNameContainer";
		const userName = document.createTextNode(user);
		userNameContainer.appendChild(userName);
		userResultContainer.appendChild(userNameContainer);

		userResultContainer.appendChild(createUserItemsContainer(details, user));

		const userTotalContainer = document.createElement("div");
		userTotalContainer.className = "userTotalContainer";
		const userTotal = document.createTextNode("$" + details[user].total.toFixed(2));
		userTotalContainer.appendChild(userTotal);
		userResultContainer.appendChild(userTotalContainer);

		allUserResultsContainer.appendChild(userResultContainer);
	});

	return allUserResultsContainer;
}

function listItemsForAssignment(details) {
	const allUserResultsContainer = document.createElement("div");
	allUserResultsContainer.id = "allUserResultsContainer";

	const userResultContainer = document.createElement("div");
	userResultContainer.className = "userResultContainer";

	const assignTextContainer = document.createElement("div");
	assignTextContainer.id = "assignTextContainer";
	const assignText = document.createTextNode("Assign items to people:");
	assignTextContainer.appendChild(assignText);
	userResultContainer.appendChild(assignTextContainer);

	userResultContainer.appendChild(createUserItemsContainer(details, "TBD", true));

	const doneButtonContainer = document.createElement("div");
	doneButtonContainer.id = "doneButtonContainer";
	const doneButton = document.createElement("button");
	doneButton.innerHTML = "Done";
	doneButton.id = "doneButton";
	doneButton.onclick = function() {
		doneAssignment(details);
	}
	doneButtonContainer.appendChild(doneButton);
	userResultContainer.appendChild(doneButtonContainer);

	allUserResultsContainer.appendChild(userResultContainer);

	return allUserResultsContainer;
}

function doneAssignment(details) {
	const manualInputDetails = {};
	const nameInputs = document.getElementsByClassName("nameInput");
	const foundEmptyInput = Object.values(nameInputs).find(input => input.value == "");

	if (foundEmptyInput) {
		alert("All items must be assigned");
		return;
	}

	Object.values(nameInputs).forEach(input => {
		const name = input.value.toUpperCase();
		const itemName = input.dataset.itemname;
		const itemPrice = details["TBD"].items[itemName].price;
		if (!manualInputDetails.hasOwnProperty(name)) {
			// new user
			manualInputDetails[name] = {items: {}, total: itemPrice, fees: 0};
			manualInputDetails[name].items[itemName] = {price: itemPrice, quantity: 1};
		} else {
			// existing user
			if (!manualInputDetails[name].items.hasOwnProperty(itemName)) {
				// new item
				manualInputDetails[name].items[itemName] = {price: itemPrice, quantity: 1};
			} else {
				// existing item
				manualInputDetails[name].items[itemName] = manualInputDetails[name].items[itemName].quantity += 1;
			}
			manualInputDetails[name].total += itemPrice * manualInputDetails[name].items[itemName].quantity;
		}
	});

	splitBill(manualInputDetails);
}

function displayErrorMessage() {
	errorMessage = document.createElement("div");
	errorMessage.className = "errorMessage";
	errorMessage.appendChild(document.createTextNode("Input is invalid."));
	const splitResults = document.getElementById("splitResults");
	splitResults.innerHTML = "";
	splitResults.appendChild(errorMessage);
}

function splitBill(manualInputDetails = null) {
	reset();
	const details = manualInputDetails || {};
	const input = document.getElementById("billInput").value.trim();
	let tax = promotion = serviceFee = discount = offer = deliveryFee = deliveryDiscount = tip = 0;
	const lines = input.split('\n');
	let currentUser;

	for (let i = 0; i < lines.length; i++) {
		if (!manualInputDetails) {
			const isInt = /^[1-9]\d*$\b/g;
			const itemLineList = lines[i].split('\t');
			const matchedInt = itemLineList.length > 0 && itemLineList[0].match(isInt);

			// found new order item
			if (matchedInt && matchedInt.length > 0) {			
				if (i == lines.length - 1) {
					console.error("invalid input");
					displayErrorMessage();
					return;
				}

				const itemLineIndex = i;
				const itemQuantity = parseInt(matchedInt[0]);

				if (itemLineIndex > 0) {
					const potentialUser = lines[itemLineIndex - 1];
					if (!(potentialUser.startsWith("$") || /^\s/.test(potentialUser))) {
						// found new user
						const user = potentialUser.trim();
						currentUser = user;
						details[currentUser] = {items: [], total: 0, fees: 0};
					}
				}

				if (!currentUser) {
					// no user, ask to assign users
					currentUser = "TBD";
					details[currentUser] = {items: {}, total: 0, fees: 0};
				}

				let itemName =  itemLineList.length > 1 && itemLineList[1];
				let itemPrice = lines[itemLineIndex + 1];
				if (!(itemPrice.startsWith("$"))) {
					console.error("invalid input");
					displayErrorMessage();
					return;
				}

				itemPrice = priceToFloat(itemPrice);

				if (itemQuantity > 1 && currentUser == "TBD") {
					// automatically split multi-quantity items for assignment mode in non-group orders
					for (let j = 0; j < itemQuantity; j++) {
						if (itemName in details[currentUser].items) {
							const itemNameCount = Object.keys(details[currentUser].items).filter(name => name.includes(itemName)).length;
							itemName = itemName + " " + (itemNameCount + 1);
						}
						details[currentUser].items[itemName] = {};
						details[currentUser].items[itemName].price = itemPrice;
						details[currentUser].items[itemName].quantity = 1;
						details[currentUser].total = details[currentUser].total + itemPrice;
					}
					continue;
				}

				if (itemName in details[currentUser].items) {
					const itemNameCount = Object.keys(details[currentUser].items).filter(name => name.includes(itemName)).length;
					itemName = itemName + " " + (itemNameCount + 1);
				}
				details[currentUser].items[itemName] = {};
				details[currentUser].items[itemName].price = itemPrice;
				details[currentUser].items[itemName].quantity = itemQuantity;
				details[currentUser].total = details[currentUser].total + itemPrice * itemQuantity;
				continue;
			}
		}

		const cleanedLine = lines[i].trim().toUpperCase().replace(/(\s+)/g, "");
		if (cleanedLine.startsWith("SUBTOTAL")) {
			subtotal = priceToFloat(getEOLPrice(lines[i]));
			const calculatedSubtotal = Object.values(details).reduce((total, userDetail) => userDetail.total + total, 0);

			if (Math.abs(subtotal - calculatedSubtotal) > 1) {
				console.error("invalid input");
				displayErrorMessage();
				return;
			}
		}

		if (cleanedLine.startsWith("TAX")) {
			tax = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(details, tax, true);
		} else if (cleanedLine.startsWith("PROMOTION")) {
			promotion = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(details, promotion);
		} else if (cleanedLine.startsWith("SERVICEFEE")) {
			serviceFee = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(details, serviceFee, true)
		} else if (cleanedLine.startsWith("DISCOUNT")) {
			discount = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(details, discount);
		} else if (cleanedLine.includes("OFFER")) {
			offer = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(details, offer);
		} else if (cleanedLine.startsWith("DELIVERYFEE")) {
			deliveryFee = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(details, deliveryFee);
		} else if (cleanedLine.startsWith("DELIVERYDISCOUNT")) {
			deliveryDiscount = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(details, deliveryDiscount);
		} else if (cleanedLine.startsWith("DELIVERYPERSONTIP") || cleanedLine.startsWith("TIP")) {
			tip = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(details, tip, true)
		} else if (cleanedLine.startsWith("TOTAL")) {
			total = priceToFloat(getEOLPrice(lines[i]));
		}
	};

	// update totals post fees
	Object.values(details).forEach(userDetail => {
		userDetail.total += userDetail.fees;
	});

	if (total == 0) {
		// input was missing total
		total = subtotal + tax + promotion + serviceFee + discount + deliveryFee + deliveryDiscount + tip; 
	}

	const calculatedTotal = Object.values(details).reduce((total, userDetail) => userDetail.total + total, 0);
	if (Math.abs(total - calculatedTotal) > 1) {
		console.error("invalid input");
		displayErrorMessage();
		return;
	}

	const splitResults = document.getElementById("splitResults");
	splitResults.innerHTML = "";
	
	const results = currentUser === "TBD" ? listItemsForAssignment(details) : createFormattedResults(details);
	splitResults.appendChild(results);

	document.getElementById("splitResultsContainer").style.visibility = "visible";
}