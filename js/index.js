
let valueSelectionContainer = document.querySelector('.value-selection');
let valueControls = document.querySelector(".value-control-container");
let generateButton = document.getElementById("generate-button");
let nameOutput = document.querySelector('.name-output');
//

let valueList;
let nameList;
let selectedValues = {};

//gets the names and the values from their JSON files.
// There's almost certainly a better way to do this! 😅
fetchJSON = () => {

    let fetchValues = () => {
        return new Promise(resolve => {
            fetch("../data/values.json",{
                method: "get"
            }).then(function (response) {
                if(response.status !== 200) {
                    console.log("something awful happened");
                } else {
                    return response.json();
                }
            }).then(function (response){
                valueList = response.values;
                resolve();
            }).catch(function (error){
                console.log("EPIC FAILLLLLL!!! THIS HAPPENED: " + error);
            })
        })


    };

    let fetchNames = () => {
        return new Promise(resolve => {
            fetch("../data/names.json",{
                method: "get"
            }).then(function (response) {
                if(response.status !== 200) {
                    console.log("something awful happened");
                } else {
                    return response.json();
                }
            }).then(function (response){
                nameList = response.names;
                resolve();
            }).catch(function (error){
                console.log("EPIC FAILLLLLL!!! THIS HAPPENED: " + error);
            })
        });


    };

    return Promise.all([fetchValues(), fetchNames()])
};


//Creates a value slider, which allows you to control how important a value is for the naming.
// Also creates labels, and allows you to erase a value.
const createValueSlider = (value) => {
    let container = document.createElement('div');
    container.classList.add('value-control');

    let tooltip = document.createElement('span');
    tooltip.innerHTML = valueList[value].name;
    tooltip.classList.add('tooltip');

    let icon = document.createElement('span');
    icon.classList.add('fas',`fa-${valueList[value].icon}`, 'value-icon');
    icon.appendChild(tooltip);


    let slider = document.createElement('input');
    slider.type = 'range';
    slider.max = '5';
    slider.min = '1';
    slider.value = '2';
    slider.step = '0.05';


    let onInput = (event) => {
        selectedValues[value] = Number(event.target.value);
        console.log(selectedValues);
    };
    slider.addEventListener("input", onInput);

    // deletes the value from the machine
    let deleteValue = () => {
        delete selectedValues[value];
        container.remove();
    };

    let x = document.createElement("span");
    x.classList.add('fas','fa-times', 'delete');
    x.addEventListener("click", deleteValue);

    // container.appendChild(label);
    container.appendChild(icon);
    container.appendChild(slider);
    container.appendChild(x);
    valueControls.append(container);

};

const addValueToList = (event) => {
    let value = event.target.value;
    //prevents creating the same value multiple times
    if(!selectedValues[value]) {
        selectedValues[value] = 2;
        createValueSlider(value);
    }

};


// lists all of the values in an array
const generateValues = () => {
    for (let value in valueList) {
        let button = document.createElement('button');
        button.innerHTML = valueList[value].name;
        button.value = value;
        button.addEventListener("click", addValueToList);

        let bolt1 = document.createElement('div');
        bolt1.classList.add('bolt', 'top-left');
        let bolt2 = document.createElement('div');
        bolt2.classList.add('bolt', 'top-right');
        let bolt3 = document.createElement('div');
        bolt3.classList.add('bolt', 'bottom-right');
        let bolt4 = document.createElement('div');
        bolt4.classList.add('bolt', 'bottom-left');
        button.appendChild(bolt1);
        button.appendChild(bolt2);
        button.appendChild(bolt3);
        button.appendChild(bolt4);

        valueSelectionContainer.appendChild(button)
    }
};


// generates a list of names based on the values chosen
const generateNames = () => {
    let nameScore = [];

    // loops through all names
    for(let name in nameList) {
        //adds each name to the score
        let entry = [name, 0];

        // loops through each value for a given name
        for(let value in nameList[name].values) {

            // Each name has a score associated to each of its values.
            // This score is multiplied by the selected values (where applicable)
            // then added together to make the score.
            if(selectedValues[value]) {
                entry[1] += (nameList[name].values[value] * selectedValues[value]);
            }
        }

        nameScore.push(entry);
    }


    nameScore.sort((a,b) => {
        return b[1] - a[1];
    });

    let bestScores = nameScore.slice(0,5);
    let bestNames = bestScores.map((name) => {
       return (name[0]);
    });

    let results = document.createElement('h3');
    results.innerHTML = bestNames.join(', ');
    nameOutput.childNodes.forEach((node) => {
        node.remove();
    });
    nameOutput.appendChild(results);


    generateButton.classList.add('activated');
    setTimeout(() => {
        generateButton.classList.remove('activated');
    }, 1200)

};




generateButton.addEventListener("click", generateNames);





// Lifecycle event that runs after all the content is loaded to the DOM
document.addEventListener('DOMContentLoaded', (event) => {
    fetchJSON().then(() => {
        generateValues();
        console.log('done')
    });

});

