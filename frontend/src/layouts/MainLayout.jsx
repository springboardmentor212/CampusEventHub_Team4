import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <>
      <nav style={{ padding: "10px", background: "#222", color: "#fff" }}>
        CampusEventHub
      </nav>

      <div style={{ padding: "20px" }}>
        <Outlet />
      </div>

      <footer style={{ padding: "10px", background: "#eee" }}>
        © 2026 CampusEventHub
      </footer>
    </>
  );
}

export default MainLayout;
