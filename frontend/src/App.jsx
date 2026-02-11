import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<h2>Home Page</h2>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
