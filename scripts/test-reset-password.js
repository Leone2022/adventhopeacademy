(async () => {
  const token = "d241fb305f1bd844a8a576c2a462df0ed7c0e5567d0650debe316ac2afeeda13";
  const password = "NewPass123";
  try {
    const res = await fetch("http://localhost:3001/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Request failed:", err);
  }
})();
