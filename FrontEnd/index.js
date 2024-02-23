const galleryContainer = document.getElementById("galleryContainer");
let data = [];
async function fetchDataAndInitialize() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        data = await response.json(); // Transform the data into JSON
        getData(galleryContainer, data); // Pass data to the getData function
    } catch (error) {
        console.error("An error occurred:", error);
    }
}
fetchDataAndInitialize(); // Fetch data and initialize the gallery

async function getData(container, data) {
    try {
        const filterElements = document.querySelectorAll(".filter"); // Get all the filter buttons
        function handleFilterButtonClick() {
            filterElements.forEach((e) => {
                e.classList.remove("selected");
            });
            const option = this.id; // Get the selected option from the button id
            this.classList.add("selected");
            handleFilterClick(option, this); // Pass the clicked element to the event handler function
        }
        // Add event listeners to each filter button
        filterElements.forEach((item) => {
            item.addEventListener("click", handleFilterButtonClick);
        });
        function handleFilterClick(option) {
            // If the option is "all", return all the data else, filter it
            const filteredData =
                option === "all"
                    ? data
                    : data.filter((item) => {
                          if (option === "objects") {
                              return item.category.id === 1;
                          } else if (option === "appartments") {
                              return item.category.id === 2;
                          } else if (option === "hotelsRestaurants") {
                              return item.category.id === 3;
                          }
                      });
            container.innerHTML = ""; // Clear previous content
            // Add filtered data to the container
            filteredData.forEach((item) => {
                const { id, title, imageUrl } = item;
                const figure = document.createElement("figure");
                figure.innerHTML =
                    '<img src="' +
                    imageUrl +
                    '" alt="' +
                    title +
                    '">' +
                    "<figcaption>" +
                    title +
                    "</figcaption>";
                figure.classList.add("galleryCard" + id);
                container.appendChild(figure);
            });
        }
        handleFilterButtonClick.call(filterElements[0]); // Call the event handler function for the first filter button
        return;
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

// Functionality once logged in //

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");
if (userId && token) {
    // editioMode part //
    const editionMode = document.createElement("div");
    editionMode.id = "editionMode";
    editionMode.classList.add("modalTrigger");
    editionMode.innerHTML =
        '<p><i class="fa-regular fa-pen-to-square"></i> Mode édition</p>';
    projects.innerHTML +=
        '&nbsp;<span id="editProject" class="modalTrigger"><i class="fa-regular fa-pen-to-square";"></i> modifier</span>';
    document.body.insertBefore(editionMode, document.body.firstChild);
    var headerElement = document.querySelector("header");
    headerElement.classList.add("modalSpace");

    //modal part //
    let myModalListener;
    function addGlobalEventListener(type, selector, callback) {
        const listener = (e) => {
            if (e.target.matches(selector)) callback(e);
        };
        document.addEventListener(type, listener);
        // Return the listener function to store it for removal
        return listener;
    }

    const toggleModal = () => {
        const modal = document.getElementById("myModal");
        if (modal) {
            closeModal();
        } else {
            const images = Array.from(
                document.querySelectorAll("figure img"),
                (img) => ({
                    src: img.src,
                    alt: img.alt,
                    id: img.id,
                })
            );
            createModal(images);
        }
    };
    const handleModalTriggerClick = (e) => {
        e.preventDefault();
        toggleModal();
    };
    const handlePreviousTriggerClick = (e) => {
        e.preventDefault();
        closeModal();
        toggleModal();
    };
    const closeModal = () => {
        const modal = document.getElementById("myModal");
        if (modal) {
            modal.remove();
        }
        if (myModalListener) {
            document.removeEventListener("click", myModalListener);
        }
    };
    addGlobalEventListener(
        "click",
        ".modalTrigger, .modalTrigger *",
        handleModalTriggerClick
    );
    addGlobalEventListener(
        "click",
        ".previousTrigger",
        handlePreviousTriggerClick
    );

    function createModal(images) {
        const modalContent = `
            <div class="modalContent">
                <h2>Galerie photo</h2>
                <div id="galleryContainerModal" class="gallery"></div>
                <div class="line"></div>
                <button id="addPhotosButton">Ajouter une image</button>
                <span class="close modalTrigger">&times;</span>
            </div>`;
        let modal = document.getElementById("myModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "myModal";
            modal.innerHTML = modalContent;
            document.body.appendChild(modal);
        }
        myModalListener = addGlobalEventListener("click", "#myModal", (e) => {
            // Checking if the clicked element is the modal itself, not any of its children
            if (e.target.id === "myModal") {
                closeModal();
            }
        });

        const galleryContainerModal = modal.querySelector(
            "#galleryContainerModal"
        );

        // Call getData and populate the container inside its then block
        getData(galleryContainerModal, data)
            .then((result) => {
                console.log("Data fetched and processed:", result);
                images.forEach((image) => {
                    console.log(image.id);
                    console.log(image);
                });

                createImageContainer();
            })
            .catch((error) => {
                console.error("An error occurred:", error);
            });

        const addPhotosButton = modal.querySelector("#addPhotosButton");
        addPhotosButton.addEventListener("click", () => {
            const modalAddContent = `
            <div class="modalContent" id="addContentContainer">
                <h2>Ajout photo</h2>
                <label class="imageInputContainer">
                    <i class="fa-regular fa-image file-icon" id="iconElement"></i>
                    <input type="file" id="imageInput" accept="image/*" />
                    <img src="" id="displayImage" style="display: none;">
                </label>
                <label for="titleInput">Titre</label>
                <input type="text" id="titleInput" />
                <label for="categoryInput">Catégorie</label>
                <input type="number" id="categoryInput" />
                <input type="submit" id="addPhotosValidate" value="Valider">
                <span class="previous previousTrigger">&laquo;</span>
                <span class="close modalTrigger">&times;</span>
            </div>`;
            modal.innerHTML = modalAddContent;
            const imageInput = document.getElementById("imageInput");
            const displayImage = document.getElementById("displayImage");

            const addPhotosValidateButton =
                document.getElementById("addPhotosValidate");
            addPhotosValidateButton.addEventListener("click", addWork);

            imageInput.addEventListener("change", function (e) {
                const file = e.target.files[0];

                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        displayImage.src = e.target.result;
                        displayImage.style.display = "inline-block";
                    };
                    reader.readAsDataURL(file);
                    const iconElement = document.querySelector(
                        ".fa-regular.fa-image.file-icon"
                    );
                    iconElement.style.display = "none";
                    imageInput.style.display = "none";
                    displayImage.style.maxWidth = "100%";
                    displayImage.style.maxHeight = "100%";
                    displayImage.style.width = "auto";
                    displayImage.style.height = "auto";
                    displayImage.style.objectFit = "contain";
                    displayImage.parentElement.style.textAlign = "center";
                }
            });
            function addWork() {
                const dataToAdd = new FormData();
                const titleInput = document.getElementById("titleInput");
                const categoryInput = document.getElementById("categoryInput");

                if (!imageInput.files[0]) {
                    console.error("Pas d'image sélectionnée.");
                    return;
                } else if (!categoryInput.value) {
                    console.error("Veuillez choisir une catégorie.");
                    return;
                } else if (!titleInput.value) {
                    console.error("Veuillez choisir un titre.");
                    return;
                }

                dataToAdd.append("image", imageInput.files[0]);
                dataToAdd.append("title", titleInput.value);
                dataToAdd.append("category", parseInt(categoryInput.value));

                fetch(`http://localhost:5678/api/works`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: dataToAdd,
                })
                    .then((response) => {
                        console.log("Raw response body:", response);
                        return response.json();
                    })
                    .then((response) => {
                        if (response.imageUrl) {
                            const imageUrl = response.imageUrl;
                            const title = response.title;
                            const newImage = document.createElement("img");
                            newImage.src = imageUrl;
                            newImage.alt = title;

                            const figureElement =
                                document.createElement("figure");
                            const id = response.id;
                            figureElement.classList.add("galleryCard" + id);

                            const figcaptionElement =
                                document.createElement("figcaption");
                            figcaptionElement.textContent = title; // Set the text/content of the figcaption

                            figureElement.appendChild(newImage);
                            figureElement.appendChild(figcaptionElement);
                            galleryContainer.appendChild(figureElement);

                            console.log(`${titleInput.value} added`);
                        } else {
                            console.error(
                                "Response does not contain imageUrl:",
                                response
                            );
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
            }
        });
        modal.style.display = "block";
    }
    function createImageContainer() {
        const galleryContainerModal = document.getElementById(
            "galleryContainerModal"
        );
        if (galleryContainerModal) {
            const figures = Array.from(
                galleryContainerModal.getElementsByTagName("figure")
            );
            figures.forEach((figure) => {
                const deleteIcon = document.createElement("i");
                deleteIcon.className = "fa-solid fa-trash-can";
                figure.appendChild(deleteIcon);
                deleteIcon.addEventListener("click", function () {
                    deleteWork(figure.classList[0]);
                });
            });
        }
    }
    async function deleteWork(className) {
        try {
            const classNumber = className.replace("galleryCard", ""); // Extracting the numeral part from the class name
            const response = await fetch(
                `http://localhost:5678/api/works/${classNumber}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete work");
            }
            let figure = document.querySelector(`.${className}`);
            while (figure) {
                figure.remove();
                figure = document.querySelector(`.${className}`);
            }
        } catch (error) {
            console.error("Error deleting work:", error);
        }
    }
}
