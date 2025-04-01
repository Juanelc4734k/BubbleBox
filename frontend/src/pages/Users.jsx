import React, { useEffect, useState } from "react";
import User from "../components/users/User";
import { getUsers } from "../services/users";
import {
  getFriends,
  getFriendsBlocked,
  getRequestEarring,
} from "../services/friends";
import "../assets/css/user/user.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const loggedInUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === "all") {
          const fetchedUsers = await getUsers();
          const filteredUsers = fetchedUsers.filter(
            (user) =>
              user &&
              user.id !== parseInt(loggedInUserId) &&
              user.rol !== "administrador"
          );
          setUsers(filteredUsers);
        }

        if (activeTab === "friends") {
          const friendsData = await getFriends(loggedInUserId);
          setFriends(friendsData);
        }

        if (activeTab === "blocked") {
          const blockedData = await getFriendsBlocked(loggedInUserId);
          setBlockedUsers(blockedData);
        }

        if (activeTab === "requests") {
          const pendingData = await getRequestEarring(loggedInUserId);
          setPendingRequests(pendingData);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, [activeTab, loggedInUserId]);

  const getDisplayUsers = () => {
    switch (activeTab) {
      case "friends":
        return friends;
      case "blocked":
        return blockedUsers;
      case "requests":
        return pendingRequests;
      case "all":
      default:
        return users;
    }
  };

  const displayUsers = getDisplayUsers();

  return (
    <div className="conten-users">
      {/* Tab Navigation */}
      <div className="tabs-container-2">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Usuarios
          </button>
          <button
            className={`tab ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            Mis Amigos
          </button>
          <button
            className={`tab ${activeTab === "blocked" ? "active" : ""}`}
            onClick={() => setActiveTab("blocked")}
          >
            Bloqueados
          </button>
          <button
            className={`tab ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            Solicitudes
          </button>
        </div>
        <div className="tabs-contenDos">
          <button
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <i className="fa-solid fa-user"></i>
          </button>
          <button
            className={`tab ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            <i className="fa-solid fa-user-group"></i>
          </button>
          <button
            className={`tab ${activeTab === "blocked" ? "active" : ""}`}
            onClick={() => setActiveTab("blocked")}
          >
            <i className="fa-solid fa-user-minus"></i>
          </button>
          <button
            className={`tab ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <i className="fa-solid fa-user-plus"></i>
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="container-usuarios">
        {displayUsers && displayUsers.length > 0 ? (
          displayUsers.map((user) => (
            <div key={user.id || `${user.id_usuario1}-${user.id_usuario2}`}>
              <User user={user} tabType={activeTab} />
            </div>
          ))
        ) : (
          <div className="empty-state-container">
            <div className="empty-state-icon">
              {activeTab === "friends"
                ? "👥"
                : activeTab === "blocked"
                ? "🚫"
                : activeTab === "requests"
                ? "✉️"
                : "🔍"}
            </div>
            <p className="empty-state-message">
              {activeTab === "friends"
                ? "No tienes amigos para mostrar."
                : activeTab === "blocked"
                ? "No hay usuarios bloqueados."
                : activeTab === "requests"
                ? "No hay solicitudes pendientes."
                : "No hay usuarios para mostrar."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;