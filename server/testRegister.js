async function testRegister() {
  console.log("Testing POST /api/auth/register...");
  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New Registered Employee",
        email: `new.employee_${Date.now()}@example.com`,
        password: "Password@123",
        role: "team_member",
        department: "Design",
        designation: "UI/UX Designer",
      }),
    });
    const data = await res.json();
    console.log("Register response:", data);
    if (data.success && data.token && data.user) {
      console.log("REGISTER API TEST PASSED SUCCESSFULY! ✅");
    } else {
      console.error("REGISTER API TEST FAILED ❌");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
testRegister();
