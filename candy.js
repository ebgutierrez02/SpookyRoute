
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

    localStorage.setItem("candyHouse", JSON.stringify(candyHouse));

    document.getElementById("candyMessage").textContent =
        "Your candy house information has been saved! 🎃";
}
