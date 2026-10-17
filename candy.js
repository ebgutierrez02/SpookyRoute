
let candyHouses = JSON.parse(localStorage.getItem("candyHouses")) || [];

// Bring over a house saved by the earlier version.
let oldCandyHouse = JSON.parse(localStorage.getItem("candyHouse"));

if (oldCandyHouse && !localStorage.getItem("candyHouseMigrated"))
{
    candyHouses.push(oldCandyHouse);
    localStorage.setItem("candyHouses", JSON.stringify(candyHouses));
    localStorage.setItem("candyHouseMigrated", "true");
}

function registerCandyHouse()
{
    let address = document.getElementById("candyAddress").value.trim();
    let status = document.getElementById("candyStatus").value;
    let hours = document.getElementById("candyHours").value.trim();

    if (address === "")
    {
        alert("Please enter your house address!");
        return;
    }

    let candyHouse = {
        address: address,
        givingCandy: status === "yes",
        hours: hours
    };

    candyHouses.push(candyHouse);

    localStorage.setItem("candyHouses", JSON.stringify(candyHouses));

    document.getElementById("candyMessage").textContent =
        "Your candy house information has been saved! 🎃";

    document.getElementById("candyAddress").value = "";
    document.getElementById("candyHours").value = "";

    displayCandyHouses();
}

function displayCandyHouses()
{
    let list = document.getElementById("candyHouseList");

    list.innerHTML = "";

    candyHouses.forEach(function(house)
    {
        let li = document.createElement("li");

        let status = house.givingCandy
            ? "🍬 Giving out candy"
            : "🚫 Not giving out candy";

        li.textContent = house.address + " — " + status +
            (house.hours ? " — " + house.hours : "");

        list.appendChild(li);
    });
}

displayCandyHouses();
