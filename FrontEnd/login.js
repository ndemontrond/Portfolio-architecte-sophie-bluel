document.getElementById("loginForm").addEventListener("submit", login);

async function login(e) {
    e.preventDefault(); // No reloading of the page because of the form submission
    // Get the user's email and password from form input fields.
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
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
        const errorMessageElement = document.getElementById("error-message");
        errorMessageElement.textContent = error.message;
    }
}