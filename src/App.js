import { BrowserRouter, Routes, Route } from "react-router-dom";
import flowerImg from "./assets/flower.png";

import Home from "./pages/Home";
import BookList from "./pages/BookList";
import NewBook from "./pages/NewBook";
import Borrow from "./pages/Borrow";
import Return from "./pages/Return";
import AdminHome from "./pages/AdminHome";
import Login from "./pages/Login";
import DeleteBook from "./pages/DeleteBook";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Header from "./components/Header";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <img
          src={flowerImg}
          alt="flower"
          style={{
            position: "fixed",
            right: "10px",
            bottom: "10px",
            width: "230px",
            opacity: 0.6,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <BookList />
              </ProtectedRoute>
            }
          />

          {/* ★ 先生用：書籍追加 */}
          <Route
            path="/admin/new-book"
            element={
              <AdminRoute>
                <NewBook />
              </AdminRoute>
            }
          />

          {/* ★ 先生用：書籍削除 */}
          <Route
            path="/admin/delete-book"
            element={
              <AdminRoute>
                <DeleteBook />
              </AdminRoute>
            }
          />

          {/* ★ 先生用：貸出状況一覧（BookList を利用） */}
          <Route
            path="/admin/borrow-status"
            element={
              <AdminRoute>
                <BookList />
              </AdminRoute>
            }
          />

          <Route
            path="/borrow"
            element={
              <ProtectedRoute>
                <Borrow />
              </ProtectedRoute>
            }
          />

          <Route
            path="/return"
            element={
              <ProtectedRoute>
                <Return />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminHome />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
