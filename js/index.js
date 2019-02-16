let valueSelectionContainer = document.querySelector('.value-selection');
let valueControls = document.querySelector(".value-control-container");
let particleParent = document.querySelector(".particle-parent");
let generateButton = document.getElementById("generate-button");
let nameOutput = document.querySelector('.name-output');
let outputTray = document.querySelector('.output-tray');
let leftScroll = document.querySelector('.value-selection-parent .left');
let rightScroll = document.querySelector('.value-selection-parent .right');




let valueList;
let nameList;
let selectedValues = {};


//scroll controls


leftScroll.addEventListener('click', ()=> {
    let scrollOptions = {
        left: valueSelectionContainer.scrollLeft - 300,
        top: 0,
        behavior: 'smooth'
    };
   valueSelectionContainer.scrollTo(scrollOptions);
});

rightScroll.addEventListener('click', ()=> {
    let scrollOptions = {
        left: valueSelectionContainer.scrollLeft + 300,
        top: 0,
        behavior: 'smooth'
    };
    valueSelectionContainer.scrollTo(scrollOptions);
});


//gets the names and the values from their JSON files.
// There's almost certainly a better way to do this! 😅
fetchJSON = () => {

    let fetchValues = () => {
        return new Promise(resolve => {
            fetch("https://jclahoot.github.io/design-system-name-generator/data/values.json",{
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
            fetch("https://jclahoot.github.io/design-system-name-generator/data/names.json",{
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


    let particle = document.createElement('span');
    particle.classList.add('fas',`fa-${valueList[value].icon}`);

    let interval;

    interval = setInterval(()=> {
        particleEffect(particle, particleParent, 2, 50);
    }, 750);


    let onInput = (event) => {
        selectedValues[value] = Number(event.target.value);

        clearInterval(interval);
        interval = setInterval(()=> {
            particleEffect(particle, particleParent, Math.round(event.target.value), 50);
        }, 750);
    };
    slider.addEventListener("input", onInput);




    // deletes the value from the machine
    let deleteValue = () => {
        delete selectedValues[value];
        container.remove();
        clearInterval(interval);

        if (Object.keys(selectedValues).length === 0) {
            generateButton.classList.add('disabled')
        }
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
    console.log(event);
    //prevents creating the same value multiple times
    if(!selectedValues[value]) {
        selectedValues[value] = 2;
        createValueSlider(value);
    }


    generateButton.classList.remove('disabled')

};


// Scroll helpers for the values list. Shows + hides the scroll buttons based on position of scroll
const calculateScroll = () => {
    let scrollPos = valueSelectionContainer.scrollLeft;
    let maxWidth = valueSelectionContainer.scrollWidth - valueSelectionContainer.clientWidth;

    if(scrollPos > 10) {
        leftScroll.style.visibility = 'visible';
    }
    else {
        leftScroll.style.visibility = 'hidden';
    }

    if (maxWidth - scrollPos < 10) {
        rightScroll.style.visibility = 'hidden';
    }
    else {
        rightScroll.style.visibility = 'visible';
    }

};



// lists all of the values in an array
const generateValues = () => {
    return new Promise(resolve => {
        for (let value in valueList) {
            let button = document.createElement('button');
            let text = document.createElement('p');
            //apparently, we need to assign a value to EVERYTHING 🙄
            text.value = value;
            text.innerHTML = valueList[value].name;

            let icon = document.createElement('span');
            icon.value = value;
            icon.classList.add('fas',`fa-${valueList[value].icon}`, );
            button.appendChild(icon);

            button.appendChild(text);
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

            valueSelectionContainer.appendChild(button);

            resolve()
        }
        valueSelectionContainer.addEventListener('scroll', calculateScroll);



    });

};


// generates a list of names based on the values chosen
const generateNames = () => {

    generateButton.classList.add('disabled');
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


    let bestName = nameScore[0][0];


    let outputFrame = document.querySelector('.output-frame');
    outputFrame.classList.add('open');

    // removes old results
    Array.from(document.querySelectorAll('.result')).forEach((result) => {
        if(result) {
            // opens the goddamn (trap)door, no...
            outputTray.classList.add('open');
            result.style.transform = 'scale(0.05)';
            result.style.top = '7.5em';
            setTimeout(() => {
                outputTray.classList.remove('open');
                result.remove();
            }, 1000)
        }
    });

    // puts names into the DOM
    let result = document.createElement('h5');
    result.classList.add('result');
    result.innerHTML = bestName;
    result.style.opacity = '0';


    nameOutput.appendChild(result);

    setTimeout(() => {
        result.style.opacity = '1';
        result.style.transition = 'all 1.55s linear';
        setTimeout(() => {
            result.style.top = '3.5em';
            result.style.transform = 'scale(1.25)';


            setTimeout(() => {
                result.style.transition = 'all 0.75s cubic-bezier(0.55, 0.085, 0.68, 0.53)';
                result.style.top = '7em';
                result.style.transform = 'scale(1.45)';
                result.style.color = '#FF9800';

                // closes the goddamn (oven) door
                // No, it's much better to face these kinds of things
                // with a sense of poise and rationality 🎩
                outputFrame.classList.remove('open');
                generateButton.classList.remove('disabled')

            }, 1600)
        }, 500);
    }, 350);



    generateButton.classList.add('activated');
    setTimeout(() => {
        generateButton.classList.remove('activated');
    }, 850)

};


generateButton.addEventListener("click", generateNames);



//✨ANIMATION_HELPERS
// creates new particles and puts them in the specified parent
let createParticles = (element, parent, quantity) => {
    element.classList.add('particle', 'new');

    for (let i = 0; i < quantity; i++) {
        let newElement = element.cloneNode(true);
        parent.appendChild(newElement);
    }

    // waits 10 millis for element to properly render.
    //TODO replace timeout with the actual event that detects the element's render state
    return new Promise((resolve) => {
        setTimeout( () => {
            resolve();
        }, 20);
    })
};

//✨ANIMATION_HELPERS
// takes the particles in a parent and disperses them
let disperseParticles = (parent, area) => {

    return new Promise(resolve => {

        parent.querySelectorAll('.particle.new').forEach((particle) => {
            let topModifier = Math.floor(Math.random()*area);
            let leftModifier = Math.floor(Math.random()*area);
            let leftPositive = Math.round(Math.random()) === 1;
            let rotatePositive = Math.round(Math.random()) === 1;
            let topVal = -topModifier * 6 - 100;
            let leftVal = leftPositive ? 40 + leftModifier : -leftModifier + 40;
            let rotation =  Math.round(Math.random() * 90) * (rotatePositive ? 1 : -1 );

            particle.addEventListener('transitionend', (event) => {
                event.target.remove();
                //resolves the promise once the transition ends
                resolve();
            });

            particle.style.opacity = '0';
            particle.style.top = `${topVal}%`;
            particle.style.left = `${leftVal}%`;
            particle.style.transform = `rotate(${rotation}deg`;

            particle.classList.remove('new');
        });

    });


};

//✨ANIMATION_HELPERS
// returns a Promise
 let particleEffect = (element, parent, quantity, area) => {

    return new Promise(resolve => {
        createParticles(element,parent,quantity)
            .then(()=> {
                disperseParticles(parent, area)
                    .then(()=> {
                        resolve();
                        //    particle render is complete
                    });
            })
    });

};


 let renderPipes = () => {
     return new Promise(resolve => {
         let pipes = Array.from(document.querySelectorAll('.pipe'));

         let bolt = document.createElement('div');
         bolt.classList.add('bolt');

         let joint = document.createElement('div');
         joint.classList.add('pipe-joint');
         joint.appendChild(bolt.cloneNode(true));
         joint.appendChild(bolt.cloneNode(true));

         pipes.forEach((pipe) => {
             let quantity = Math.ceil(Math.random() * 3)

             for (let i = 0; i < quantity; i++) {
                 pipe.appendChild(joint.cloneNode(true));
             }

         });
         resolve();
     })
 };




// Lifecycle event that runs after all the content is loaded to the DOM
document.addEventListener('DOMContentLoaded', (event) => {
    fetchJSON()
        .then(generateValues)
        .then(() => {
            renderPipes();
            let particle = document.createElement('span');
            particle.classList.add('fas','fa-circle');

            setInterval(()=> {
                particleEffect(particle, particleParent, 1, 50);
            }, 750);
            console.log("done");
        });

});

