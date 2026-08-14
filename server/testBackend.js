const API_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("Starting backend verification tests...");

  try {
    // 1. Login as Admin
    console.log("1. Testing Login as Admin...");
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "Admin@12345",
      }),
    });
    const loginData = await loginRes.json();

    if (!loginData.success || !loginData.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
    }

    const adminToken = loginData.token;
    console.log("   Admin login successful. Token received.");

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    };

    // 2. Get profile
    console.log("2. Testing Get Profile...");
    const meRes = await fetch(`${API_URL}/auth/me`, { headers: authHeaders });
    const meData = await meRes.json();
    console.log(`   Logged in as: ${meData.user.name} (${meData.user.role})`);

    // 3. Create HR
    console.log("3. Testing HR creation...");
    const hrRes = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Sarah HR Manager",
        email: `hr.sarah_${Date.now()}@example.com`,
        password: "Password@123",
        role: "hr",
        department: "Human Resources",
        designation: "Senior HR Manager",
      }),
    });
    const hrData = await hrRes.json();
    if (!hrData.success) throw new Error(`HR creation failed: ${JSON.stringify(hrData)}`);
    const hrId = hrData.user._id;
    console.log(`   HR created with ID: ${hrId}`);

    // 4. Create Team Lead under HR
    console.log("4. Testing Team Lead creation under HR...");
    const tlRes = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "David Team Lead",
        email: `tl.david_${Date.now()}@example.com`,
        password: "Password@123",
        role: "team_lead",
        hrId: hrId,
        department: "Engineering",
        designation: "Tech Lead",
      }),
    });
    const tlData = await tlRes.json();
    if (!tlData.success) throw new Error(`Team Lead creation failed: ${JSON.stringify(tlData)}`);
    const tlId = tlData.user._id;
    console.log(`   Team Lead created with ID: ${tlId}`);

    // 5. Create Team Member under Team Lead
    console.log("5. Testing Team Member creation under Team Lead...");
    const tmRes = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Alex Developer",
        email: `member.alex_${Date.now()}@example.com`,
        password: "Password@123",
        role: "team_member",
        teamLeadId: tlId,
        department: "Engineering",
        designation: "Frontend Engineer",
      }),
    });
    const tmData = await tmRes.json();
    if (!tmData.success) throw new Error(`Team Member creation failed: ${JSON.stringify(tmData)}`);
    const tmId = tmData.user._id;
    console.log(`   Team Member created with ID: ${tmId}`);

    // 6. Create Project
    console.log("6. Testing Project creation...");
    const projRes = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Enterprise Admin Portal",
        code: `EAP-${Date.now()}`,
        description: "Core administration portal for enterprise clients",
        status: "active",
        startDate: new Date().toISOString(),
      }),
    });
    const projData = await projRes.json();
    if (!projData.success) throw new Error(`Project creation failed: ${JSON.stringify(projData)}`);
    const projId = projData.project._id;
    console.log(`   Project created with ID: ${projId}`);

    // 7. Assign HR to Project
    console.log("7. Assigning HR to Project...");
    const assignHrRes = await fetch(`${API_URL}/projects/${projId}/hr`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ hrId }),
    });
    const assignHrData = await assignHrRes.json();
    if (!assignHrData.success) throw new Error(`HR assignment failed: ${JSON.stringify(assignHrData)}`);

    // 8. Assign Team Lead to Project
    console.log("8. Assigning Team Lead to Project...");
    const assignTlRes = await fetch(`${API_URL}/projects/${projId}/team-leads`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ teamLeadId: tlId }),
    });
    const assignTlData = await assignTlRes.json();
    if (!assignTlData.success) throw new Error(`TL assignment failed: ${JSON.stringify(assignTlData)}`);

    // 9. Assign Team Member to Project
    console.log("9. Assigning Team Member to Project...");
    const assignTmRes = await fetch(`${API_URL}/projects/${projId}/members`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ memberId: tmId }),
    });
    const assignTmData = await assignTmRes.json();
    if (!assignTmData.success) throw new Error(`Member assignment failed: ${JSON.stringify(assignTmData)}`);

    // 10. Create Task and Assign to Team Member
    console.log("10. Testing Task creation...");
    const taskRes = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        title: "Build Responsive Navbar",
        description: "Implement dark glassmorphism navbar for desktop and mobile viewports",
        projectId: projId,
        assignedTo: tmId,
        priority: "high",
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      }),
    });
    const taskData = await taskRes.json();
    if (!taskData.success) throw new Error(`Task creation failed: ${JSON.stringify(taskData)}`);
    const taskId = taskData.task._id;
    console.log(`   Task created with ID: ${taskId}`);

    // 11. Update Task status
    console.log("11. Updating Task status to completed...");
    const updateTaskRes = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ status: "completed" }),
    });
    const updateTaskData = await updateTaskRes.json();
    if (!updateTaskData.success) throw new Error(`Task update failed: ${JSON.stringify(updateTaskData)}`);

    // 12. Fetch Dashboard Stats
    console.log("12. Fetching Dashboard Stats...");
    const statsRes = await fetch(`${API_URL}/stats`, { headers: authHeaders });
    const statsData = await statsRes.json();
    console.log("   Dashboard Stats:", statsData.stats);

    console.log("\nALL BACKEND API VERIFICATION TESTS PASSED SUCCESSFULLY! ✅");
  } catch (err) {
    console.error("\n❌ Test failed:", err.message);
  }
}

runTests();
