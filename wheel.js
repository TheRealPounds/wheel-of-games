//Loading previous wheel data from local storage
const wheelDataJSON = localStorage.getItem('wheelData');
let wheelData;
if (wheelDataJSON) {
    wheelData = JSON.parse(wheelDataJSON);
} else {
    //Generating new example data if previous data doesn't exist
    wheelData = {
        "url": "https://www.youtube.com/watch?v=h65b74Pn128",
        "duration": 13,
        "showNames": true,
        "items": ['minceraft', 'shovel justice', 'obbububoo basisi', 'the first strand type game', 'shenmue shitmue', 'blame canada', 'donkey kong december', 'FISH', 'maple', 'KRIS!']
    }
}
console.log(wheelData);
generateWheel(wheelData);
generateChoices(wheelData);

//Loading info into inputs from data
const urlInput = document.getElementById("url-input");
const durationInput = document.getElementById("duration-input");
const showNamesInput = document.getElementById("show-names-input");
urlInput.value = wheelData.url;
durationInput.value = wheelData.duration;
showNamesInput.checked = wheelData.showNames;

//Removing all items with matching data to picked one on press of remove all button and updating items data
document.getElementById("remove-all").addEventListener("click", () => {
    wheelData.items = wheelData.items.filter(item => item !== document.getElementById("picked").innerText);
    document.getElementById("pick-container").classList.add("hide");
    saveData(wheelData);
    generateChoices(wheelData);
    generateWheel(wheelData);
});

//Updating url data from url input
urlInput.addEventListener("input", () => {
    wheelData.url = urlInput.value;
});

//Updating duration data from duration input
durationInput.addEventListener("input", () => {
    wheelData.duration = durationInput.value;
});

//Clearing items and updating items data
document.getElementById("clear").addEventListener("click", () => {
    wheelData.items = [];
    generateChoices(wheelData);
});

//Adding items from clipboard and updating items data
document.getElementById("paste").addEventListener("click", async () => {
    const clipboardCotent = await navigator.clipboard.readText();
    const newItems = clipboardCotent.replaceAll("\r","").split("\n");
    wheelData.items = wheelData.items.concat(newItems);
    generateChoices(wheelData);
});

//Shuffling item list and updating items data
document.getElementById("shuffle").addEventListener("click", () => {
    for (let i = wheelData.items.length - 1; i > 0; i--) { 
        
        // Generate random index 
        const j = Math.floor(Math.random() * (i + 1));
                    
        // Swap elements at indices i and j
        const temp = wheelData.items[i];
        wheelData.items[i] = wheelData.items[j];
        wheelData.items[j] = temp;
    }
    generateChoices(wheelData);
});

//Copying item list to clipboard
document.getElementById("export").addEventListener("click", () => {
    let exportString = ("https://therealpounds.github.io/wheel-of-games/\n\n" + wheelData.items.join('\n')).trim();
    navigator.clipboard.writeText(exportString);
});

//Updating show names data from checkbox
showNamesInput.addEventListener("change", () => {
    wheelData.showNames = showNamesInput.checked;
});

//Saving data to local storage
function saveData(wheelData) {
    localStorage.setItem("wheelData", JSON.stringify(wheelData));
}

//Music
let player;
const loadingElm = document.getElementById("loading");
function onYouTubeIframeAPIReady() {}
function playYouTubeAudio(url) {
    // ✅ If URL is empty, skip and resolve immediately
    if (!url || url.trim() === "") {
        console.log("No YouTube URL provided. Skipping audio.");
        return Promise.resolve();
    }

    loadingElm.classList.remove("hide");
    return new Promise((resolve) => {
        const videoId = new URL(url).searchParams.get("v");

        // If player already exists, destroy it first
        if (player) {
            player.destroy();
        }

        // Create a new YouTube player
        player = new YT.Player('yt-container', {
            height: '0',
            width: '0',
            videoId: videoId,
            playerVars: {
                autoplay: 1,
                controls: 0,
                modestbranding: 1,
            },
            events: {
                onReady: (event) => {
                    console.log('YouTube player is ready.');
                    event.target.playVideo();
                    // ✅ Set initial volume from slider
                    const volumeSlider = document.getElementById("volumeSlider");
                    const initialVolume = parseInt(volumeSlider.value, 10);
                    updateVolume(initialVolume);
                },
                onStateChange: (event) => {
                    // This only triggers once when video starts playing
                    if (event.data === YT.PlayerState.PLAYING) {
                        console.log('YouTube audio started.');
                        loadingElm.classList.add("hide");
                        resolve(); // ✅ This now works
                    }
                }
            }
        });
    });
}

function updateVolume(val) {
    if (player && typeof player.setVolume === "function") {
        player.setVolume(val);
    }
}

//Generating wheel choices
function generateChoices(wheelData) {
    const choicesDiv = document.getElementById("choices");
    let choicesHTML = "";
    let index = 0;
    wheelData.items.forEach((item) => {
        choicesHTML += `
            <div class="choice" id="choice-${index}">
                <input class="choice-input" data-index="${index}" value="${item}">
                <button class="button remove" data-index="${index}">X</button>
            </div>
        `;
        index++;
    })
    choicesHTML += `
        <button class="button add" id="add">+</button>
        <button class="button generate" id="generate">GENERATE!</button>
    `;
    choicesDiv.innerHTML = choicesHTML;

    //Creating new empty choice and updating items data
    document.getElementById("add").addEventListener("click", () => {
        wheelData.items.push("");
        generateChoices(wheelData);
    });

    //Removing choice on button press and updating items data
    document.querySelectorAll(".remove").forEach((button) => {
        button.addEventListener("click", () => {
            const {index} = button.dataset;
            wheelData.items.splice(index, 1);
            generateChoices(wheelData);
        });
    });

    //Updating item data on input change
    document.querySelectorAll(".choice-input").forEach((choice) => {
        const {index} = choice.dataset;
        choice.addEventListener("input", () => {
            wheelData.items[index] = choice.value;
        });
    });

    //Generating new wheel by saving data and refreshing page
    document.getElementById("generate").addEventListener("click", () => {
        saveData(wheelData);
        location.href = location.pathname;
    });
}

function generateWheel(wheelData) {
    const svg = document.getElementById("circle");
    const numSlices = wheelData.items.length;
    const cx = 150, cy = 150, r = 150;
    const textRadius = 140;
    const tickSound = new Audio("papyrus.mp3");
    const pickSound = new Audio("wawa.mp3");
    const picked = document.getElementById('picked');
    const pickContainer = document.getElementById('pick-container');

    function polarToCartesian(cx, cy, r, angleDeg) {
        const angleRad = (angleDeg - 90) * Math.PI / 180;
        return {
            x: cx + r * Math.cos(angleRad),
            y: cy + r * Math.sin(angleRad),
        };
    }

    svg.innerHTML = "";
    const wheelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(wheelGroup);

    for (let i = 0; i < numSlices; i++) {
        const startAngle = (i * 360) / numSlices;
        const endAngle = ((i + 1) * 360) / numSlices;
        const midAngle = (startAngle + endAngle) / 2;

        const start = polarToCartesian(cx, cy, r, startAngle);
        const end = polarToCartesian(cx, cy, r, endAngle);
        const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const d = `
    M ${cx} ${cy}
    L ${start.x} ${start.y}
    A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}
    Z
  `;
        path.setAttribute("d", d);

        var color;
        if (i % 2 == 0) {
            color = "#FFF";
        } else {
            switch (i % 6) {
                case 1:
                    color = "#FF2222"
                    break;

                case 3:
                    color = "#FF0"
                    break;

                case 5:
                    color = "#3333FF"
                    break;
            }
        }
        path.setAttribute("fill", color);
        wheelGroup.appendChild(path);

        if (wheelData.showNames) {
            const sliceAngle = 360 / numSlices;
            const midAngle = (startAngle + endAngle) / 2;
            const labelPos = polarToCartesian(cx, cy, textRadius, midAngle);

            const arcLength = 2 * Math.PI * textRadius * (sliceAngle / 360);
            const maxFontSize = 14;
            let fontSize = maxFontSize;

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 0);
            text.setAttribute("y", 0);
            text.setAttribute("fill", "black");
            text.setAttribute("text-anchor", "start");
            text.setAttribute("alignment-baseline", "middle");
            text.setAttribute("font-size", fontSize);
            text.textContent = wheelData.items[i];

            const rotation = midAngle + 90;
            const transform = `translate(${labelPos.x},${labelPos.y}) rotate(${rotation})`;
            text.setAttribute("transform", transform);

            // Temporarily append to DOM to measure length
            svg.appendChild(text);
            while (text.getComputedTextLength() > arcLength && fontSize > 6) {
                fontSize -= 1;
                text.setAttribute("font-size", fontSize);
            }

            wheelGroup.appendChild(text);
        }


        const centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        centerCircle.setAttribute("cx", cx);
        centerCircle.setAttribute("cy", cy);
        centerCircle.setAttribute("r", 15);
        centerCircle.setAttribute("fill", "black");
        wheelGroup.appendChild(centerCircle);
    }

    const triangleSize = 10; // size of the triangle base/height

    // Calculate points of an isosceles triangle pointing right, centered vertically at cy
    const points = [
        `${cx - r} ${cy - triangleSize / 2}`,      // top-left (base)
        `${cx - r} ${cy + triangleSize / 2}`,      // bottom-left (base)
        `${cx - r + triangleSize} ${cy}`            // tip (pointing right)
    ].join(" ");

    const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    triangle.setAttribute("points", points);
    triangle.setAttribute("fill", "black");

    svg.appendChild(triangle);

    const spinDuration = wheelData.duration; // seconds
    let isSpinning = false;
    let totalRotation = 0; // to track cumulative rotation

    // Easing function: easeOutQuart
    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    async function spinWheel() {
        if (isSpinning) return;
        isSpinning = true;

        await playYouTubeAudio(wheelData.url);

        let lastSliceIndex = null;
        let totalRotation = 0;
        const spins = spinDuration + Math.random() * Math.sqrt(spinDuration);
        const finalAngle = 18 * spins;
        const start = performance.now();

        const tickClone = () => {
            const t = tickSound.cloneNode();
            t.volume = 0.15;
            t.play();
        };

        // 🔊 High-speed ticking interval
        let fastTickIntervalId = null;
        const startFastTicks = () => {
            if (!fastTickIntervalId) {
                fastTickIntervalId = setInterval(() => {
                    tickClone();
                }, 120); // fixed tick rate during fast spin
            }
        };
        const stopFastTicks = () => {
            clearInterval(fastTickIntervalId);
            fastTickIntervalId = null;
        };

        function animate(time) {
            const elapsed = (time - start) / 1000;
            const t = Math.min(elapsed / spinDuration, 1);
            const easedT = easeOutQuart(t);

            const currentAngle = easedT * finalAngle;
            const displayAngle = totalRotation + currentAngle;
            wheelGroup.setAttribute("transform", `rotate(${displayAngle} ${cx} ${cy})`);

            const triangleAngle = 270;
            const normalized = (triangleAngle - displayAngle + 360) % 360;
            const sliceAngle = 360 / numSlices;
            const currentSliceIndex = Math.floor(normalized / sliceAngle);

            if (t < 0.0) {
                // 🎧 fast mode
                startFastTicks();
            } else {
                // 🎯 accurate ticks as it slows
                stopFastTicks();

                if (currentSliceIndex !== lastSliceIndex) {
                    tickClone();
                    lastSliceIndex = currentSliceIndex;
                }
            }

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                totalRotation = (totalRotation + finalAngle) % 360;
                isSpinning = false;
                stopFastTicks();

                const normalized = (triangleAngle - totalRotation + 360) % 360;
                const sliceIndex = Math.floor(normalized / sliceAngle);

                console.log(`Landed on slice: ${wheelData.items[sliceIndex]}`);
                pickSound.play();
                picked.innerHTML = wheelData.items[sliceIndex];
                pickContainer.classList.remove("hide");
                setTimeout(() => {
                    pickContainer.classList.add("hide");
                }, 5000);
            }
        }

        requestAnimationFrame(animate);
    }

    svg.addEventListener("click", spinWheel);
}

