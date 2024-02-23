const galleryContainer = document.getElementById("galleryContainer");
async function getData(container) {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        const data = await response.json(); // Transform the data into JSON
        const filterElements = document.querySelectorAll(".filter"); // Get all the filter buttons
        function handleFilterButtonClick() {
            filterElements.forEach((element) => {
                element.classList.remove("selected");
            });
            const option = this.id; // Get the selected option from the button id
            this.classList.add("selected");
            handleFilterClick(option, this); // Pass the clicked element to the event handler function
        }

        // Add event listeners to each filter button
        filterElements.forEach((item) => {
            item.addEventListener("click", handleFilterButtonClick);
        });

        function handleFilterClick(option, clickedElement) {
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
                          return false;
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
getData(galleryContainer);

if (window.location.href.endsWith("login.html")) {
    document.getElementById("loginForm").addEventListener("submit", login);
}
async function login(event) {
    event.preventDefault(); // No reloading of the page because of the form submission
    // Get the user's email and password from form input fields.
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    // Create a request body object with email and password.
    const requestBody = { email, password };
    try {
        // Send a POST request to the server for user authentication.
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(
                    "Le mot de passe fourni ne correspond pas à l'utilisateur."
                );
            } else if (response.status === 404) {
                throw new Error("L'email entré ne correspond à aucun compte.");
            } else {
                throw new Error(
                    "Une erreur est survenue lors du traitement de votre demande."
                );
            }
        }
        // Parse the response JSON and store the user's token and ID in localStorage.
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        window.location.href = "index.html"; // Redirect the user to the "index.html" page upon successful login.
    } catch (error) {
        console.error("Login failed:", error.message);
        displayErrorMessage(error.message);
    }
}
function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById("error-message");
    errorMessageElement.textContent = message;
    errorMessageElement.style.color = "red";
    errorMessageElement.style.textAlign = "center";
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

    function toggleModal() {
        let modal = document.getElementById("myModal");
        console.log(typeof modal);
        if (modal !== null && modal !== undefined) {
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
    }

    addGlobalEventListener("click", ".modalTrigger, .modalTrigger *", (e) => {
        e.preventDefault();
        toggleModal(); // Call the function to toggle modal when clicking on modalTrigger or children
    });

    addGlobalEventListener("click", ".previousTrigger", (e) => {
        e.preventDefault();
        console.log("previous");
        closeModal();
        toggleModal();
    });

    function closeModal() {
        const modal = document.getElementById("myModal");
        if (modal) {
            modal.remove();
        }
        if (myModalListener) {
            document.removeEventListener("click", myModalListener);
        }
    }

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
            if (e.target.id === "myModal") {
                closeModal();
            }
        });

        const galleryContainerModal = modal.querySelector(
            "#galleryContainerModal"
        );

        // Call getData and populate the container inside its then block
        getData(galleryContainerModal)
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

            imageInput.addEventListener("change", function (event) {
                const file = event.target.files[0];

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
    function deleteWork(className) {
        const classNumber = className.replace("galleryCard", ""); // Extracting the numeral part from the class name
        fetch(`http://localhost:5678/api/works/${classNumber}`, {
            // fetch returns a Promise
            method: "DELETE",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then(() => {
                //.then() and .catch() functions are part of the Promise chain
                const figures = document.getElementsByClassName(className); // Get all elements with the given class
                const figureArray = Array.from(figures); // Convert the NodeList to an array
                figureArray.forEach((e) => e.remove()); // Remove all elements with the given class
            })
            .catch((error) => {
                console.error("Fetch error:", error);
            });
    }
}