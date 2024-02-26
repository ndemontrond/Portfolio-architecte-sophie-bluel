const galleryContainer = document.getElementById("galleryContainer");
let data = [];
let allGalleryData = [];
async function fetchDataAndInitialize() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        data = await response.json(); // Transform the data into JSON
        getData(galleryContainer, data); // Pass data to the getData function
        allGalleryData = await getData(galleryContainer, data); // Assign the value
    } catch (error) {
        console.error("An error occurred:", error);
    }
}
fetchDataAndInitialize(); // Fetch data and initialize the gallery

async function getData(container, data) {
    try {
        const filterElements = document.querySelectorAll(".filter");

        function handleFilterButtonClick() {
            filterElements.forEach((e) => {
                e.classList.remove("selected");
            });
            const option = this.id;
            this.classList.add("selected");
            populateGallery(filterData(option));
        }

        function filterData(option) {
            return option === "all"
                ? data
                : data.filter((item) => {
                      switch (option) {
                          case "objects":
                              return item.category.id === 1;
                          case "appartments":
                              return item.category.id === 2;
                          case "hotelsRestaurants":
                              return item.category.id === 3;
                          default:
                              return false;
                      }
                  });
        }

        function populateGallery(filteredData) {
            container.innerHTML = "";
            filteredData.forEach((item) => {
                const { id, title, imageUrl } = item;
                const figure = document.createElement("figure");
                figure.innerHTML = `<img src="${imageUrl}" alt="${title}"><figcaption>${title}</figcaption>`;
                figure.classList.add("galleryCard" + id);
                figure.id = container.id + id;
                container.appendChild(figure);
            });
        }

        filterElements.forEach((item) => {
            item.addEventListener("click", handleFilterButtonClick);
        });

        const allGalleryData = filterData("all");
        populateGallery(allGalleryData);
        // Find the "all" filter button
        const allFilterButton = document.querySelector(".filter#all");
        // Trigger a click event on the "all" filter button
        allFilterButton.click();
        return { populateGallery, allGalleryData };
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
    //forceOpen is used to reload the modal without closing it or reloading the page
    const toggleModal = (forceOpen = false) => {
        const modal = document.getElementById("myModal");
        if (modal && !forceOpen) {
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
        //e.preventDefault();
        toggleModal();
    };
    const handlePreviousTriggerClick = (e) => {
        //e.preventDefault();
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
    function createModal() {
        const modalContent = `
            <div class="modalContent">
                <h2>Galerie photo</h2>
                <div id="galleryContainerModal" class="gallery"></div>
                <div class="line"></div>
                <input type="submit" id="addPhotosButton" value="Ajouter une photo"></button>
                <i class="fa-solid fa-xmark close modalTrigger"></i>
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

        const galleryContainerModal = document.getElementById(
            "galleryContainerModal"
        );

        getData(galleryContainerModal, data);

        const figures = Array.from(
            galleryContainerModal.getElementsByTagName("figure")
        );
        figures.forEach((figure) => {
            const deleteIcon = document.createElement("i");
            deleteIcon.className = "fa-solid fa-trash-can";
            figure.appendChild(deleteIcon);
            deleteIcon.addEventListener("click", function () {
                deleteWork(figure.classList[0], figure.id);
            });
        });

        const addPhotosButton = modal.querySelector("#addPhotosButton");
        addPhotosButton.addEventListener("click", () => {
            const modalAddContent = `
            <div class="modalContent" id="addContentContainer">
                <h2>Ajout photo</h2>
                <label class="imageInputContainer" for="imageInput">
                    <i class="fa-regular fa-image file-icon" id="iconElement"></i>
                    <span id="addImageButton">+ Ajouter photo</span>
                    <span id="imageInputInfo">jpg, png : 4mo max</span>
                    <input type="file" accept="image/*" id="imageInput" />
                    <img src="" id="displayImage" style="display: none;">
                </label>
                <label for="titleInput">Titre</label>
                <input type="text" id="titleInput" />
                <label for="categoryInput">Catégorie</label>
                <select id="categoryInput">
                    <option value="" disabled selected></option>
                    <option value="1">Objets</option>
                    <option value="2">Appartements</option>
                    <option value="3">Hôtels et restaurants</option>
                </select>
                <div class="line"></div>
                <input type="submit" id="addPhotosValidate" value="Valider">
                <i class="fa-solid fa-arrow-left previous previousTrigger"></i>
                <i class="fa-solid fa-xmark close modalTrigger"></i>
            </div>`;
            modal.innerHTML = modalAddContent;
            const imageInput = document.getElementById("imageInput");
            const displayImage = document.getElementById("displayImage");

            const addPhotosValidateButton =
                document.getElementById("addPhotosValidate");
            addPhotosValidateButton.addEventListener("click", () => {
                addWork(galleryContainerModal);
            });

            //Check if the form is complete. If this is the case, add a class for a visual clue
            const updateButtonColor = () => {
                if (
                    categoryInput.value.trim() !== "" &&
                    titleInput.value.trim() !== "" &&
                    imageInput.files.length > 0
                ) {
                    addPhotosValidateButton.classList.add("inputTyped");
                } else {
                    addPhotosValidateButton.classList.remove("inputTyped");
                }
            };

            imageInput.addEventListener("change", function (e) {
                const file = e.target.files[0];

                if (file) {
                    updateButtonColor();
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
                    imageInputInfo.style.display = "none";
                    addImageButton.style.display = "none";
                }
            });

            titleInput.addEventListener("input", updateButtonColor);
            categoryInput.addEventListener("input", updateButtonColor);

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
                            figcaptionElement.textContent = title;

                            figureElement.appendChild(newImage);
                            figureElement.appendChild(figcaptionElement);
                            galleryContainer.appendChild(figureElement);
                            fetchDataAndInitialize();
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
        //modal.style.display = "block";
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
            figure.remove();

            fetchDataAndInitialize().then(() => {
                toggleModal(true);
            });
        } catch (error) {
            console.error("Error deleting work:", error);
        }
    }
}
